import type { Gpu } from "vgpu";
import {
	createIntroAtmosphereResources,
	type IntroAtmosphereState,
} from "./intro-atmosphere-resources";
import { renderIntroAtmosphere } from "./intro-atmosphere-frame";
import type { RendererResources } from "./resources";
import type { MeshInput } from "./types";

/** Calibrated canonical art plus shared physical aperture light, assembled before display. */
export function createIntroAtmosphere(gpu: Gpu, resources: RendererResources, mesh: MeshInput) {
	const state: IntroAtmosphereState = {
		...createIntroAtmosphereResources(gpu, resources, mesh),
		gpu,
		resources,
		display: undefined,
	};
	return {
		apertureMask: state.source.apertureMask,
		get targets() {
			return {
				...state.source.targets,
				stats: state.source.stats,
				scene: state.scene,
				bloom: state.bloom,
				display: {
					background: state.display?.background,
					foreground: state.display?.foreground,
					logo: state.display?.logo,
				},
			};
		},
		render: renderIntroAtmosphere.bind(undefined, state),
		dispose() {
			state.source.dispose();
			for (const t of [
				state.display?.background,
				state.display?.foreground,
				state.display?.logo,
				state.scene,
				state.bloom.read,
				state.bloom.write,
			])
				t?.color.destroy();
		},
	};
}
