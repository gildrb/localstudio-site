import { readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Connect, type Plugin } from "vite";
import * as v from "valibot";
import { handleApi, isApiPath } from "../worker/api.ts";
import { headersFile, redirectsFile } from "./cloudflare-config.ts";
import {
	agentDocument,
	agentDocuments,
	HOMEPAGE_LINK_HEADER,
	markdownTokenCount,
	wantsMarkdown,
} from "../src/agent/documents.ts";
import { notFoundHtml, notFoundMarkdown } from "../src/agent/pages.ts";
import { isRoutePath, markdownPages, normalizePath, redirectFor } from "../src/domain/route.ts";

const siteRenderer = v.object({
	render: v.pipe(v.function(), v.args(v.tuple([v.string()])), v.returns(v.promise())),
});
// vp dev may run its dev server from its own vite-plus-core copy beside the project's;
// instanceof guards (isRunnableDevEnvironment) fail across copies, so probe shapes.

/** Bridges a Connect request to the Worker's Fetch API handlers. */
async function serveApi(pathname: string, request: IncomingMessage, response: ServerResponse) {
	request.setEncoding("utf8");
	let source = "";
	for await (const chunk of request) {
		const value: unknown = chunk;
		if (typeof value !== "string") throw new TypeError("Expected a UTF-8 request body chunk.");
		source += value;
		if (Buffer.byteLength(source) > 1_048_576) {
			response.statusCode = 413;
			response.end("Request body too large");
			return;
		}
	}
	const headers = new Headers();
	for (const [name, value] of Object.entries(request.headers)) {
		if (typeof value === "string") headers.set(name, value);
	}
	const method = request.method ?? "GET";
	const apiResponse = await handleApi(
		new Request(new URL(pathname, "http://localstudio.invalid"), {
			method,
			headers,
			body: method === "GET" || method === "HEAD" ? null : source,
		}),
		pathname,
	);
	response.statusCode = apiResponse.status;
	apiResponse.headers.forEach((value, name) => response.setHeader(name, value));
	response.end(await apiResponse.text());
}

function siteMiddleware(development: boolean): Connect.NextHandleFunction {
	return (request, response, next) => {
		try {
			const url = new URL(request.url ?? "/", "http://localstudio.invalid");
			const pathname = normalizePath(url.pathname);
			const redirect = redirectFor(pathname);
			if (redirect !== null) {
				response.statusCode = 308;
				response.setHeader("Location", redirect);
				response.end();
				return;
			}

			if (isApiPath(pathname)) {
				serveApi(pathname, request, response).catch(next);
				return;
			}

			const markdown = wantsMarkdown(request.headers.accept ?? "");
			const documentPath = markdown ? (markdownPages().get(pathname) ?? pathname) : pathname;
			const document = agentDocument(documentPath);
			if (document !== null) {
				response.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
				response.setHeader("Content-Type", document.contentType);
				response.setHeader("Vary", "Accept");
				response.setHeader("Content-Signal", "search=yes, ai-input=yes, ai-train=yes");
				if (document.contentType.includes("text/markdown")) {
					response.setHeader("x-markdown-tokens", markdownTokenCount(document.body));
				}
				if (pathname === "/" || documentPath === "/index.md") {
					response.setHeader("Link", HOMEPAGE_LINK_HEADER);
				}
				response.end(request.method === "HEAD" ? undefined : document.body);
				return;
			}
			if (markdown) {
				response.statusCode = 404;
				response.setHeader("Content-Type", "text/markdown; charset=utf-8");
				response.end(request.method === "HEAD" ? undefined : notFoundMarkdown);
				return;
			}

			if (isRoutePath(pathname)) {
				response.setHeader("Vary", "Accept");
				response.setHeader("Content-Signal", "search=yes, ai-input=yes, ai-train=yes");
				if (pathname === "/") response.setHeader("Link", HOMEPAGE_LINK_HEADER);
				if (development) response.setHeader("Cache-Control", "no-store");
				// Keep HTML, assets, transforms, and HMR in Vite's own middleware stack.
				request.url = `/index.html${url.search}`;
			}
			next();
		} catch (error) {
			next(error);
		}
	};
}

const notFoundMiddleware: Connect.NextHandleFunction = (request, response, next) => {
	// Vite's index HTML transform runs after configureServer's post hooks.
	if (new URL(request.url ?? "/", "http://localstudio.invalid").pathname === "/index.html") {
		next();
		return;
	}
	response.statusCode = 404;
	response.setHeader("Content-Type", "text/html; charset=utf-8");
	response.end(request.method === "HEAD" ? undefined : notFoundHtml);
};

export function sitePlugin(): Plugin {
	return {
		name: "localstudio-site",
		generateBundle() {
			if (this.environment.name !== "client") return;
			for (const document of agentDocuments()) {
				this.emitFile({ type: "asset", fileName: document.path.slice(1), source: document.body });
			}
			// Cloudflare static asset rules; the Worker applies the same rules to its own responses.
			this.emitFile({ type: "asset", fileName: "_headers", source: headersFile });
			this.emitFile({ type: "asset", fileName: "_redirects", source: redirectsFile });
		},
		buildApp: {
			order: "post",
			async handler(builder) {
				const client = builder.environments["client"];
				const ssr = builder.environments["ssr"];
				if (client === undefined || ssr === undefined) {
					throw new Error("The site build requires client and ssr environments.");
				}
				if (!client.isBuilt) await builder.build(client);
				if (!ssr.isBuilt) await builder.build(ssr);
				const entry = path.resolve(ssr.config.root, ssr.config.build.outDir, "entry-server.mjs");
				const module: unknown = await import(pathToFileURL(entry).href);
				const { render } = v.parse(siteRenderer, module);
				const index = path.resolve(client.config.root, client.config.build.outDir, "index.html");
				const markup: unknown = await render(await readFile(index, "utf8"));
				await writeFile(index, v.parse(v.string(), markup));
				client.config.logger.info("prerendered homepage");
			},
		},
		transformIndexHtml: {
			order: "post",
			async handler(html, context) {
				if (context.server === undefined) return html;
				const environment: unknown = context.server.environments["ssr"];
				const runner: unknown =
					typeof environment === "object" && environment !== null && "runner" in environment
						? environment.runner
						: undefined;
				const importMethod = v.safeParse(
					v.function(),
					typeof runner === "object" && runner !== null && "import" in runner
						? runner.import
						: undefined,
				);
				if (!importMethod.success) {
					throw new Error("The site requires Vite's runnable ssr environment.");
				}
				// Call the method on the original runner; it depends on its receiver.
				const module: unknown = await importMethod.output.call(runner, "/src/entry-server.tsx");
				const { render } = v.parse(siteRenderer, module);
				const markup: unknown = await render(html);
				return v.parse(v.string(), markup);
			},
		},
		configureServer(server) {
			server.middlewares.use(siteMiddleware(true));
			return () => {
				server.middlewares.use(notFoundMiddleware);
			};
		},
		configurePreviewServer(server) {
			server.middlewares.use(siteMiddleware(false));
			return () => {
				server.middlewares.use(notFoundMiddleware);
			};
		},
	};
}
