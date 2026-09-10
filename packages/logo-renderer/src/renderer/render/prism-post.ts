// Prism landing post-processing, adapted under MIT. See ../shaders/prism/post/SOURCE.md.
// Host owns camera, light, depth, theme/room and beam exposure.
import type { Frame, Gpu } from "vgpu";
import { createPostPipelines } from "./prism-post-pipelines";
import { resizePostTargets, validatePostOutputs } from "./prism-post-targets";
import { renderPostBloom, cachePostPresentation } from "./prism-post-bloom";
import { presentPostLayers } from "./prism-post-present";
import type { PostArgs, PostState } from "./prism-post-types";

export function createPrismPostprocess(gpu: Gpu, lightSampler: GPUSampler) {
	const pipelines = createPostPipelines(gpu);
	const state: PostState = {
		gpu,
		lightSampler,
		pipelines,
		owned: [],
		size: [0, 0],
		combined: undefined,
		bloom: [],
		display: [],
		work: [],
		initialized: false,
		splitForeground: false,
		baseMode: false,
		disposed: false,
	};
	return {
		render: renderPost.bind(undefined, state),
		dispose() {
			if (state.disposed) return;
			state.disposed = true;
			// Single-sample/color-only targets have no hidden MSAA/depth attachments.
			for (const value of state.owned) value.color.destroy();
			state.owned.length = 0;
		},
	};
}

function renderPost(state: PostState, f: Frame, args: PostArgs) {
	if (state.disposed) throw new Error("Prism postprocess is disposed.");
	const nextSize = args.output.size;
	const nextSplit = args.foregroundOutput !== undefined;
	const composeBase = "baseBackground" in args;
	validatePostOutputs(args);
	const resized = state.size[0] !== nextSize[0] || state.size[1] !== nextSize[1];
	const combined = resizePostTargets(state, nextSize, resized, composeBase);
	state.size = [nextSize[0], nextSize[1]];
	const update =
		!state.initialized ||
		resized ||
		nextSplit !== state.splitForeground ||
		composeBase !== state.baseMode ||
		args.sceneChanged;
	state.splitForeground = nextSplit;
	state.baseMode = composeBase;
	if (update) {
		renderPostBloom(state, f, combined, args, composeBase);
		cachePostPresentation(state, f, args, nextSplit);
		state.initialized = true;
	}
	presentPostLayers(state, f, args, nextSplit);
}
