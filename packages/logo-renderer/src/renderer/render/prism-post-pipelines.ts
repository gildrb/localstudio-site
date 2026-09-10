import { effect, type Gpu } from "vgpu";
import { BLOOM_TAPS } from "./prism-post-kernels";
import { createLayerPipelines } from "./prism-post-layer-pipelines";
import combineWgsl from "../shaders/prism/post/combine.wgsl";
import extractWgsl from "../shaders/prism/post/bloom-extract.wgsl";
import blurWgsl from "../shaders/prism/post/bloom-blur.wgsl";
import pairedBlurWgsl from "../shaders/prism/post/bloom-blur-paired.wgsl";
import bloomCompositeWgsl from "../shaders/prism/post/bloom-composite.wgsl";
import downsampleWgsl from "../shaders/prism/post/particle-light-downsample.wgsl";

export function createPostPipelines(gpu: Gpu) {
	const combine = effect(gpu, combineWgsl, { label: "prism-post-combine-hdr" });
	const extract = effect(gpu, extractWgsl, { label: "prism-post-extract" });
	const blur = BLOOM_TAPS.map((_, level) =>
		[0, 1].map((axis) =>
			effect(gpu, axis === 0 && (level === 1 || level === 2) ? blurWgsl : pairedBlurWgsl, {
				label: `prism-post-blur-${level}-${axis}`,
			}),
		),
	);
	const downsample = effect(gpu, downsampleWgsl, { label: "prism-post-dust-light" });
	const bloomComposite = effect(gpu, bloomCompositeWgsl, { label: "prism-post-bloom-composite" });
	const layers = createLayerPipelines(gpu);
	return { combine, extract, blur, downsample, bloomComposite, layers };
}
