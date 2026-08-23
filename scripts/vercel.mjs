#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const command = process.argv[2] ?? "write";
const source = readFileSync(`${root}/src/agent/documents.ts`, "utf8");
const types = new Map();
for (const match of source.matchAll(
	/\{\s*path:\s*"([^"]+)"[\s\S]*?contentType:\s*([^,}\n]+)/g,
)) {
	const raw = match[2].trim();
	types.set(match[1], raw === "markdown" ? "text/markdown; charset=utf-8" : JSON.parse(raw));
}

function typeFor(path) {
	const value = types.get(path);
	if (!value) throw new Error(`missing content type for ${path}`);
	return value;
}

function headersFor(route, contentType, extra = []) {
	return {
		source: route,
		headers: [{ key: "Content-Type", value: contentType }, ...extra],
	};
}

const markdownExtra = [{ key: "Vary", value: "Accept" }];
const headers = [
	{
		source: "/",
		headers: [
			{ key: "Vary", value: "Accept" },
			{
				key: "Content-Signal",
				value: "search=yes, ai-input=yes, ai-train=yes",
			},
		],
	},
	headersFor("/robots.txt", typeFor("/robots.txt")),
	headersFor("/sitemap.xml", typeFor("/sitemap.xml")),
	headersFor("/(.*)\\.md", "text/markdown; charset=utf-8", markdownExtra),
	headersFor("/llms.txt", typeFor("/llms.txt")),
	headersFor("/llms-full.txt", typeFor("/llms-full.txt")),
	headersFor("/.well-known/llms.txt", typeFor("/.well-known/llms.txt")),
	headersFor("/.well-known/api-catalog", typeFor("/.well-known/api-catalog")),
	headersFor("/.well-known/agent-card.json", typeFor("/.well-known/agent-card.json")),
];

const body = `${JSON.stringify({ headers }, null, "\t")}\n`;
const dest = `${root}/vercel.json`;

if (command === "write") {
	writeFileSync(dest, body);
	console.log("wrote vercel.json");
} else if (command === "check") {
	const current = readFileSync(dest, "utf8");
	if (current !== body) {
		console.error("vercel.json is stale; run pnpm vercel:manifest");
		process.exit(1);
	}
	console.log("vercel.json ok");
} else {
	console.error(`unknown command: ${command}`);
	process.exit(1);
}
