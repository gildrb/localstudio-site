import { handleApi, isApiPath } from "./api.ts";
import {
	HTML_CONTENT_TYPE,
	NOT_FOUND_PATH,
	headersByPath,
	markdownByPath,
	redirects,
	rewrites,
} from "./routes.ts";

interface Env {
	readonly ASSETS: { fetch(request: Request): Promise<Response> };
}

function lookup<Value>(table: Readonly<Record<string, Value>>, key: string): Value | undefined {
	return Object.hasOwn(table, key) ? table[key] : undefined;
}

async function markdownResponse(
	request: Request,
	url: URL,
	pathname: string,
	env: Env,
): Promise<Response | null> {
	const accept = request.headers.get("accept") ?? "";
	if (!accept.includes("text/markdown") || accept.includes("text/html")) return null;
	const markdownPath = lookup(markdownByPath, pathname);
	if (markdownPath === undefined) return null;
	const upstream = await env.ASSETS.fetch(new Request(new URL(markdownPath, url.origin)));
	if (!upstream.ok) return null;
	const body = await upstream.text();
	return new Response(body, {
		headers: {
			"Cache-Control": "public, max-age=0, must-revalidate",
			"Content-Type": "text/markdown; charset=utf-8",
			Vary: "Accept",
			"x-markdown-tokens": String(Math.max(1, Math.ceil(body.length / 4))),
		},
	});
}

async function route(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const pathname =
		url.pathname !== "/" && url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
	const redirect = lookup(redirects, pathname);
	if (redirect !== undefined) return Response.redirect(new URL(redirect, url.origin).href, 308);
	const markdown = await markdownResponse(request, url, pathname, env);
	if (markdown !== null) return markdown;
	if (isApiPath(pathname)) return handleApi(request, pathname);
	const rewrite = lookup(rewrites, url.pathname);
	const asset = await env.ASSETS.fetch(
		rewrite === undefined
			? request
			: new Request(new URL(`${rewrite}${url.search}`, url.origin), request),
	);
	if (asset.status !== 404) return asset;
	const page = await env.ASSETS.fetch(new Request(new URL(NOT_FOUND_PATH, url.origin)));
	return new Response(page.body, { status: 404, headers: page.headers });
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const response = await route(request, env);
		const headers = { ...lookup(headersByPath, new URL(request.url).pathname) };
		// Static assets, rewrites, and the 404 page arrive as bare `text/html`.
		if (response.headers.get("content-type") === "text/html") {
			headers["Content-Type"] = HTML_CONTENT_TYPE;
		}
		if (Object.keys(headers).length === 0) return response;
		const decorated = new Response(response.body, response);
		for (const [name, value] of Object.entries(headers)) decorated.headers.set(name, value);
		return decorated;
	},
};
