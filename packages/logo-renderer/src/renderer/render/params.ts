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
import type { Bounds, ImprintRenderOptions, RenderControls, Vec3 } from "./types";

// ABI: must match shaders/shared/scene-params.wgsl (192 B / 48 f32).
export function writeParams(args: {
	controls: RenderControls;
	logicalWidth: number;
	logicalHeight: number;
	passKind: number;
	projectionPaddingRadius: number;
	imprint?: ImprintRenderOptions;
	meshBounds: Bounds;
	orbitTarget: Vec3;
	thicknessScale: number;
	isLight: boolean;
}) {
	const {
		controls,
		logicalWidth,
		logicalHeight,
		passKind,
		projectionPaddingRadius,
		imprint = {},
		meshBounds,
		orbitTarget,
		thicknessScale,
		isLight,
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
	const ascii0 = [
		Math.max(0, Math.min(1, imprint.progress ?? 0)),
		metrics.gridScale,
		Math.max(0.1, imprint.glyphScale ?? DEFAULT_IMPRINT_GLYPH_SCALE),
		imprint.time ?? 0,
	];
	const ascii1 = [
		imprint.mouse?.[0] ?? 0,
		imprint.mouse?.[1] ?? 0,
		metrics.originCell[0],
		metrics.originCell[1],
	];
	return {
		viewProj,
		cameraPos: eye,
		passKind,
		cameraRight: basis.right,
		fov: fovEff,
		cameraUp: basis.up,
		aspect,
		cameraForward: basis.forward,
		materialKind: MATERIAL_KIND[controls.material],
		thicknessScale,
		envYaw: controls.envYaw,
		envPitch: controls.envPitch,
		glassAbsorption: isLight ? 0 : 1,
		ascii0,
		ascii1,
		depthTransform: [1 + Math.max(0, Math.min(1, controls.depthOpening ?? 0)) * 0.12, 0, 0, 0],
	};
}
