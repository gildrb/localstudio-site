const markdownPages = new Map([
	["/", "/index.md"],
	["/product", "/product.md"],
	["/mobile", "/mobile.md"],
	["/docs", "/docs.md"],
	["/setup", "/setup.md"],
	["/agents", "/agents.md"],
	["/overview", "/overview.md"],
	["/download", "/download.md"],
	["/machine", "/machine.md"],
]);

const homepageLink = [
	'</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
	'<https://localstudio.ai/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
	'</llms.txt>; rel="describedby"; type="text/markdown"',
	'</index.md>; rel="alternate"; type="text/markdown"',
	'</docs>; rel="service-doc"; type="text/html"',
	'</docs.md>; rel="service-doc"; type="text/markdown"',
	'</.well-known/agent-card.json>; rel="service-desc"; type="application/json"',
	'</sitemap.xml>; rel="describedby"; type="application/xml"',
	'<https://localstudio.ai/>; rel="canonical"; type="text/html"',
].join(", ");

export const config = {
	matcher: [
		"/",
		"/product",
		"/mobile",
		"/docs",
		"/setup",
		"/agents",
		"/overview",
		"/download",
		"/machine",
	],
};

export default async function middleware(request) {
	const accept = request.headers.get("accept") ?? "";
	const wantsMarkdown =
		accept.includes("text/markdown") && !accept.includes("text/html");
	if (!wantsMarkdown) return;
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
	const markdownPath = markdownPages.get(pathname);
	if (markdownPath === undefined) return;
	const upstream = await fetch(new URL(markdownPath, url.origin));
	if (!upstream.ok) return;
	const body = await upstream.text();
	const headers = {
		"Cache-Control": "public, max-age=0, must-revalidate",
		"Content-Type": "text/markdown; charset=utf-8",
		Vary: "Accept",
		"x-markdown-tokens": String(Math.max(1, Math.ceil(body.length / 4))),
	};
	if (pathname === "/") {
		headers.Link = homepageLink;
	}
	return new Response(body, { status: 200, headers });
}
