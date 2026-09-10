import { expect, test } from "vite-plus/test";
import { readFileSync } from "node:fs";
const source = readFileSync("src/sections/KittyLitter.tsx", "utf8");
test("carousel uses interruptible 300ms Motion for clicks and drag settling", () => {
	for (const text of [
		"animate(carousel.scrollLeft, target, {",
		"duration: 0.3,",
		"ease: motion.ease,",
		"animateToIndex(index, true)",
		"animateToIndex(nextIndex)",
		"onRequestVisible={animateToIndex}",
		"if (reducedMotion || document.hidden)",
		"carousel.scrollLeft = target;",
		"carouselAnimation.current?.stop();",
		"dragState.current.startScroll - delta",
		"onPointerCancel=",
		"event.stopPropagation();",
	])
		expect(source).toContain(text);
	for (const text of ["motion.featureSwap", 'behavior: "smooth"', "setInterval"])
		expect(source).not.toContain(text);
});
