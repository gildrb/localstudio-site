import { draw, effect, type Gpu } from "vgpu";
import { DUST_PARTICLES } from "./prism-post-kernels";
import baseCompositeWgsl from "../shaders/prism/post/base-composite.wgsl";
import presentWgsl from "../shaders/prism/post/present.wgsl";
import copyWgsl from "../shaders/prism/post/copy.wgsl";
import outputWgsl from "../shaders/prism/post/output.wgsl";
import dustWgsl from "../shaders/prism/post/dust.wgsl";

export function createLayerPipelines(gpu: Gpu) {
	return [0, 1].map((layer) => ({
		present: effect(gpu, presentWgsl, { label: `prism-post-present-${layer}` }),
		copy: effect(gpu, copyWgsl, { label: `prism-post-copy-${layer}` }),
		output: effect(gpu, outputWgsl, { label: `prism-post-output-${layer}` }),
		baseComposite: effect(gpu, baseCompositeWgsl, {
			label: `illumination-base-composite-${layer}`,
		}),
		dust: draw(gpu, {
			shader: dustWgsl,
			vertices: 6,
			instances: DUST_PARTICLES,
			cull: "none",
			depth: false,
			blend: "additive",
			label: `prism-post-dust-${layer}`,
		}),
	}));
}
