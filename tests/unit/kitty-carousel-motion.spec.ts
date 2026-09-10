import { expect, test } from "vite-plus/test";
import { readFileSync } from "node:fs";
const source = [
	"src/sections/KittyLitter.tsx",
	"src/sections/KittyCarousel.tsx",
	"src/sections/KittyFeatureCard.tsx",
	"src/sections/use-kitty-carousel.ts",
	"src/sections/use-kitty-carousel-animation.ts",
	"src/sections/use-kitty-carousel-position.ts",
	"src/sections/kitty-carousel-drag.ts",
	"src/sections/kitty-carousel-metrics.ts",
]
	.map((path) => readFileSync(path, "utf8"))
	.join("\n");
test("carousel uses interruptible 300ms Motion for clicks and drag settling", () => {
	for (const text of [
		"animate(carousel.scrollLeft, target, {",
		"duration: 0.3,",
		"ease: motion.ease,",
		"animateToIndex(index, true)",
		"animateToIndex(nextIndex)",
		"onRequestVisible={animateToIndex}",
		"if (reducedMotion === true || document.hidden)",
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
