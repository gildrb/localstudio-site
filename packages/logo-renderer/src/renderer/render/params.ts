// TS-side uniform ABI writer for shared scene params.
// INVARIANT: Pure move from render.ts; keep shader ABI, binding order, and pixel output unchanged.
// Imported by render/renderer.ts and re-exported only through render.ts facade.

import {
	DEFAULT_IMPRINT_GLYPH_SCALE,
	DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
	MATERIAL_KIND,
} from "./constants";
import { cameraClipPlanes } from "./camera";
import { cameraBasis, degreesToRadians, lookAt, multiply, orbitEye, perspective } from "./math";
import { getPaddedRenderSize } from "./textures";
import { paintMappingMetrics } from "./pointer-mapping";
import type { Bounds, ImprintRenderOptions, Mat4, RenderControls, Vec3 } from "./types";

type SceneImprint = Readonly<
	Pick<
		ImprintRenderOptions,
		"progress" | "gridScaleMultiplier" | "glyphScale" | "time" | "mouse" | "devicePixelRatio"
	>
>;

// ABI: must match shaders/shared/scene-params.wgsl (192 B / 48 f32).
type SceneParametersInput = {
	controls: Readonly<RenderControls>;
	logicalWidth: number;
	logicalHeight: number;
	passKind: number;
	projectionPaddingRadius: number;
	imprint?: SceneImprint;
	meshBounds: Bounds;
	orbitTarget: Vec3;
	thicknessScale: number;
	isLight: boolean;
};

export function writeParams(args: Readonly<SceneParametersInput>) {
	const {
		controls,
		logicalWidth,
		logicalHeight,
		projectionPaddingRadius,
		imprint = {},
		meshBounds,
		orbitTarget,
	} = args;
	const padded = getPaddedRenderSize(logicalWidth, logicalHeight, projectionPaddingRadius);
	const fovRad = degreesToRadians(controls.fov);
	const verticalScale = padded.height / logicalHeight;
	const fovEff = 2 * Math.atan(verticalScale * Math.tan(fovRad * 0.5));
	const aspect = padded.width / padded.height;
	const eye = orbitEye(orbitTarget, controls.radius, controls.yaw, controls.pitch);
	const basis = cameraBasis(eye, orbitTarget);
	const clip = cameraClipPlanes(meshBounds, eye, basis.forward);
	const proj = perspective(fovEff, aspect, clip.near, clip.far);
	const view = lookAt(eye, orbitTarget, [0, 1, 0]);
	const viewProj = multiply(proj, view);
	const metrics = paintMappingMetrics(
		meshBounds,
		controls,
		logicalWidth,
		logicalHeight,
		imprint.gridScaleMultiplier ?? DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
		projectionPaddingRadius,
		imprint.devicePixelRatio,
	);
	return uniformData(args, viewProj, eye, basis, fovEff, aspect, metrics, imprint);
}

function uniformData(
	args: Readonly<SceneParametersInput>,
	viewProj: Readonly<Mat4<Readonly<ArrayBufferLike>>>,
	eye: Vec3,
	basis: Readonly<ReturnType<typeof cameraBasis>>,
	fovEff: number,
	aspect: number,
	metrics: Readonly<ReturnType<typeof paintMappingMetrics>>,
	imprint: SceneImprint,
) {
	const { controls } = args;
	return {
		viewProj,
		cameraPos: eye,
		passKind: args.passKind,
		cameraRight: basis.right,
		fov: fovEff,
		cameraUp: basis.up,
		aspect,
		cameraForward: basis.forward,
		materialKind: MATERIAL_KIND[controls.material],
		thicknessScale: args.thicknessScale,
		envYaw: controls.envYaw,
		envPitch: controls.envPitch,
		glassAbsorption: args.isLight ? 0 : 1,
		ascii0: imprintStyle(imprint, metrics.gridScale),
		ascii1: imprintPointer(imprint, metrics.originCell),
		depthTransform: [1 + Math.max(0, Math.min(1, controls.depthOpening ?? 0)) * 0.12, 0, 0, 0],
	};
}

function imprintStyle(imprint: SceneImprint, gridScale: number) {
	return [
		Math.max(0, Math.min(1, imprint.progress ?? 0)),
		gridScale,
		Math.max(0.1, imprint.glyphScale ?? DEFAULT_IMPRINT_GLYPH_SCALE),
		imprint.time ?? 0,
	];
}

function imprintPointer(imprint: SceneImprint, originCell: readonly [number, number]) {
	return [imprint.mouse?.[0] ?? 0, imprint.mouse?.[1] ?? 0, originCell[0], originCell[1]];
}
