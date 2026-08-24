import { markdownPages, redirects } from "./src/domain/route.ts";
import {
	HOMEPAGE_LINK_HEADER,
	wantsMarkdown as acceptWantsMarkdown,
	markdownTokenCount,
} from "./src/agent/documents.ts";

const markdownByPath = markdownPages();

// Vercel requires a statically analyzable matcher. The handler still no-ops
// for paths that are not redirects or canonical markdown requests.
export const config = {
	matcher: "/(.*)",
};

export default async function middleware(request) {
	let url;
	try {
		url = new URL(request.url);
	} catch {
		return new Response("Invalid request URL\n", {
			status: 400,
			headers: { "Content-Type": "text/plain; charset=utf-8" },
		});
	}
	const pathname =
		url.pathname !== "/" && url.pathname.endsWith("/")
			? url.pathname.slice(0, -1)
			: url.pathname;
	const redirect = redirects[pathname];
	if (redirect) {
		return Response.redirect(new URL(redirect, url.origin), 308);
	}
	const accept = request.headers.get("accept") ?? "";
	if (!acceptWantsMarkdown(accept)) return;
	const markdownPath = markdownByPath.get(pathname);
	if (markdownPath === undefined) return;
	const upstream = await fetch(new URL(markdownPath, url.origin));
	if (!upstream.ok) return;
	const body = await upstream.text();
	const headers = {
		"Cache-Control": "public, max-age=0, must-revalidate",
		"Content-Type": "text/markdown; charset=utf-8",
		Vary: "Accept",
		"x-markdown-tokens": markdownTokenCount(body),
	};
	if (pathname === "/") {
		headers.Link = HOMEPAGE_LINK_HEADER;
	}
	return new Response(body, { status: 200, headers });
}
