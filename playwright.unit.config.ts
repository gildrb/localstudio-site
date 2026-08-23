import { defineConfig } from "@playwright/test";

export default defineConfig({
	testMatch: /unit-.*\.spec\.ts/,
	fullyParallel: true,
});
