import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

function number(source, pattern, label) {
	const value = source.match(pattern)?.[1];
	if (!value) throw new Error(`Missing ${label}`);
	return Number.parseInt(value, 10);
}

test("LS-DESIGN tracks the React showcase registry and shared frame", () => {
	const design = read("LS-DESIGN.md");
	const scenesSource = read("src/sections/story/scenes.ts");
	const featuresSource = read("src/content/product-features.tsx");
	const frameSource = read("src/sections/story/demo-frame.ts");
	const heroSource = read("src/sections/HeroDemo.tsx");
	const scenes = [...scenesSource.matchAll(/^\s*\| "([^"]+)"/gm)].map(
		(match) => match[1],
	);
	const featureSlugs = [...featuresSource.matchAll(/slug: "([^"]+)"/g)].map(
		(match) => match[1],
	);

	expect(scenes).toEqual(["control", "serve", "work", "automate", "configure"]);
	expect(featureSlugs).toEqual(scenes);
	for (const scene of scenes) {
		expect(design).toContain(`| \`${scene}\` |`);
		expect(read(`src/sections/story/${scene}-demo.tsx`)).toContain(
			"crop={STORY_CROP}",
		);
	}

	const width = number(
		frameSource,
		/export const DEMO_WIDTH = (\d+)/,
		"story width",
	);
	const height = number(
		frameSource,
		/export const DEMO_HEIGHT = (\d+)/,
		"story height",
	);
	const fit = number(frameSource, /\bfit: (\d+)/, "desktop fit");
	const mobileFit = number(frameSource, /mobileFit: (\d+)/, "mobile fit");
	const mobileCrop = number(frameSource, /mobileCropH: (\d+)/, "mobile crop");
	expect(design).toContain(`| Render plane | \`${width} × ${height}px\` |`);
	expect(design).toContain(`| Desktop scene fit | \`${fit}px\` |`);
	expect(design).toContain(`| Mobile scene fit | \`${mobileFit}px\` |`);
	expect(design).toContain(`| Mobile crop height | \`${mobileCrop}px\` |`);

	const heroWidth = number(
		heroSource,
		/const DEMO_WIDTH = (\d+)/,
		"hero width",
	);
	const heroHeight = number(
		heroSource,
		/const DEMO_HEIGHT = (\d+)/,
		"hero height",
	);
	const heroFit = number(heroSource, /const DEMO_FIT = (\d+)/, "hero fit");
	expect(design).toContain(
		`| Logical canvas | \`${heroWidth} × ${heroHeight}px\` |`,
	);
	expect(design).toContain(`| Mobile fit width | \`${heroFit}px\` |`);
});

test("showcase examples retain product-source provenance", () => {
	const design = read("LS-DESIGN.md");
	const modelIndex = JSON.parse(read("src/ls-contracts/model-index.json"));
	const modelIds = new Set(
		modelIndex.tiers.flatMap((tier) => tier.models.map((model) => model.id)),
	);
	const serveSource = read("src/sections/story/serve-demo.tsx");
	const featuredIds = [...serveSource.matchAll(/\{ id: "([^"]+)", name:/g)].map(
		(match) => match[1],
	);
	for (const modelId of featuredIds) expect(modelIds.has(modelId)).toBe(true);

	const automateSource = read("src/sections/story/automate-demo.tsx");
	const editorSource = read(
		"src/ls/features/agent/automations/automation-editor.tsx",
	);
	const demoNames = [...automateSource.matchAll(/^\s*name: "([^"]+)",/gm)].map(
		(match) => match[1],
	);
	for (const name of demoNames)
		expect(editorSource).toContain(`name: "${name}"`);

	for (const file of [
		"src/styles/global.css",
		"src/styles/workbench-demo.css",
		"src/sections/ProductStory.tsx",
		"src/sections/story/demo-frame.ts",
		"src/sections/story/demo-shell.tsx",
	]) {
		expect(design).toContain(file);
	}
});

test("the generated Local Studio CSS projection is current and scoped", () => {
	execFileSync(
		process.execPath,
		["scripts/sync-ls-demo-styles.mjs", "--check"],
		{
			cwd: root,
			stdio: "pipe",
		},
	);
	const css = read("src/styles/ls-app.css");
	expect(css).not.toMatch(/^body\s*\{/m);
	expect(css).not.toMatch(/^a\s*\{/m);
	expect(css).not.toMatch(/^\*[,\s]/m);
	expect(css).toContain(".demo .message-content");
	expect(css).toContain(".demo *::before");
});
