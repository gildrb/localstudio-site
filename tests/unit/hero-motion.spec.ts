import { expect, test } from "vite-plus/test";
import { readFileSync } from "node:fs";

const hero = readFileSync("src/sections/Hero.tsx", "utf8");
const styles = [
	"src/styles/sections-styles.ts",
	"src/styles/hero-styles.ts",
	"src/styles/sponsor-styles.ts",
	"src/styles/story-styles.ts",
	"src/styles/kitty-styles.ts",
]
	.map((path) => readFileSync(path, "utf8"))
	.join("\n");
const renderer = readFileSync("packages/logo-renderer/src/renderer/index.tsx", "utf8");

test("hero copy and demo mount fully visible without entrance effects", () => {
	for (const token of [
		"HeroEntrance",
		"useAnimationControls",
		"useLayoutEffect",
		"motion/react",
		"Suspense",
		"lazy(",
	]) {
		expect(hero).not.toContain(token);
	}
	expect(hero).toContain('import { HeroDemo } from "@local-studio/demo-ui/hero"');
	expect(hero).toContain('id="product"');
});

test("reload shows covered atmosphere and framed logo until the first GPU frame", () => {
	const logo = readFileSync("src/logo/LocalAiLogo.tsx", "utf8").replaceAll(/\s+/gu, " ");
	expect(logo).toContain('useState<"loading" | "ready" | "fallback">("loading")');
	expect(logo.match(/status !== "ready" &&/gu)).toHaveLength(2);
	expect(logo).toContain("heroAtmospherePending");
	expect(logo).toContain("LogoPoster");
	expect(logo).toContain("heroAtmosphereDay");
	expect(styles).toContain('objectFit: "cover"');
	expect(logo).toContain('onPending={() => { setStatus("loading"); }}');
	expect(logo).toContain('onFallback={() => { setStatus("fallback"); }}');
	expect(renderer).not.toContain("fallbackPlaceholderTimerRef");
	expect(renderer).toContain("if (!state.cancelled) handleFallback()");
	const backdrop = styles.split("heroBackdrop: {")[1]?.split("heroAtmosphere:")[0] ?? "";
	expect(backdrop).not.toContain("animationName");
});

test("live logo stays hidden until the poster handoff and starts without depth deformation", () => {
	expect(renderer).toContain("const [fallbackVisible, setFallbackVisible] = useState(true)");
	expect(renderer).toContain("fallbackVisible && rendererStyles.canvasPending");
	expect(renderer).toContain("depthOpening: 0,");
	expect(renderer).not.toContain("depthOpening: depthReveal ? 1 : 0");
});

test("intro material clears empty apertures transparently", () => {
	const material = readFileSync(
		"packages/logo-renderer/src/renderer/render/intro-material.ts",
		"utf8",
	);
	expect(material).toContain("clearColor: [0, 0, 0, 0]");
});
