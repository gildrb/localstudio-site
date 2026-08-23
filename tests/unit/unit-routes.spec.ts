import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import {
	decideSameOriginNavigation,
	isRoutePath,
	normalizePath,
	redirectFor,
	routePaths,
} from "../../src/domain/route";

test("normalizePath strips a trailing slash except at root", () => {
	expect(normalizePath("/")).toBe("/");
	expect(normalizePath("/docs/")).toBe("/docs");
	expect(normalizePath("/docs")).toBe("/docs");
});

test("isRoutePath accepts only canonical HTML routes", () => {
	expect(isRoutePath("/")).toBe(true);
	expect(isRoutePath("/machine")).toBe(true);
	expect(isRoutePath("/mobile")).toBe(false);
	expect(isRoutePath("/agents")).toBe(false);
	expect(routePaths.includes("/product")).toBe(true);
});

test("redirects preserve compatibility paths", () => {
	expect(redirectFor("/mobile")).toBe("/#mobile");
	expect(redirectFor("/agents")).toBe("/setup");
	expect(redirectFor("/docs")).toBeNull();
});

test("same-origin link decisions stay pure", () => {
	expect(
		decideSameOriginNavigation("/docs", "https://localstudio.ai", "/"),
	).toEqual({ kind: "push", next: "/docs" });
	expect(
		decideSameOriginNavigation(
			"https://github.com/sybil-solutions/local-studio",
			"https://localstudio.ai",
			"/",
		),
	).toEqual({ kind: "external" });
	expect(
		decideSameOriginNavigation("/#mobile", "https://localstudio.ai", "/#mobile"),
	).toEqual({ kind: "hash", hash: "#mobile" });
	expect(
		decideSameOriginNavigation("/", "https://localstudio.ai", "/"),
	).toEqual({ kind: "top" });
});

test("every HTML route has a page module", () => {
	const source = readFileSync("src/app/pages.ts", "utf8");
	const names = [
		"homePath",
		"productPath",
		"docsPath",
		"setupPath",
		"downloadPath",
		"overviewPath",
		"machinePath",
	];
	for (const name of names) {
		expect(source.includes(`[${name}]`), name).toBe(true);
	}
});

test("design-manifest routes match the canonical route model", () => {
	const manifest = JSON.parse(readFileSync("design-manifest.json", "utf8"));
	expect(manifest.routes).toEqual([...routePaths]);
	expect(manifest.redirects).toEqual(["/mobile", "/agents"]);
	expect(manifest.motion).toEqual(["ease", "heroEnter", "quickFade", "featureSwap"]);
});
