#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const forbidden = [
	"src/styles/ls-app.css",
	"src/styles/ls",
	"src/ls",
	"src/ls-shared",
	"src/ls-contracts",
	"src/sections/story",
	"src/sections/HeroDemo.tsx",
	"src/agent/catalog.ts",
	"src/machine.ts",
	"src/routes.ts",
	"src/images.ts",
	"src/routing.ts",
];
const present = forbidden.filter((rel) => existsSync(join(root, rel)));
if (present.length) {
	console.error(`generated:check found leftover paths:\n${present.join("\n")}`);
	process.exit(1);
}
console.log("no leftover product-CSS projection or deleted spec paths");
