#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const command = process.argv[2] ?? "write";

function read(rel) {
	return readFileSync(`${root}/${rel}`, "utf8");
}

function objectKeys(source, name) {
	const match = source.match(new RegExp(`export const ${name} = \\{([\\s\\S]*?)\\n\\} as const`));
	if (!match) throw new Error(`missing ${name}`);
	return [...match[1].matchAll(/^\t([A-Za-z][\w]*)\s*:/gm)].map((item) => item[1]);
}

function quotedKeys(source, name) {
	const match = source.match(new RegExp(`export const ${name} = \\{([\\s\\S]*?)\\n\\} as const`));
	if (!match) throw new Error(`missing ${name}`);
	return [...match[1].matchAll(/^\t"([^"]+)"\s*:/gm)].map((item) => item[1]);
}

const architecture = JSON.parse(read("architecture.json"));
const manifest = {
	routes: quotedKeys(read("src/domain/route.ts"), "routes"),
	documents: quotedKeys(read("src/domain/route.ts"), "documents"),
	redirects: quotedKeys(read("src/domain/route.ts"), "redirects"),
	assets: objectKeys(read("src/domain/asset.ts"), "assets"),
	motion: objectKeys(read("src/domain/motion.ts"), "motion"),
	components: architecture.singleConsumerComponents,
};

const serialized = `${JSON.stringify(manifest, null, "\t")}\n`;
const hash = createHash("sha256").update(serialized).digest("hex");
const output = {
	hash,
	...manifest,
};
const body = `${JSON.stringify(output, null, "\t")}\n`;
const dest = `${root}/design-manifest.json`;

if (command === "write") {
	writeFileSync(dest, body);
	console.log(`wrote design-manifest.json ${hash}`);
} else if (command === "check") {
	const current = readFileSync(dest, "utf8");
	if (current !== body) {
		console.error("design-manifest.json is stale; run pnpm design:manifest");
		process.exit(1);
	}
	console.log(`design-manifest.json ${hash}`);
} else {
	console.error(`unknown command: ${command}`);
	process.exit(1);
}
