#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { workerRoutes, wranglerConfig } from "./cloudflare-config.ts";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/u, "");
const command = process.argv[2] ?? "write";
const outputs = [
	{ path: `${root}/wrangler.jsonc`, body: wranglerConfig },
	{ path: `${root}/worker/routes.ts`, body: workerRoutes },
];

if (command === "write") {
	for (const output of outputs) writeFileSync(output.path, output.body);
	console.log("wrote wrangler.jsonc and worker/routes.ts");
} else if (command === "check") {
	const stale = outputs.filter(({ path, body }) => readFileSync(path, "utf8") !== body);
	if (stale.length > 0) {
		console.error("Cloudflare outputs are stale; run vp run cloudflare:manifest");
		process.exit(1);
	}
	console.log("Cloudflare outputs ok");
} else {
	console.error(`unknown command: ${command}`);
	process.exit(1);
}
