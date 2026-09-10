import type { Frame, Target } from "vgpu";
import {
	BLOOM_FACTORS,
	BLOOM_SPREAD,
	BLOOM_STRENGTH,
	BLOOM_TAPS,
	BLOOM_THRESHOLD,
	KERNELS,
} from "./prism-post-kernels";
import type { PostArgs, PostState } from "./prism-post-types";

export function renderPostBloom(
	state: PostState,
	f: Frame,
	combined: Target,
	args: PostArgs,
	composeBase: boolean,
) {
	const { lightSampler, bloom } = state;
	const { combine, extract, bloomComposite } = state.pipelines;
	combine.set({
		backgroundTexture: args.background,
		foregroundTexture: args.foreground,
		lightSampler,
	});
	f.pass({ target: combined, clear: [0, 0, 0, 0] }, combine);
	extract.set({
		sourceTexture: combined,
		sourceSampler: lightSampler,
		params: { threshold: BLOOM_THRESHOLD },
	});
	f.pass({ target: bloom[0]!.vertical, clear: [0, 0, 0, 0] }, extract);
	// Additive-volume mode has no particles or particle-light passes.
	for (let level = 0; level < (composeBase ? 3 : 4); level++) {
		renderBloomLevel(state, f, combined, level);
	}
	bloomComposite.set({
		level0Texture: bloom[0]!.vertical,
		level1Texture: bloom[1]!.vertical,
		level2Texture: bloom[2]!.vertical,
		levelSampler: lightSampler,
		params: { radius: BLOOM_SPREAD, factors: BLOOM_FACTORS },
	});
	f.pass({ target: bloom[0]!.horizontal, clear: [0, 0, 0, 0] }, bloomComposite);
}

function renderBloomLevel(state: PostState, f: Frame, combined: Target, level: number) {
	const { bloom, size, lightSampler } = state;
	const { blur, downsample } = state.pipelines;
	const targets = bloom[level]!;
	if (level === 3) {
		downsample.set({
			sourceTexture: combined,
			sourceSampler: lightSampler,
			params: {
				sourceTexelSize: [1 / size[0], 1 / size[1]],
				sourceToTargetScale: [
					size[0] / targets.vertical.size[0],
					size[1] / targets.vertical.size[1],
				],
			},
		});
		f.pass({ target: targets.vertical, clear: [0, 0, 0, 0] }, downsample);
	}
	for (let axis = 0; axis < 2; axis++) {
		const destination = axis === 0 ? targets.horizontal : targets.vertical;
		const source =
			axis === 1
				? targets.horizontal
				: level === 0 || level === 3
					? targets.vertical
					: bloom[level - 1]!.vertical;
		const params = blurParameters(level, axis, destination);
		const shader = blur[level]![axis]!;
		shader.set({ sourceTexture: source, sourceSampler: lightSampler, params });
		f.pass({ target: destination, clear: [0, 0, 0, 0] }, shader);
	}
}

function blurParameters(level: number, axis: number, destination: Pick<Target, "size">) {
	const kernel = KERNELS[level]!;
	const common = {
		direction: axis === 0 ? [1, 0] : [0, 1],
		texelSize: [1 / destination.size[0], 1 / destination.size[1]],
	};
	return axis === 0 && (level === 1 || level === 2)
		? {
				...common,
				tapCount: BLOOM_TAPS[level],
				coefficients0: kernel.normalized.slice(0, 4),
				coefficients1: kernel.normalized.slice(4, 8),
				coefficients2: kernel.normalized.slice(8, 12),
				coefficients3: kernel.normalized.slice(12, 16),
				coefficients4: kernel.normalized.slice(16, 20),
				coefficients5: kernel.normalized.slice(20, 24),
			}
		: {
				...common,
				kernel: [kernel.normalized[0], kernel.pairCount, 0, 0],
				weights0: kernel.pairedWeights.slice(0, 4),
				weights1: kernel.pairedWeights.slice(4, 8),
				weights2: kernel.pairedWeights.slice(8, 12),
				offsets0: kernel.offsets.slice(0, 4),
				offsets1: kernel.offsets.slice(4, 8),
				offsets2: kernel.offsets.slice(8, 12),
			};
}

export function cachePostPresentation(
	state: PostState,
	f: Frame,
	args: PostArgs,
	nextSplit: boolean,
) {
	const { display, bloom, lightSampler } = state;
	const { layers } = state.pipelines;
	layers.forEach((layer, index) => {
		layer.present.set({
			backgroundTexture: args.background,
			foregroundTexture: args.foreground,
			bloomTexture: bloom[0]!.horizontal,
			lightSampler,
			params: {
				foreground: index,
				bloomStrength: BLOOM_STRENGTH,
				splitForeground: nextSplit ? 1 : 0,
			},
		});
		f.pass({ target: display[index]!, clear: [0, 0, 0, 0] }, layer.present);
	});
}
