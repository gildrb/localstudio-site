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
				find: "@local-studio/demo-ui",
				replacement: path.resolve(root, "packages/demo-ui/src/index.ts"),
			},
			{
				find: "@/store",
				replacement: path.resolve(root, "src/ls/stubs/store.ts"),
			},
			{
				find: "@/features/shell/local-profile",
				replacement: path.resolve(root, "src/ls/stubs/local-profile.tsx"),
			},
			{
				find: "@/features/agent/ui/terminal-panel",
				replacement: path.resolve(
					root,
					"src/ls/features/agent/ui/terminal-preload-stub.ts",
				),
			},
			{
				find: "@/features/agent/messages",
				replacement: path.resolve(root, "src/ls/stubs/messages"),
			},
			{
				find: "@/features/agent/tools/context",
				replacement: path.resolve(root, "src/ls/stubs/tools-context.ts"),
			},
			{
				find: "@/features/agent/models",
				replacement: path.resolve(root, "src/ls/stubs/models.ts"),
			},
			{
				find: "@/features/agent/runtime/types",
				replacement: path.resolve(root, "src/ls/stubs/runtime-types.ts"),
			},
			{
				find: "@/features/agent/workspace/types",
				replacement: path.resolve(root, "src/ls/stubs/workspace-types.ts"),
			},
			{
				find: "@/lib/types",
				replacement: path.resolve(root, "src/ls/stubs/lib-types.ts"),
			},
			{
				find: "next/link",
				replacement: path.resolve(root, "src/ls/stubs/next-link.tsx"),
			},
			{
				find: "next/navigation",
				replacement: path.resolve(root, "src/ls/stubs/next-navigation.ts"),
			},
			{
				find: "@local-studio/contracts",
				replacement: path.resolve(root, "src/ls-contracts"),
			},
			{
				find: "@shared",
				replacement: path.resolve(root, "src/ls-shared"),
			},
			{
				find: "@",
				replacement: path.resolve(root, "src/ls"),
			},
		],
	},
});
