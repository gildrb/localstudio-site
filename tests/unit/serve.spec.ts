import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "bun:test";
import { staticResponse } from "../../scripts/serve.mjs";

const directories: string[] = [];

afterEach(() => {
	for (const directory of directories.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

test("dev routes return a retry response while the build output is missing", async () => {
	const root = mkdtempSync(path.join(tmpdir(), "localstudio-serve-"));
	directories.push(root);

	const building = staticResponse("/", root, true);
	expect(building?.status).toBe(503);
	expect(building?.headers.get("retry-after")).toBe("1");
	expect(await building?.text()).toContain("Building");

	writeFileSync(path.join(root, "index.html"), "<body>Ready</body>");
	const ready = staticResponse("/", root, true);
	expect(ready?.status).toBe(200);
	expect(ready?.headers.get("cache-control")).toBe("no-store");
	expect(await ready?.text()).toContain("/__stamp");
});

test("preview routes still fail when the production build is missing", () => {
	const root = mkdtempSync(path.join(tmpdir(), "localstudio-serve-"));
	directories.push(root);

	expect(() => staticResponse("/", root, false)).toThrow(/ENOENT/);
});
