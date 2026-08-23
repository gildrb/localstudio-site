import { defineConfig } from "@playwright/test";

export default defineConfig({
	testMatch: /visual\.spec\.ts/,
	fullyParallel: true,
	expect: {
		toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
	},
	use: {
		baseURL: "http://127.0.0.1:4173",
		trace: "retain-on-failure",
	},
	webServer: {
		command: "pnpm preview --host 127.0.0.1 --port 4173",
		url: "http://127.0.0.1:4173",
		reuseExistingServer: false,
	},
});
