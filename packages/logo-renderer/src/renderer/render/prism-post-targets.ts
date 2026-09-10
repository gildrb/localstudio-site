import { target, type Target } from "vgpu";
import { BLOOM_DIVISORS } from "./prism-post-kernels";
import type { PostArgs, PostState } from "./prism-post-types";

export function validatePostOutputs(args: PostArgs) {
	const nextSize = args.output.size;
	const composeBase = "baseBackground" in args;
	if (composeBase) {
		for (const value of [args.baseBackground, args.baseForeground, args.coverage]) {
			if (value.size[0] !== nextSize[0] || value.size[1] !== nextSize[1]) {
				throw new Error("Illumination base, coverage and output sizes must match.");
			}
		}
		if (args.baseBackground === args.output || args.baseForeground === args.foregroundOutput) {
			throw new Error("Illumination base and output must be separate targets.");
		}
	}
	if (
		args.foregroundOutput &&
		(args.foregroundOutput.size[0] !== nextSize[0] || args.foregroundOutput.size[1] !== nextSize[1])
	) {
		throw new Error("Prism foreground and background output sizes must match.");
	}
}

export function resizePostTargets(
	state: PostState,
	nextSize: readonly [number, number],
	resized: boolean,
	composeBase: boolean,
): Target {
	if (!state.combined) state.combined = createPostTargets(state, nextSize);
	else if (resized) {
		state.combined.resize(nextSize);
		for (const value of [...state.display, ...state.work]) value.resize(nextSize);
		state.bloom.forEach((level, i) => {
			const divisor = BLOOM_DIVISORS[i]!;
			const dimensions: readonly [number, number] = [
				Math.max(1, Math.ceil(nextSize[0] / divisor)),
				Math.max(1, Math.ceil(nextSize[1] / divisor)),
			];
			level.horizontal.resize(dimensions);
			level.vertical.resize(dimensions);
		});
	}
	if (!composeBase && state.work.length === 0) {
		state.work = [0, 1].map((layer) => make(state, nextSize, `prism-post-work-${layer}`));
	}
	return state.combined;
}

function createPostTargets(state: PostState, nextSize: readonly [number, number]) {
	const combined = make(state, nextSize, "prism-post-combined-hdr");
	state.combined = combined;
	state.bloom = BLOOM_DIVISORS.map((divisor, level) => {
		const dimensions: readonly [number, number] = [
			Math.max(1, Math.ceil(nextSize[0] / divisor)),
			Math.max(1, Math.ceil(nextSize[1] / divisor)),
		];
		return {
			horizontal: make(state, dimensions, `prism-post-bloom-${level}-h`),
			vertical: make(state, dimensions, `prism-post-bloom-${level}-v`),
		};
	});
	state.display = [0, 1].map((layer) => make(state, nextSize, `prism-post-cache-${layer}`));
	return combined;
}

function make(state: PostState, dimensions: readonly [number, number], label: string) {
	const value = target(state.gpu, { size: dimensions, format: "rgba16float", label });
	state.owned.push(value);
	return value;
}
