import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default defineConfig([
	globalIgnores(["dist", "tools/oxlint/anti-slop", "packages/logo-renderer", "src/ls", "src/ls-shared", "src/ls-contracts"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2023,
			globals: globals.browser,
		},
	},
	{
		files: [
			"src/sections/localai-logo-shader/render/shaders.ts",
			"src/sections/localai-logo-shader/render/cubemap.ts",
		],
		rules: { "@typescript-eslint/triple-slash-reference": "off" },
	},
]);
