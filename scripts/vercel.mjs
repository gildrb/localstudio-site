#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { agentDocuments } from "../src/agent/documents.ts";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const command = process.argv[2] ?? "write";
const documents = agentDocuments();
const markdown = documents.find(({ path }) => path.endsWith(".md"));
if (!markdown) throw new Error("agent document registry has no markdown document");

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
	headersFor("/(.*)\\.md", markdown.contentType, markdownExtra),
	...documents
		.filter(({ path }) => !path.endsWith(".md"))
		.map(({ path, contentType }) => headersFor(path, contentType)),
];

const body = `${JSON.stringify(
	{ installCommand: "pnpm install --frozen-lockfile --ignore-scripts", headers },
	null,
	"\t",
)}\n`;
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
