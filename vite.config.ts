import { defineConfig } from "vite-plus";
import type { ConfigEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin/vite";
import { wgslVitePlugin } from "@vgpu/wgsl/loader-vite";
import { sitePlugin } from "./scripts/site-plugin";

const root = import.meta.dirname;
const unitTests = process.env["VITEST"] !== undefined && process.env["VITEST"] !== "";

export default defineConfig(({ command }: Readonly<ConfigEnv>) => ({
	...configuration,
	plugins: [
		!unitTests &&
			stylex({
				dev: command === "serve",
				runtimeInjection: false,
				useCSSLayers: true,
				unstable_moduleResolution: { type: "commonJS", rootDir: root },
			}),
		wgslVitePlugin(),
		!unitTests && react(),
		!unitTests && sitePlugin(),
	],
}));

const configuration = {
	appType: "mpa",
	check: { fmt: true, lint: true },
	server: { host: "127.0.0.1", port: 5173 },
	preview: { host: "127.0.0.1", port: 4173 },
	builder: {},
	build: {
		target: "esnext",
		cssCodeSplit: false,
		manifest: true,
		sourcemap: false,
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
		deps: { neverBundle: [/^vgpu(?:\/|$)/u, "pngjs"] },
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
			"tools/oxlint/anti-slop/**",
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
		categories: {
			correctness: "error",
			suspicious: "error",
			pedantic: "error",
		},
		plugins: ["typescript", "react", "unicorn", "oxc", "import"],
		options: {
			typeAware: true,
			typeCheck: true,
			denyWarnings: true,
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
			"tools/oxlint/anti-slop/**",
		],
		jsPlugins: [{ name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" }],
		rules: {
			// Keep type-safety diagnostics fatal across all authored source.
			"typescript/no-explicit-any": "error",
			"typescript/consistent-return": "error",
			"typescript/no-unsafe-type-assertion": "error",
			"typescript/no-unnecessary-type-assertion": "error",
			"typescript/no-unnecessary-type-conversion": "error",
			"typescript/no-unnecessary-boolean-literal-compare": "error",
			"typescript/no-base-to-string": "error",
			"typescript/restrict-template-expressions": "error",
			// automatic JSX runtime (jsx: react-jsx) makes React-in-scope moot
			"react/react-in-jsx-scope": "off",
			// side-effect imports (css entry, plugin registration) are intentional
			"import/no-unassigned-import": "off",
			// Hook dependency diagnostics are correctness failures.
			"react-hooks/exhaustive-deps": "error",
			"react/exhaustive-effect-dependencies": "error",
			// Keep scope and structure diagnostics fatal.
			"unicorn/consistent-function-scoping": "error",
			"anti-slop/no-chained-type-assertions": "error",
			"anti-slop/no-conditional-empty-object-spread": "error",
			"anti-slop/no-known-value-widening": "error",
			"anti-slop/no-module-mocking": "error",
			"anti-slop/no-object-parameters": "error",
			"anti-slop/no-reflect-apply": "error",
			"anti-slop/no-reflect-get": "error",
			"anti-slop/no-runtime-typeof": "error",
			"anti-slop/no-shape-in-symbol-names": "error",
			"anti-slop/no-unknown-parameters": "error",
			"anti-slop/no-unknown-returns": "error",
			"anti-slop/no-unknown-type-aliases": "error",
			"anti-slop/no-unsafe-dictionary-type": "error",
			"anti-slop/no-widen-then-assert": "error",
			"anti-slop/require-safety-comment-for-type-assertion": "error",
		},
		overrides: [
			{
				files: ["src/env.d.ts"],
				rules: {
					"typescript/triple-slash-reference": "off",
				},
			},
		],
	},
} satisfies UserConfig;
