import { STUDIO_BACKLIGHT_POSITION } from "../env-lights";
import { cameraBasis, dot, lookAt, multiply, perspective, sub } from "../math";
import { normalizedMeshBounds } from "../mesh-gpu";
import type { Bounds, RenderControls, Vec3 } from "../types";

/** Fit every closed-mesh caster; outside-projector rays can then be truly open. */
export function illuminationSourceView(
	bounds: Bounds,
	controls: Readonly<RenderControls>,
	orbitTarget: Vec3,
	depthScale: number,
) {
			readonly position: Vec3;
			readonly viewProj: ReturnType<typeof multiply>;
	  })
	| undefined {
	const [x, y, z] = STUDIO_BACKLIGHT_POSITION;
	const cy = Math.cos(controls.envYaw),
		sy = Math.sin(controls.envYaw);
	const cp = Math.cos(controls.envPitch),
		sp = Math.sin(controls.envPitch);
	const py = y * cp + z * sp,
		pz = -y * sp + z * cp;
	const position: Vec3 = [x * cy + pz * sy, py, -x * sy + pz * cy];
	const basis = cameraBasis(position, orbitTarget);
	const normalized = normalizedMeshBounds(bounds);
	let outside = true;
	let slope = 0;
	let near = Infinity;
	let far = 0;
	for (let corner = 0; corner < 8; corner++) {
		const point: Vec3 = [
			(corner & 1 ? normalized.max : normalized.min)[0],
			(corner & 2 ? normalized.max : normalized.min)[1],
			(corner & 4 ? normalized.max : normalized.min)[2] * depthScale,
		];
		const relative = sub(point, position);
		const distance = dot(relative, basis.forward);
		// No dishonest unshadowed fallback if the source is inside an unsupported
		// model's bounds. This optional light fails closed; the approved base stays.
		if (distance <= 0.005) {
			outside = false;
			break;
		}
		near = Math.min(near, distance);
		far = Math.max(far, distance);
		slope = Math.max(
			slope,
			Math.abs(dot(relative, basis.right)) / distance,
			Math.abs(dot(relative, basis.up)) / distance,
		);
	}
	return outside ? sourceProjection(position, basis, orbitTarget, slope, near, far) : undefined;
}

function sourceProjection(position: Vec3, basis: Readonly<ReturnType<typeof cameraBasis>>, orbitTarget: Vec3, slope: number, near: number, far: number) {
	const fov = 2 * Math.atan(Math.max(0.01, slope) * 1.05);
	return {
		position,
		...basis,
		viewProj: multiply(
			perspective(fov, 1, Math.max(0.001, near * 0.5), far + 0.1),
			lookAt(position, orbitTarget, basis.up),
		),
	};
}
