// Bun runtime plugin for running the TypeScript renderer headless.
// Imported at the top of scripts that load renderer sources directly; it
// provides what the browser bundler provides: .wgsl imports export their
// fully resolved WGSL string. Bun itself resolves extensionless relative
// imports to .ts. The wgsl sources are pre-resolved before registration so
// the loader stays synchronous.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { plugin } from "bun";

const requireFromVgpu = createRequire(import.meta.resolve("vgpu/package.json"));
const { resolveShader } = requireFromVgpu("@vgpu/wgsl/runtime");

const shadersRoot = new URL("../src/renderer/shaders/", import.meta.url);
const wgslSources = new Map();
function collect(directory) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(entry.parentPath, entry.name);
		if (entry.isDirectory()) collect(path);
		else if (entry.name.endsWith(".wgsl"))
			wgslSources.set(pathToFileURL(path).href, null);
	}
}
collect(fileURLToPath(shadersRoot));
for (const url of wgslSources.keys()) {
	const resolved = await resolveShader({ entry: fileURLToPath(url) });
	wgslSources.set(url, { version: resolved.version ?? 1, wgsl: resolved.wgsl });
}

plugin({
	name: "wgsl",
	setup(builder) {
		builder.onLoad({ filter: /\.wgsl$/ }, (args) => ({
			exports: { default: wgslSources.get(pathToFileURL(args.path).href) },
			loader: "object",
		}));
	},
});
