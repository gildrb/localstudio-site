import { defineConfig } from "@playwright/test";

export default defineConfig({
	fullyParallel: true,
	use: {
		baseURL: "http://127.0.0.1:4173",
		trace: "retain-on-failure",
		// Tests exercise the settled hero, not the one-shot entrance video.
		initScript: "sessionStorage.setItem('hero-entrance-played', '1')",
	},
	webServer: {
		command: "pnpm preview --host 127.0.0.1 --port 4173",
		url: "http://127.0.0.1:4173",
		reuseExistingServer: false,
	},
});
