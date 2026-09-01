import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "bun:test";
import { sourceStamp } from "../../scripts/build.mjs";

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
