import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { agentReady } from "./agent-ready.plugin.ts";

export default defineConfig({
	appType: "spa",
	plugins: [react(), tailwindcss(), agentReady()],
});
