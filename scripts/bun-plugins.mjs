#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { plugin as registerRuntimePlugin } from "bun";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const { unpluginFactory } = createRequire(path.join(root, "package.json"))("@stylexjs/unplugin");
const { resolveShader } = createRequire(path.join(root, "packages/logo-renderer/package.json"))("@vgpu/wgsl/runtime");

export function createStylexTransform(dev) {
	const stylex = unpluginFactory(
		{
			dev,
			runtimeInjection: false,
			unstable_moduleResolution: { type: "commonJS", rootDir: root },
			useCSSLayers: true,
		},
		{ framework: "vite" },
	);
	return {
		async transform(source, file) {
			return (await stylex.transform.call({ meta: { watchMode: false } }, source, file))?.code;
		},
		collectCss() {
			// The unplugin merges a process-global rule store into each collection.
			// Bun rebuilds already transform the whole graph, so only this instance's
			// rules belong in its CSS. Collection is synchronous; restore the shared
			// store before any in-flight transform can resume.
			const shared = stylex.__stylexGetSharedStore();
			const rules = shared.rulesById;
			shared.rulesById = new Map();
			try {
				return stylex.__stylexCollectCss();
			} finally {
				shared.rulesById = rules;
			}
		},
	};
}

function wire(builder, stylex) {
	builder.onLoad({ filter: /\.wgsl$/ }, async ({ path: file }) => ({
		// Module shape identical to the official @vgpu/wgsl bundler loaders.
		contents: `export default { version: 1, wgsl: ${JSON.stringify((await resolveShader({ entry: file })).wgsl)} };`,
		loader: "js",
	}));
	builder.onLoad({ filter: /\.(tsx|ts)$/ }, async ({ path: file }) => {
		if (file.includes("/node_modules/")) return undefined;
		const raw = readFileSync(file, "utf8");
		let source = raw;
		if (raw.includes("@stylexjs/stylex") || raw.includes("stylex.")) {
			source = (await stylex.transform(source, file)) ?? source;
		}
		if (source.includes("?raw")) source = source.replace(/(\.[a-z]+)\?raw/g, "$1");
		return { contents: source, loader: "tsx" };
	});
	builder.onLoad({ filter: /\.(txt|md)(\?raw)?$/ }, ({ path: file }) => ({
		contents: `export default ${JSON.stringify(readFileSync(file.replace(/\?raw$/, ""), "utf8"))};`,
		loader: "js",
	}));
	builder.onLoad({ filter: /\.css(\?raw)?$/ }, () => ({ contents: "export default {}", loader: "js" }));
}

export function createBuildPipeline({ dev = false } = {}) {
	const stylex = createStylexTransform(dev);
	return {
		stylex,
		plugins: [
			{
				name: "localstudio-stylex-wgsl",
				setup(builder) {
					wire(builder, stylex);
				},
			},
		],
	};
}

export async function registerRuntimePipeline({ dev = false } = {}) {
	const stylex = createStylexTransform(dev);
	registerRuntimePlugin({
		name: "localstudio-stylex-wgsl",
		setup(builder) {
			wire(builder, stylex);
		},
	});
	return stylex;
}
