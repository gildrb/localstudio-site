import type { Gpu } from "vgpu";
import { createPrismAtmosphereResources, type PrismAtmosphereState } from "./atmosphere-resources";
import { renderPrismAtmosphere } from "./atmosphere-frame";
import type { RendererResources } from "../resources";
import type { MeshInput } from "../types";

/** Source-based, opt-in light graph; no material or cubemap policy lives here. */
export function createPrismAtmosphere(gpu: Gpu, r: RendererResources, mesh: MeshInput) {
	const state: PrismAtmosphereState = {
		...createPrismAtmosphereResources(gpu, r, mesh),
		r,
		cachedKey: "",
		lightKey: "",
		lightViewProj: new Float32Array(16),
		lightForward: [0, 0, 1],
		lightPosition: [0, 0, -1],
	};
	return {
		targets: {
			background: state.background,
			foreground: state.foreground,
			lightDepth: state.lightDepth,
		},
		render: renderPrismAtmosphere.bind(undefined, state),
		dispose() {
			state.ribbon.destroy();
			state.post.dispose();
			for (const value of [state.background, state.foreground, state.lightDepth]) {
				value.color.destroy();
				value.depth?.destroy();
			}
			// Target-private MSAA attachments are owned by the parent Gpu lifecycle.
		},
	};
}
