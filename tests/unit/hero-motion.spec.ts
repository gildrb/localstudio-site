import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { motion } from "../../src/domain/motion";

const hero = readFileSync("src/sections/Hero.tsx", "utf8");

test("hero stagger finishes within 300ms", () => {
	const delays = Array.from(hero.matchAll(/<HeroEntrance delay=\{([\d.]+)\}/gu), ([, delay]) => Number(delay));
	expect(delays).toEqual([0, 0.03, 0.06, 0.09]);
	for (const delay of delays) {
		expect(delay + motion.heroEnter.duration).toBeLessThanOrEqual(0.3);
	}
	for (const text of [
		"useAnimationControls()", "controls.set({ opacity, y: 12 * (1 - opacity)",
		"animate(0, 1, { ...motion.heroEnter, delay, onUpdate: update })", "update(reduced ? 1 : 0)",
	]) expect(hero).toContain(text);
});

test("reloads do not suppress the hero entrance", () => {
	for (const text of ["resumeAfterDevReload", "sessionStorage", 'getEntriesByType("navigation")']) {
		expect(hero).not.toContain(text);
	}
});
