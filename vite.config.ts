import { createRequire } from "node:module";
import path from "node:path";
import { wgslVitePlugin } from "@vgpu/wgsl/loader-vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type PluginOption } from "vite";
import { agentReady } from "./agent-ready.plugin.ts";

const root = import.meta.dirname;
// SAFETY: @stylexjs/unplugin 0.19 public types leak undeclared optional bundler packages; this assertion pins the exact official Vite adapter contract.
const stylex = createRequire(import.meta.url)("@stylexjs/unplugin/vite")
	.default as (options: {
	runtimeInjection: false;
	unstable_moduleResolution: { type: "commonJS"; rootDir: string };
	useCSSLayers: true;
}) => PluginOption;
// The @stylexjs/unplugin dev runtime swaps /virtual:stylex.css into the page only when it receives a
// 'stylex:css-update' ws event. The unplugin itself broadcasts that event only for HMR edits, so lazy
// route chunks that transform during a cold first load never refresh the stylesheet and the page stays
// styled by a stale snapshot until the next file edit. This watcher polls the plugin's collected CSS
// (falling back to module-graph growth) and broadcasts the same event, keeping dev styles complete.
function stylexDevCssWatch(): Plugin {
	let timer: ReturnType<typeof setInterval> | undefined;
	const stop = () => {
		if (timer) clearInterval(timer);
		timer = undefined;
	};
	return {
		name: "stylex-dev-css-watch",
		apply: "serve",
		configureServer(server) {
			if (server.config.server.middlewareMode) return;
			let lastCss = "";
			let lastModules = -1;
			const collectFrom = server.config.plugins.find(
				(plugin): plugin is Plugin & { __stylexCollectCss?: () => string } =>
					typeof plugin === "object" && "__stylexCollectCss" in plugin,
			);
			timer = setInterval(() => {
				let changed = false;
				try {
					const css = collectFrom?.__stylexCollectCss?.() ?? "";
					if (css && css !== lastCss) {
						lastCss = css;
						changed = true;
					}
				} catch {}
				const moduleCount =
					(
						server.moduleGraph as unknown as {
							urlToModuleMap?: Map<string, unknown>;
						}
					).urlToModuleMap?.size ?? 0;
				if (lastModules === -1) {
					lastModules = moduleCount;
				} else if (moduleCount !== lastModules) {
					lastModules = moduleCount;
					changed = true;
				}
				if (changed) {
					server.ws.send({ type: "custom", event: "stylex:css-update" });
				}
			}, 250);
			timer.unref();
			server.httpServer?.once("close", stop);
		},
		closeBundle: stop,
	};
}

export default defineConfig({
	appType: "spa",
	plugins: [
		stylex({
			runtimeInjection: false,
			unstable_moduleResolution: { type: "commonJS", rootDir: root },
			useCSSLayers: true,
		}),
		stylexDevCssWatch(),
		react(),
		wgslVitePlugin({ minify: true }),
		agentReady(),
	],
	resolve: {
		alias: [
			{
				find: "@local-ai/logo-renderer/react",
				replacement: path.resolve(
					root,
					"packages/logo-renderer/src/renderer/index.tsx",
				),
			},
			{
				find: "@local-studio/demo-ui/hero",
				replacement: path.resolve(
					root,
					"packages/demo-ui/src/hero/HeroDemo.tsx",
				),
			},
			{
				find: "@local-studio/demo-ui/story",
				replacement: path.resolve(
					root,
					"packages/demo-ui/src/story/FeatureDemo.tsx",
				),
			},
			{
				find: "@local-studio/demo-ui",
				replacement: path.resolve(root, "packages/demo-ui/src/index.ts"),
			},
		],
	},
});
