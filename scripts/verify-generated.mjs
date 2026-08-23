#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const result = spawnSync(process.execPath, ["scripts/sync-ls-demo-styles.mjs", "--check"], {
	cwd: root,
	stdio: "inherit",
});
process.exit(result.status ?? 1);
