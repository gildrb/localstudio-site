import { effect, pingPong, target, type Gpu, type Target } from "vgpu";
import airShader from "../shaders/postprocess/intro-air.wgsl";
import sceneShader from "../shaders/postprocess/intro-scene.wgsl";
import resolveShader from "../shaders/postprocess/intro-resolve.wgsl";
import { SCENE_FORMAT } from "./constants";
import { createIntroSource } from "./intro-source";
import { shaders } from "./shaders";
import type { RendererResources } from "./resources";
import type { MeshInput } from "./types";

export function createIntroAtmosphereResources(
	gpu: Gpu,
	resources: RendererResources,
	mesh: MeshInput,
) {
	const source = createIntroSource(gpu, resources, mesh);
	const near = effect(gpu, airShader, { label: "intro-canonical-near" });
	const rear = effect(gpu, airShader, { label: "intro-canonical-rear" });
	const assemble = effect(gpu, sceneShader, { label: "intro-scene-hdr-inputs" });
	const resolve = effect(gpu, resolveShader, { label: "intro-original-display-stack" });
	// Independent instances prevent parameter aliasing with the canonical passes in this frame.
	const displayResources = {
		...resources,
		pipelines: {
			...resources.pipelines,
			blurHorizontal: effect(gpu, shaders.bloomBlur, { label: "intro-original-bloom-horizontal" }),
			blurVertical: effect(gpu, shaders.bloomBlur, { label: "intro-original-bloom-vertical" }),
			composite: effect(gpu, shaders.bloomComposite, { label: "intro-original-composite" }),
		},
	};
	const scene = target(gpu, { size: [1, 1], format: SCENE_FORMAT, clearColor: [0, 0, 0, 0] });
	const bloom = pingPong(gpu, 1, 1, { format: SCENE_FORMAT, label: "intro-original-bloom" });
	return { source, near, rear, assemble, resolve, displayResources, scene, bloom };
}

export type IntroDisplay = {
	readonly background: Target;
	readonly foreground: Target;
	readonly logo: Target;
};

export type IntroAtmosphereState = ReturnType<typeof createIntroAtmosphereResources> & {
	readonly gpu: Gpu;
	readonly resources: RendererResources;
	display: IntroDisplay | undefined;
};
