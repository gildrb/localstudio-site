#!/usr/bin/env node
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/u, "");
const command = process.argv[2] ?? "write";
const dest = join(root, "asset-manifest.json");

const ROLE_BY_EXT = new Map([
	[".png", "image"],
	[".webp", "image"],
	[".jpeg", "image"],
	[".jpg", "image"],
	[".svg", "image"],
	[".ico", "icon"],
	[".woff2", "font"],
	[".bin", "mesh"],
	[".gltf", "mesh"],
]);

const TYPE_BY_EXT = new Map([
	[".png", "image/png"],
	[".webp", "image/webp"],
	[".jpeg", "image/jpeg"],
	[".jpg", "image/jpeg"],
	[".svg", "image/svg+xml"],
	[".ico", "image/x-icon"],
	[".woff2", "font/woff2"],
	[".bin", "application/octet-stream"],
	[".gltf", "model/gltf+json"],
]);

interface Dimensions {
	width: number;
	height: number;
}

function dimensionsFor(rel: string, raw: Buffer): Dimensions | null {
	const ext = extname(rel).toLowerCase();
	if (ext === ".png" && raw.subarray(0, 8).equals(Buffer.from("\u0089PNG\r\n\u001A\n", "binary"))) {
		return { width: raw.readUInt32BE(16), height: raw.readUInt32BE(20) };
	}
	if ((ext === ".jpg" || ext === ".jpeg") && raw.readUInt16BE(0) === 0xffd8) {
		let offset = 2;
		while (offset + 8 < raw.length) {
			if (raw[offset] !== 0xff) {
				offset += 1;
				continue;
			}
			while (raw[offset] === 0xff) offset += 1;
			const marker = raw[offset];
			if (marker === undefined) break;
			offset += 1;
			if (marker === 0xd9 || marker === 0xda) break;
			if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
			const length = raw.readUInt16BE(offset);
			const isStartOfFrame =
				marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
			if (isStartOfFrame) {
				return { width: raw.readUInt16BE(offset + 5), height: raw.readUInt16BE(offset + 3) };
			}
			offset += length;
		}
	}
	if (
		ext === ".webp" &&
		raw.toString("ascii", 0, 4) === "RIFF" &&
		raw.toString("ascii", 8, 12) === "WEBP"
	) {
		const fourcc = raw.toString("ascii", 12, 16);
		if (fourcc === "VP8X") {
			return {
				width: 1 + raw.readUIntLE(24, 3),
				height: 1 + raw.readUIntLE(27, 3),
			};
		}
		// Simple lossy (VP8): frame tag, sync code, then 14-bit LE dimensions.
		if (
			fourcc === "VP8 " &&
			raw.readUIntLE(16, 4) >= 10 &&
			raw[23] === 0x9d &&
			raw[24] === 0x01 &&
			raw[25] === 0x2a
		) {
			return {
				width: raw.readUInt16LE(26) & 0x3fff,
				height: raw.readUInt16LE(28) & 0x3fff,
			};
		}
		// Simple lossless (VP8L): signature byte, then packed 14-bit dimensions.
		if (fourcc === "VP8L" && raw.readUIntLE(16, 4) >= 5 && raw[20] === 0x2f) {
			const bits = raw.readUIntLE(21, 4);
			return {
				width: (bits & 0x3fff) + 1,
				height: ((bits >>> 14) & 0x3fff) + 1,
			};
		}
	}
	if (ext === ".svg") {
		const source = raw.toString("utf8", 0, 8192);
		const viewBox = source.match(
			/\bviewBox\s*=\s*["']\s*([\d.+-]+)[\s,]+([\d.+-]+)[\s,]+([\d.+-]+)[\s,]+([\d.+-]+)/iu,
		);
		if (viewBox !== null) return { width: Number(viewBox[3]), height: Number(viewBox[4]) };
		const width = source.match(/\bwidth\s*=\s*["']([\d.]+)/iu);
		const height = source.match(/\bheight\s*=\s*["']([\d.]+)/iu);
		if (width !== null && height !== null)
			return { width: Number(width[1]), height: Number(height[1]) };
	}
	return null;
}

function walk(directory: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(directory, { withFileTypes: true }).toSorted((a, b) =>
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

function roleFor(rel: string): string {
	const ext = extname(rel).toLowerCase();
	if (rel.startsWith("public/fonts/")) return "font";
	if (rel.startsWith("public/localai/") && (ext === ".bin" || ext === ".gltf")) {
		return "logo-mesh";
	}
	if (rel.includes("/sponsors/")) return "sponsor";
	if (rel.includes("favicon")) return "icon";
	return ROLE_BY_EXT.get(ext) ?? "binary";
}

const files = walk(join(root, "public"))
	.map((path) => {
		const rel = path
			.slice(root.length + 1)
			.split("\\")
			.join("/");
		const raw = readFileSync(path);
		return {
			path: rel,
			role: roleFor(rel),
			type: TYPE_BY_EXT.get(extname(rel).toLowerCase()) ?? "application/octet-stream",
			dimensions: dimensionsFor(rel, raw),
			bytes: raw.byteLength,
			sha256: createHash("sha256").update(raw).digest("hex"),
		};
	})
	.toSorted((a, b) => a.path.localeCompare(b.path));

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
	if (duplicateGroups.length > 0) {
		console.log(`duplicate content groups: ${duplicateGroups.length}`);
	}
} else if (command === "check") {
	const current = readFileSync(dest, "utf8");
	if (current !== body) {
		console.error("asset-manifest.json is stale; run vp run assets:manifest");
		process.exit(1);
	}
	if (duplicateGroups.length > 0) {
		console.error(
			`duplicate asset content is not allowlisted:\n${duplicateGroups.map((group) => group.join(" = ")).join("\n")}`,
		);
		process.exit(1);
	}
	console.log(`asset-manifest.json ok (${files.length} files)`);
} else {
	console.error(`unknown command: ${command}`);
	process.exit(1);
}
