#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const command = process.argv[2] ?? "write";
const dest = join(root, "asset-manifest.json");

const ROLE_BY_EXT = {
	".png": "image",
	".webp": "image",
	".jpeg": "image",
	".jpg": "image",
	".svg": "image",
	".ico": "icon",
	".woff2": "font",
	".bin": "mesh",
	".gltf": "mesh",
};

function walk(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
		a.name.localeCompare(b.name),
	)) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk(path));
			continue;
		}
		files.push(path);
	}
	return files;
}

function roleFor(rel) {
	if (rel.startsWith("public/fonts/")) return "font";
	if (rel.startsWith("public/localai/")) return "logo-mesh";
	if (rel.includes("/sponsors/")) return "sponsor";
	if (rel.includes("favicon")) return "icon";
	return ROLE_BY_EXT[extname(rel).toLowerCase()] ?? "binary";
}

const files = walk(join(root, "public"))
	.map((path) => {
		const rel = path.slice(root.length + 1).split("\\").join("/");
		const raw = readFileSync(path);
		return {
			path: rel,
			role: roleFor(rel),
			bytes: raw.byteLength,
			sha256: createHash("sha256").update(raw).digest("hex"),
		};
	})
	.sort((a, b) => a.path.localeCompare(b.path));

const hashes = files.map((file) => file.sha256);
const duplicates = hashes.filter((hash, index) => hashes.indexOf(hash) !== index);
const uniqueDuplicates = [...new Set(duplicates)];
const duplicateGroups = uniqueDuplicates.map((hash) =>
	files.filter((file) => file.sha256 === hash).map((file) => file.path),
);

const body = `${JSON.stringify({ files, duplicateGroups }, null, "\t")}\n`;

if (command === "write") {
	writeFileSync(dest, body);
	console.log(`wrote asset-manifest.json (${files.length} files)`);
	if (duplicateGroups.length) {
		console.log(`duplicate content groups: ${duplicateGroups.length}`);
	}
} else if (command === "check") {
	const current = readFileSync(dest, "utf8");
	if (current !== body) {
		console.error("asset-manifest.json is stale; run pnpm assets:manifest");
		process.exit(1);
	}
	console.log(`asset-manifest.json ok (${files.length} files)`);
} else {
	console.error(`unknown command: ${command}`);
	process.exit(1);
}
