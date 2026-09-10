import type { Frame, Gpu } from "vgpu";
import type { Texture } from "vgpu/core";
import { createIntroSourceResources, type IntroSourceState } from "./intro-source-resources";
import type { IntroAtmosphereLighting, IntroSceneParameters } from "./intro-inputs";
import type { RendererResources } from "./resources";
import type { MeshInput } from "./types";

/** Unit-radiance port responses. Activation never changes this transport cache. */
export function createIntroSource(gpu: Gpu, resources: RendererResources, mesh: MeshInput) {
	const state: IntroSourceState = {
		...createIntroSourceResources(gpu, resources, mesh),
		resources,
		key: "",
		shadowDepth: undefined,
		bakes: 0,
	};
	return {
		apertureMask: state.aperture.target,
		targets: { foreground: state.foreground, background: state.background, surface: state.surface },
		get stats() {
			return {
				bakes: state.bakes,
				sourceCount: 16,
				depthCount: 24,
				field: state.foreground.size,
				material: state.surface.size,
			};
		},
		render: renderIntroSource.bind(undefined, state),
		dispose() {
			state.aperture.dispose();
			state.visibility.dispose();
			state.shadows.dispose();
			state.sourceNodes.destroy();
			for (const t of [state.foreground, state.background, state.surface]) {
				t.color.destroy();
				t.depth?.destroy();
			}
		},
	};
}

function renderIntroSource(
	state: IntroSourceState,
	f: Frame,
	scene: Texture,
	depth: Texture,
	lighting: IntroAtmosphereLighting,
	outputSize: readonly [number, number],
	params: IntroSceneParameters,
) {
	const scale = Math.min(1, 640 / Math.max(...outputSize));
	const size = [
		Math.max(1, Math.round(outputSize[0] * scale)),
		Math.max(1, Math.round(outputSize[1] * scale)),
	] as const;
	const next = JSON.stringify({
		size,
		scene: scene.size,
		camera: lighting.params.camera,
		logo: lighting.params.logoRect,
		eye: params.cameraPos,
		right: params.cameraRight,
		up: params.cameraUp,
		forward: params.cameraForward,
		viewProj: params.viewProj,
		depth: params.depthTransform,
		env: [params.envYaw, params.envPitch],
	});
	if (next === state.key) return;
	state.aperture.render(f);
	const depthScale = params.depthTransform[0] ?? 1;
	if (state.shadowDepth !== depthScale) {
		state.shadows.render(f, depthScale);
		state.shadowDepth = depthScale;
	}
	state.foreground.resize(size);
	state.background.resize(size);
	state.surface.resize([scene.size[0], scene.size[1]]);
	bindSourceTransport(state, scene, depth, lighting, params);
	f.pass(state.foreground, state.nearPass);
	f.pass(state.background, state.rearPass);
	f.pass(state.surface, (pass) => {
		pass.draw(state.metalPass);
	});
	state.key = next;
	state.bakes++;
}

function bindSourceTransport(
	state: IntroSourceState,
	scene: Texture,
	depth: Texture,
	lighting: IntroAtmosphereLighting,
	params: IntroSceneParameters,
) {
	const { aperture, visibility, shadows, sourceNodes, nearPass, rearPass, metalPass, resources } =
		state;
	const physical = {
		camera: lighting.params.camera,
		logoRect: lighting.params.logoRect,
		apertureRect: aperture.rect,
		source: [0, 0, -2, 0.8],
		counts: [24, 16, 8, 0],
		medium: [1.8, 1, 0, 0],
	};
	const common = {
		params,
		physical,
		bvhNodes: visibility.bvhNodes,
		bvhTriangles: visibility.bvhTriangles,
		apertureMask: aperture.target.color.view,
		apertureSampler: resources.sampler,
		sourceNodes,
		sourceShadows: shadows.arrayView,
	};
	nearPass.set({ ...common, sceneTexture: scene.view, sceneDepth: depth.view });
	rearPass.set({
		...common,
		physical: { ...physical, medium: [1.8, 1, 0, 1] },
		sceneTexture: scene.view,
		sceneDepth: depth.view,
	});
	metalPass.set(common);
}
