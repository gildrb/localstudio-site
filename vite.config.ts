import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { wgslVitePlugin } from "@vgpu/wgsl/loader-vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { agentReady } from "./agent-ready.plugin.ts";

const root = import.meta.dirname;

export default defineConfig({
	appType: "spa",
	plugins: [react(), wgslVitePlugin({ minify: true }), tailwindcss(), agentReady()],
	resolve: {
		alias: [
			{
				find: "@local-studio/demo-ui/hero",
				replacement: path.resolve(root, "packages/demo-ui/src/hero/HeroDemo.tsx"),
			},
			{
				find: "@local-studio/demo-ui/story",
				replacement: path.resolve(root, "packages/demo-ui/src/story/FeatureDemo.tsx"),
			},
			{
				find: "@local-studio/demo-ui/styles.css",
				replacement: path.resolve(root, "packages/demo-ui/src/styles/workbench-demo.css"),
			},
			{
				find: "@local-studio/demo-ui",
				replacement: path.resolve(root, "packages/demo-ui/src/index.ts"),
			},
		],
	},
});
