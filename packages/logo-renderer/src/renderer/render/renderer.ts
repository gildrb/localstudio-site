// Eve renderer resource lifetime and public API on the public vgpu API.
import { frame, type Gpu } from "vgpu";
import { createPaintSystem } from "./paint-system";
import { createResources, disposeResources } from "./resources";
import { createBloomTargetCache } from "./targets";
import { renderGlass } from "./renderer-frame";
import { renderAtmosphereFrame } from "./renderer-atmosphere";
import type { RendererOptions, RendererState } from "./renderer-state";
import type { ImprintRenderOptions, MeshInput, RenderControls } from "./types";

export function createEve5Renderer(gpu: Gpu, mesh: MeshInput, options: RendererOptions = {}) {
	const r = createResources(gpu, mesh, options);
	const backRefraction = options.backRefraction ?? true;
	const cache = createBloomTargetCache(gpu);
	const paint = createPaintSystem(gpu, r, mesh);
	const state: RendererState = {
		gpu,
		mesh,
		options,
		r,
		backRefraction,
		cache,
		paint,
		intro: undefined,
		latestScene: undefined,
		latestLogo: undefined,
		atmosphereDepth: undefined,
		atmosphereParams: undefined,
		prism: undefined,
		illumination: undefined,
		atmosphereCamera: [1, 1, 0, 1],
	};
	return {
		...rendererActions(state),
		/** Opt-in native diagnostics; no allocations until Prism is rendered. */
		get prismTargets() {
			return state.prism?.targets;
		},
		/** Last active added-light targets; gain zero uses the original direct path. */
		get illuminationTargets() {
			return state.illumination?.targets;
		},
		/** Exact model-plane RGB opening identity; allocated only for the intro. */
		get apertureMask() {
			return state.intro?.apertureMask;
		},
		/** Linear HDR fields for native diagnostics, never SDR canvas overlays. */
		get introTargets() {
			return state.intro?.targets;
		},
	};
}

function rendererActions(state: RendererState) {
	return {
		render: renderGlass.bind(undefined, state),
		/** Reuses the baseline mesh frame. An active intro has its own material-light pass. */
		renderAtmosphere(controls: Readonly<RenderControls>, imprint: ImprintRenderOptions) {
			if (!state.latestScene || !state.latestLogo || !state.atmosphereDepth || !imprint.atmosphere)
				return;
			const scene = state.latestScene.color;
			const depth = state.atmosphereDepth.color;
			frame(state.gpu, (f) => {
				renderAtmosphereFrame(state, f, scene, depth, controls, imprint, false);
			});
		},
		dispose() {
			state.intro?.dispose();
			state.intro = undefined;
			state.illumination?.dispose();
			state.illumination = undefined;
			state.prism?.dispose();
			state.prism = undefined;
			state.atmosphereParams = undefined;
			state.latestScene = undefined;
			state.latestLogo = undefined;
			state.atmosphereDepth?.color.destroy();
			state.atmosphereDepth?.depth?.destroy();
			state.atmosphereDepth = undefined;
			state.paint.dispose();
			state.cache.dispose();
			disposeResources(state.r);
		},
	};
}
