import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const hero = readFileSync("src/sections/Hero.tsx", "utf8");
const styles = readFileSync("src/styles/sections-styles.ts", "utf8");
const renderer = readFileSync("packages/logo-renderer/src/renderer/index.tsx", "utf8");

test("hero copy and demo mount fully visible without entrance effects", () => {
	for (const token of ["HeroEntrance", "useAnimationControls", "useLayoutEffect", "motion/react", "Suspense", "lazy("]) {
		expect(hero).not.toContain(token);
	}
	expect(hero).toContain('import { HeroDemo } from "@local-studio/demo-ui/hero"');
	expect(hero).toContain('id="product"');
});

test("background stays blank during GPU initialization instead of stretching a loading poster", () => {
	const logo = readFileSync("src/logo/LocalAiLogo.tsx", "utf8");
	expect(logo).toContain('useState<"loading" | "ready" | "fallback">("loading")');
	expect(logo.match(/status === "fallback" &&/g)).toHaveLength(2);
	expect(logo).toContain('onPending={() => setStatus("loading")}');
	expect(logo).toContain('onFallback={() => setStatus("fallback")}');
	expect(renderer).not.toContain("fallbackPlaceholderTimerRef");
	expect(renderer).toContain("if (!state.cancelled) handleFallback()");
	const backdrop = styles.split("heroBackdrop: {")[1]?.split("heroAtmosphere:")[0] ?? "";
	expect(backdrop).not.toContain("animationName");
});

test("live logo stays hidden until the poster handoff and starts without depth deformation", () => {
	expect(renderer).toContain("const [fallbackVisible, setFallbackVisible] = useState(true)");
	expect(renderer).toContain('canvasPending: { visibility: "hidden" }');
	expect(renderer).toContain("fallbackVisible && rendererStyles.canvasPending");
	expect(renderer).toContain("depthOpening: 0,");
	expect(renderer).not.toContain("depthOpening: depthReveal ? 1 : 0");
});
