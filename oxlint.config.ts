import { defineConfig } from "oxlint";

export default defineConfig({
	categories: {
		correctness: "error",
		suspicious: "error",
		pedantic: "warn",
	},
	plugins: ["typescript", "react", "react-hooks", "unicorn", "oxc", "import"],
	ignorePatterns: [
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
	jsPlugins: [
		{ name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
	],
	rules: {
		// automatic JSX runtime (jsx: react-jsx) makes React-in-scope moot
		"react/react-in-jsx-scope": "off",
		// side-effect imports (css entry, plugin registration) are intentional
		"import/no-unassigned-import": "off",
		// parity with the previous eslint policy (warn in react-hooks recommended)
		"react-hooks/exhaustive-deps": "warn",
		// __stylexCollectCss is @stylexjs/unplugin's public API name
		"eslint/no-underscore-dangle": "off",
		// placement advice, not correctness; surfaced as warnings
		"unicorn/consistent-function-scoping": "warn",
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
			files: [
				"src/env.d.ts",
				"src/sections/localai-logo-shader/render/shaders.ts",
				"src/sections/localai-logo-shader/render/cubemap.ts",
			],
			rules: { "typescript/triple-slash-reference": "off" },
		},
	],
});
