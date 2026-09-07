import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "bun:test";
import { sourceStamp } from "../../scripts/build.mjs";
import { createBuildPipeline } from "../../scripts/bun-plugins.mjs";

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
