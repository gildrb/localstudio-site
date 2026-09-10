import { readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isRunnableDevEnvironment, type Connect, type Plugin } from "vite";
import * as v from "valibot";
import notFoundHandler from "../api/[...path].ts";
import mcpHandler from "../api/mcp.ts";
import productsHandler from "../api/v1/products.ts";
import statusHandler from "../api/v1/status.ts";
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

async function serveApi(pathname: string, request: IncomingMessage, response: ServerResponse) {
	const apiPath = pathname === "/.well-known/mcp" ? "/api/mcp" : pathname;
	const handler =
		apiPath === "/api/v1/status"
			? statusHandler
			: apiPath === "/api/v1/products"
				? productsHandler
				: apiPath === "/api/mcp"
					? mcpHandler
					: notFoundHandler;
	if (apiPath !== "/api/mcp" || request.method !== "POST") {
		handler(request, response);
		return;
	}
	// Vercel supplies parsed JSON to its function handlers. Connect supplies a stream.
	request.setEncoding("utf8");
	let source = "";
	for await (const chunk of request) {
		const value: unknown = chunk;
		source += v.parse(v.string(), value);
		if (Buffer.byteLength(source) > 1_048_576) {
			response.statusCode = 413;
			response.end("Request body too large");
			return;
		}
	}
	try {
		const body: unknown = JSON.parse(source);
		handler({ method: "POST", body }, response);
	} catch (error) {
		if (!(error instanceof SyntaxError)) throw error;
		// The production handler reports an invalid JSON-RPC request for a missing body.
		handler(request, response);
	}
}

function serveDocument(
	request: Readonly<Pick<IncomingMessage, "method">>,
	response: Readonly<Pick<ServerResponse, "setHeader" | "end">>,
	pathname: string,
	document: NonNullable<ReturnType<typeof agentDocument>>,
): void {
	response.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
	response.setHeader("Content-Type", document.contentType);
	response.setHeader("Vary", "Accept");
	response.setHeader("Content-Signal", "search=yes, ai-input=yes, ai-train=yes");
	if (document.contentType.includes("text/markdown")) {
		response.setHeader("x-markdown-tokens", markdownTokenCount(document.body));
	}
	if (pathname === "/" || document.path === "/index.md") {
		response.setHeader("Link", HOMEPAGE_LINK_HEADER);
	}
	response.end(request.method === "HEAD" ? undefined : document.body);
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

			if (pathname.startsWith("/api/") || pathname === "/.well-known/mcp") {
				void serveApi(pathname, request, response).catch(next);
				return;
			}

			const markdown = wantsMarkdown(request.headers.accept ?? "");
			const documentPath = markdown ? (markdownPages().get(pathname) ?? pathname) : pathname;
			const document = agentDocument(documentPath);
			if (document !== null) {
				serveDocument(request, response, pathname, document);
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

const buildApp = {
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
} satisfies Plugin["buildApp"];

const transformIndexHtml = {
	order: "post",
	async handler(html, context) {
		if (context.server === undefined) return html;
		const ssr = context.server.environments["ssr"];
		if (ssr === undefined || !isRunnableDevEnvironment(ssr)) {
			throw new Error("The site requires Vite's runnable ssr environment.");
		}
		const { render } =
			await ssr.runner.import<typeof import("../src/entry-server.tsx")>("/src/entry-server.tsx");
		return render(html);
	},
} satisfies Plugin["transformIndexHtml"];

export function sitePlugin(): Plugin {
	return {
		name: "localstudio-site",
		generateBundle() {
			if (this.environment.name !== "client") return;
			for (const document of agentDocuments()) {
				this.emitFile({ type: "asset", fileName: document.path.slice(1), source: document.body });
			}
		},
		buildApp,
		transformIndexHtml,
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
