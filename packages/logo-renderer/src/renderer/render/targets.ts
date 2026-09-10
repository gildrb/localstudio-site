// Resize-sensitive public vgpu targets.
import { pingPong, target, type Gpu } from "vgpu";
import { BACK_CAMERA_DEPTH_FORMAT, BACK_DEPTH_FORMAT, SCENE_FORMAT } from "./constants";
import { getPaddedRenderSize } from "./textures";
import type { BloomTargets } from "./types";

function createBackTarget(
	gpu: Gpu,
	width: number,
	height: number,
	label: string,
	format: GPUTextureFormat = SCENE_FORMAT,
) {
	return target(gpu, {
		size: [width, height],
		format,
		depth: BACK_DEPTH_FORMAT,
		label,
	});
}

export function createBloomTargetCache(gpu: Gpu) {
	let targets: (BloomTargets & { paddingRadius: number }) | undefined;

	return {
		ensure(width: number, height: number, paddingRadius: number, includeBack: boolean) {
			const padded = getPaddedRenderSize(width, height, paddingRadius);
			const bloomSize = [
				Math.max(1, Math.ceil(padded.width / 2)),
				Math.max(1, Math.ceil(padded.height / 2)),
			] as const;

			if (!targets) {
				targets = createBloomTargets(gpu, padded, bloomSize, paddingRadius, includeBack);
				return targets;
			}

			const sizeChanged =
				targets.width !== padded.width ||
				targets.height !== padded.height ||
				targets.paddingRadius !== paddingRadius;
			if (sizeChanged) {
				targets.scene.resize([padded.width, padded.height]);
				targets.bloom.read.resize(bloomSize);
				targets.bloom.write.resize(bloomSize);
				targets.backMaterial?.resize([padded.width, padded.height]);
				targets.backDepth?.resize([padded.width, padded.height]);
				targets.width = padded.width;
				targets.height = padded.height;
				targets.paddingRadius = paddingRadius;
			}
			if (includeBack && !targets.backMaterial) {
				createBackTargets(gpu, targets, padded);
			}
			return targets;
		},
		dispose() {
			// Public vgpu targets own private attachments such as the scene MSAA texture.
			// The parent Gpu disposes them as one unit immediately after this renderer.
			targets = undefined;
		},
	};
}

function createBloomTargets(
	gpu: Gpu,
	padded: Readonly<ReturnType<typeof getPaddedRenderSize>>,
	bloomSize: readonly [number, number],
	paddingRadius: number,
	includeBack: boolean,
) {
	return {
		width: padded.width,
		height: padded.height,
		paddingRadius,
		scene: target(gpu, {
			size: [padded.width, padded.height],
			format: SCENE_FORMAT,
			depth: BACK_DEPTH_FORMAT,
			msaa: true,
			clearColor: [0, 0, 0, 0],
			label: "eve-5-scene-linear-hdr",
		}),
		backMaterial: includeBack
			? createBackTarget(gpu, padded.width, padded.height, "eve-5-back-material")
			: undefined,
		backDepth: includeBack
			? createBackTarget(
					gpu,
					padded.width,
					padded.height,
					"eve-5-back-depth",
					BACK_CAMERA_DEPTH_FORMAT,
				)
			: undefined,
		bloom: pingPong(gpu, bloomSize[0], bloomSize[1], {
			format: SCENE_FORMAT,
			label: "eve-5-bloom",
		}),
	};
}

function createBackTargets(
	gpu: Gpu,
	targets: BloomTargets,
	padded: Readonly<ReturnType<typeof getPaddedRenderSize>>,
) {
	targets.backMaterial = createBackTarget(gpu, padded.width, padded.height, "eve-5-back-material");
	targets.backDepth = createBackTarget(
		gpu,
		padded.width,
		padded.height,
		"eve-5-back-depth",
		BACK_CAMERA_DEPTH_FORMAT,
	);
}
