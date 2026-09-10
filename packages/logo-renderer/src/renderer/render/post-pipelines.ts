// Full-screen postprocess and paint effects, in the original creation order.
import { effect, type Gpu } from "vgpu";
import bloomBlur from "../shaders/bloom/blur.wgsl";
import bloomComposite from "../shaders/bloom/composite.wgsl";
import lightComposite from "../shaders/postprocess/light-composite.wgsl";
import heroAtmosphere from "../shaders/postprocess/hero-atmosphere.wgsl";
import preview from "../shaders/debug/render-target-preview.wgsl";
import paintUpdate from "../shaders/paint/paint-update.wgsl";
import paintDebug from "../shaders/paint/paint-debug.wgsl";
import voronoiNoiseUpdate from "../shaders/paint/voronoi-noise-update.wgsl";

export function createPostPipelines(gpu: Gpu) {
	return {
		blurHorizontal: effect(gpu, bloomBlur, {
			label: "eve-5-bloom-blur-horizontal",
		}),
		blurVertical: effect(gpu, bloomBlur, {
			label: "eve-5-bloom-blur-vertical",
		}),
		composite: effect(gpu, bloomComposite, {
			label: "eve-5-bloom-composite",
		}),
		lightComposite: effect(gpu, lightComposite, {
			label: "eve-5-light-composite",
		}),
		atmosphereForeground: effect(gpu, heroAtmosphere, {
			label: "eve-5-hero-atmosphere-foreground",
		}),
		atmosphere: effect(gpu, heroAtmosphere, {
			label: "eve-5-hero-atmosphere",
		}),
		preview: effect(gpu, preview, {
			label: "eve-5-render-target-preview",
		}),
		paintDecay: effect(gpu, paintUpdate, {
			label: "eve-5-paint-decay",
		}),
		paintDebug: effect(gpu, paintDebug, { label: "eve-5-paint-debug" }),
		voronoiNoise: effect(gpu, voronoiNoiseUpdate, {
			label: "eve-5-voronoi-noise",
		}),
	};
}
