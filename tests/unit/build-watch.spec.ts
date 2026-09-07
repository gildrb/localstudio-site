import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "bun:test";
import { sourceStamp } from "../../scripts/build.mjs";
import { createBuildPipeline, createStylexTransform } from "../../scripts/bun-plugins.mjs";

const directories: string[] = [];

afterEach(() => {
	for (const directory of directories.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

test("source stamps ignore read-only filesystem events", () => {
	const root = mkdtempSync(path.join(tmpdir(), "localstudio-watch-"));
	directories.push(root);
	const file = path.join(root, "asset.png");
	writeFileSync(file, "asset");
	const before = sourceStamp([root]);

	readFileSync(file);
	expect(sourceStamp([root])).toBe(before);

	writeFileSync(file, "changed asset");
	expect(sourceStamp([root])).not.toBe(before);
});


test("rebuild resolves changed WGSL dependencies", async () => {
	const root = mkdtempSync(path.join(tmpdir(), "localstudio-wgsl-"));
	directories.push(root);
	const entry = path.join(root, "main.ts");
	const dependency = path.join(root, "color.wgsl");
	writeFileSync(entry, 'export { default } from "./main.wgsl";');
	writeFileSync(path.join(root, "main.wgsl"), 'import { shade } from "./color.wgsl"; @fragment fn main() -> @location(0) vec4f { return shade(); }');
	for (const color of ["0.125", "0.875"]) {
		writeFileSync(dependency, `export fn shade() -> vec4f { return vec4f(${color}); }`);
		const { plugins } = createBuildPipeline({ dev: true });
		const result = await Bun.build({ entrypoints: [entry], target: "browser", plugins });
		expect(result.success).toBe(true);
		expect(await result.outputs[0]!.text()).toContain(color);
	}
});

// The upstream plugin shares rules globally, including rules from other builds.
test("StyleX CSS belongs only to the current pipeline", async () => {
	const first = createStylexTransform(true);
	const second = createStylexTransform(false);
	await first.transform(
		'import * as stylex from "@stylexjs/stylex"; export const styles = stylex.create({ text: { textShadow: "0 1px 7px red" } });',
		path.resolve("src/first-build.styles.ts"),
	);
	expect(first.collectCss()).toContain("text-shadow:");
	expect(second.collectCss()).toBe("");
	await second.transform(
		'import * as stylex from "@stylexjs/stylex"; export const styles = stylex.create({ text: { color: "blue" } });',
		path.resolve("src/second-build.styles.ts"),
	);
	expect(second.collectCss()).toContain("color:");
	expect(second.collectCss()).not.toContain("text-shadow:");
	expect(first.collectCss()).not.toContain("color:");
});

test("StyleX rebuild drops a module that no longer imports StyleX", async () => {
	const file = path.resolve("src/removed-build.styles.ts");
	const previous = createStylexTransform(true);
	await previous.transform(
		'import * as stylex from "@stylexjs/stylex"; export const styles = stylex.create({ text: { textShadow: "0 1px 9px red" } });',
		file,
	);
	expect(previous.collectCss()).toContain("text-shadow:");
	const next = createStylexTransform(true);
	await next.transform("export const styles = {};", file);
	expect(next.collectCss()).toBe("");
});


test("watch rebuilds reload plugins and stop in-flight children on exit", async () => {
	const root = mkdtempSync(path.join(tmpdir(), "localstudio-watch-process-"));
	directories.push(root);
	for (const directory of ["scripts", "src/agent", "packages", "public"]) {
		mkdirSync(path.join(root, directory), { recursive: true });
	}
	for (const file of ["package.json", "bun.lock", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json"]) {
		writeFileSync(path.join(root, file), file.endsWith(".json") ? "{}" : "");
	}
	cpSync(new URL("../../scripts/build.mjs", import.meta.url), path.join(root, "scripts/build.mjs"));
	writeFileSync(path.join(root, "src/agent/documents.ts"), "export const agentDocuments = () => [];");
	writeFileSync(path.join(root, "src/main.tsx"), 'console.log("entry");');
	writeFileSync(path.join(root, "index.html"), '<head></head><body><script type="module" src="/src/main.tsx"></script></body>');
	const plugin = path.join(root, "scripts/bun-plugins.mjs");
	writeFileSync(plugin, 'export const createBuildPipeline = () => ({ plugins: [], stylex: { collectCss: () => "first-build" } });');
	const watcher = Bun.spawn([process.execPath, "scripts/build.mjs", "--dev", "--watch"], {
		cwd: root,
		stdout: "pipe",
		stderr: "inherit",
		env: process.env,
	});
	const timeout = setTimeout(() => watcher.kill(), 10_000);
	const reader = watcher.stdout.getReader();
	const decoder = new TextDecoder();
	let output = "";
	async function until(marker: string) {
		while (!output.includes(marker)) {
			const { value, done } = await reader.read();
			if (done) throw new Error(`watcher stopped before ${marker}: ${output}`);
			output += decoder.decode(value, { stream: true });
		}
		output = output.slice(output.indexOf(marker) + marker.length);
	}
	try {
		await until("watching for changes...");
		const initial = readFileSync(path.join(root, "dist-dev/index.html"), "utf8");
		writeFileSync(plugin, 'export const createBuildPipeline = () => ({ plugins: [], stylex: { collectCss: () => "second-build" } });');
		await until("built ");
		const rebuilt = readFileSync(path.join(root, "dist-dev/index.html"), "utf8");
		expect(rebuilt).not.toBe(initial);
		const cssPath = rebuilt.match(/href="([^"]+\.css)"/u)?.[1];
		expect(cssPath).toBeDefined();
		expect(readFileSync(path.join(root, "dist-dev", cssPath!), "utf8")).toBe("second-build");

		// Reproduce the user sequence with the real WGSL and StyleX loaders:
		// change a shader, then change only a text shadow.
		symlinkSync(new URL("../../node_modules", import.meta.url), path.join(root, "node_modules"), "dir");
		writeFileSync(plugin, `export { createBuildPipeline } from ${JSON.stringify(new URL("../../scripts/bun-plugins.mjs", import.meta.url).href)};`);
		writeFileSync(path.join(root, "src/main.tsx"), `
			import * as stylex from "@stylexjs/stylex";
			import shader from "./main.wgsl";
			import { styles } from "./text.styles";
			console.log(shader, stylex.props(styles.text));
		`);
		let currentHtml = rebuilt;
		for (const [color, shadow, change] of [
			["0.125", "16px", "both"],
			["0.875", "16px", "shader"],
			["0.875", "32px", "style"],
		] as const) {
			if (change !== "style") {
				writeFileSync(path.join(root, "src/main.wgsl"), `@fragment fn main() -> @location(0) vec4f { return vec4f(${color}); }`);
			}
			if (change !== "shader") {
				writeFileSync(path.join(root, "src/text.styles.ts"), `
					import * as stylex from "@stylexjs/stylex";
					export const styles = stylex.create({ text: { textShadow: "0 1px ${shadow} red" } });
				`);
			}
			await until("built ");
			currentHtml = readFileSync(path.join(root, "dist-dev/index.html"), "utf8");
			const js = currentHtml.match(/src="([^"]+\.js)"/u)?.[1];
			const css = currentHtml.match(/href="([^"]+\.css)"/u)?.[1];
			expect(js).toBeDefined();
			expect(css).toBeDefined();
			expect(readFileSync(path.join(root, "dist-dev", js!), "utf8")).toContain(`vec4f(${color})`);
			expect(readFileSync(path.join(root, "dist-dev", css!), "utf8")).toContain(`text-shadow: 0 1px ${shadow} red`);
		}
		writeFileSync(plugin, `
			process.once("SIGTERM", () => { console.log("build stopped"); process.exit(0); });
			console.log("holding build");
			await new Promise((resolve) => setTimeout(resolve, 2_000));
			export const createBuildPipeline = () => ({ plugins: [], stylex: { collectCss: () => "late-build" } });
		`);
		await until("holding build");
		watcher.kill();
		await until("build stopped");
		expect(readFileSync(path.join(root, "dist-dev/index.html"), "utf8")).toBe(currentHtml);
	} finally {
		clearTimeout(timeout);
		watcher.kill();
		await watcher.exited;
		reader.releaseLock();
	}
}, 15_000);
