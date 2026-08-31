#!/usr/bin/env bun
// Static preview and dev server (replaces vite preview/dev): dist/ with
// Vercel-rewrite semantics, dev rebuilds dist-dev/ with live reload, and the
// agent surface (/api + markdown negotiation) that production serves through
// middleware.js and the api functions.
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routePaths } from "../src/domain/route.ts";
import {
	agentDocument,
	HOMEPAGE_LINK_HEADER,
	markdownPathFor,
	markdownTokenCount,
	wantsMarkdown,
} from "../src/agent/documents.ts";
import { apiProducts, apiStatus, jsonMethodNotAllowed, jsonNotFound } from "../src/agent/openapi.ts";
import { notFoundMarkdown } from "../src/agent/pages.ts";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const dev = process.argv.includes("--dev");
const flag = (name) => {
	const at = process.argv.indexOf(`--${name}`);
	return at !== -1 ? process.argv[at + 1] : undefined;
};
const host = flag("host") ?? "127.0.0.1";
const port = Number(flag("port") ?? (dev ? 5173 : 4173));
const serveRoot = path.join(root, dev ? "dist-dev" : "dist");
const TYPES = { html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8", css: "text/css; charset=utf-8", json: "application/json; charset=utf-8", md: "text/markdown; charset=utf-8", txt: "text/plain; charset=utf-8", xml: "application/xml; charset=utf-8", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", avif: "image/avif", webp: "image/webp", woff2: "font/woff2", gltf: "model/gltf+json", bin: "application/octet-stream" };
const HOME = { Link: HOMEPAGE_LINK_HEADER, Vary: "Accept", "Content-Signal": "search=yes, ai-input=yes, ai-train=yes" };
const RELOAD = '<script>fetch("/__stamp").then(r=>r.text()).then(s=>setInterval(async()=>{if(await fetch("/__stamp").then(r=>r.text())!==s)location.reload()},1e3))</script>';

const send = (file, status = 200, headers = {}) =>
	new Response(readFileSync(file), { status, headers: { "Content-Type": TYPES[file.split(".").pop()] ?? "application/octet-stream", ...headers } });

function agentResponse(request, pathname, accept) {
	if (pathname.startsWith("/api/")) {
		const body = pathname === "/api/v1/status" ? apiStatus : pathname === "/api/v1/products" ? apiProducts : jsonNotFound;
		if (body === jsonNotFound) return Response.json(body, { status: 404 });
		return request.method === "GET" ? Response.json(body) : Response.json(jsonMethodNotAllowed, { status: 405 });
	}
	const documentPath = wantsMarkdown(accept) ? markdownPathFor(pathname) : pathname;
	const document = agentDocument(documentPath);
	if (!document) {
		return wantsMarkdown(accept)
			? new Response(notFoundMarkdown, { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } })
			: null;
	}
	const headers = {
		"Cache-Control": "public, max-age=0, must-revalidate",
		"Content-Type": document.contentType,
		Vary: "Accept",
		"Content-Signal": "search=yes, ai-input=yes, ai-train=yes",
	};
	if (document.contentType.includes("text/markdown")) headers["x-markdown-tokens"] = markdownTokenCount(document.body);
	if (pathname === "/" || documentPath === "/index.md") Object.assign(headers, HOME);
	return new Response(document.body, { headers });
}

function staticResponse(pathname) {
	const file = path.join(serveRoot, pathname.slice(1));
	if (file.startsWith(serveRoot) && existsSync(file) && statSync(file).isFile()) return send(file);
	if (pathname === "/" || routePaths.includes(pathname)) {
		const index = path.join(serveRoot, "index.html");
		const headers = { "Content-Type": "text/html; charset=utf-8" };
		let html = readFileSync(index, "utf8");
		if (dev) {
			html = html.replace("</body>", `${RELOAD}</body>`);
			headers["Cache-Control"] = "no-store";
		} else Object.assign(headers, HOME);
		return new Response(html, { headers });
	}
	const notFound = path.join(serveRoot, "404.html");
	return existsSync(notFound) ? send(notFound, 404) : null;
}

function startServer() {
	const server = Bun.serve({
		host,
		port,
		fetch(request) {
			const url = new URL(request.url);
			if (dev && url.pathname === "/__stamp") {
				return new Response(String(statSync(path.join(serveRoot, "index.html")).mtimeMs), {
					headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
				});
			}
			let pathname = new URL(url.pathname + url.search, "http://localstudio.invalid").pathname;
			if (pathname !== "/" && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
			return (
				agentResponse(request, pathname, request.headers.get("accept") ?? "") ??
				staticResponse(pathname) ??
				new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain" } })
			);
		},
	});
	console.log(`${dev ? "dev" : "preview"} on http://${host}:${server.port} serving ${path.relative(root, serveRoot)}/`);
	if (!dev) return;
	const build = Bun.spawn([process.execPath, "scripts/build.mjs", "--dev", "--watch"], {
		cwd: root,
		stdout: "inherit",
		stderr: "inherit",
		env: process.env,
	});
	process.on("exit", () => build.kill());
}

if (import.meta.main) startServer();
