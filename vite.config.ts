import { defineConfig, lazyPlugins } from "vite-plus";
import { wgslVitePlugin } from "@vgpu/wgsl/loader-vite";

const root = import.meta.dirname;

export default defineConfig(({ command }) => ({
	appType: "mpa",
	// Resolve public raw SVGs through their served URL, not the /public filesystem path.
	resolve: { alias: { "#sponsor-svg": "/images/sponsors" } },
	plugins:
		lazyPlugins(async () => {
			if (process.env["VITEST"]) return [wgslVitePlugin()];
			const [{ default: stylex }, { default: react }, { sitePlugin }] = await Promise.all([
				import("@stylexjs/unplugin/vite"),
				import("@vitejs/plugin-react"),
				import("./scripts/site-plugin"),
			]);
			return [
				stylex({
					dev: command === "serve",
					runtimeInjection: false,
					useCSSLayers: true,
					unstable_moduleResolution: { type: "commonJS", rootDir: root },
				}),
				wgslVitePlugin(),
				react(),
				sitePlugin(),
			];
		}) ?? [],
	server: { host: "127.0.0.1", port: 5173 },
	preview: { host: "127.0.0.1", port: 4173 },
	builder: {},
	build: {
		target: "esnext",
		cssCodeSplit: false,
		manifest: true,
	},
	environments: {
		ssr: {
			resolve: { noExternal: ["@local-studio/demo-ui", "@local-ai/logo-renderer"] },
			build: {
				ssr: "src/entry-server.tsx",
				outDir: "node_modules/.cache/localstudio/ssr",
				copyPublicDir: false,
				emptyOutDir: true,
				manifest: false,
				rolldownOptions: { output: { entryFileNames: "entry-server.mjs" } },
			},
		},
	},
	pack: {
		entry: [
			"packages/logo-renderer/scripts/render-snapshot.ts",
			"packages/logo-renderer/scripts/render-atmosphere.ts",
		],
		outDir: "packages/logo-renderer/node_modules/.cache/render",
		format: ["esm"],
		platform: "node",
		dts: false,
		deps: { neverBundle: [/^vgpu(?:\/|$)/, "pngjs"] },
		plugins: [wgslVitePlugin({ minify: false })],
	},
	test: {
		include: ["tests/unit/**/*.spec.{ts,js}"],
		environment: "node",
	},
	fmt: {
		useTabs: true,
		ignorePatterns: [
			".agents/**",
			".playwright-mcp/**",
			"index.html",
			"middleware.ts",
			"vercel.json",
			"asset-manifest.json",
			"design-manifest.json",
			"public/**",
			"pnpm-lock.yaml",
		],
	},
	lint: {
		categories: { correctness: "error", suspicious: "error", pedantic: "off" },
		plugins: ["typescript", "react", "unicorn", "oxc", "import"],
		options: {
			typeAware: true,
			typeCheck: true,
			reportUnusedDisableDirectives: "error",
		},
		ignorePatterns: [
			"node_modules/**",
			"dist/**",
			".agent/**",
			".agents/**",
			".claude/**",
			".codex/**",
			".continue/**",
			".cursor/**",
			".gemini/**",
			".opencode/**",
			".pi/**",
			".roo/**",
			".windsurf/**",
		],
		rules: {
			// Preserve valid coercions, calibrated numeric constants and intentional scope.
			"typescript/consistent-return": "off",
			"typescript/no-base-to-string": "off",
			"typescript/no-unnecessary-type-conversion": "off",
			"typescript/no-unnecessary-boolean-literal-compare": "off",
			"typescript/restrict-template-expressions": "off",
			"unicorn/consistent-function-scoping": "off",
			"oxc/approx-constant": "off",
			"typescript/no-explicit-any": "error",
			"typescript/no-unsafe-assignment": "error",
			"typescript/no-unsafe-call": "error",
			"typescript/no-unsafe-member-access": "error",
			"typescript/no-unsafe-argument": "error",
			"typescript/no-unsafe-return": "error",
			"typescript/no-floating-promises": "error",
			"typescript/no-misused-promises": "warn",
			// Keep contextual fixture assertions and hook dependencies visible for review.
			"typescript/no-unsafe-type-assertion": "warn",
			"react-hooks/exhaustive-deps": "warn",
			"react/exhaustive-effect-dependencies": "off",
			"react/react-in-jsx-scope": "off",
			"import/no-unassigned-import": "off",
		},
		overrides: [
			{
				files: ["src/env.d.ts"],
				rules: { "typescript/triple-slash-reference": "off" },
			},
		],
	},
}));
