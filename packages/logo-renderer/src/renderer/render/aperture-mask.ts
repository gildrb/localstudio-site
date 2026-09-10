import { draw, geometry, target, type Frame, type Gpu } from "vgpu";
import shader from "../shaders/postprocess/aperture-mask.wgsl";
import { extractApertures, normalizeAperture } from "./apertures";
import type { MeshInput } from "./types";

/** Static model-plane identity, rasterized from every real hole boundary vertex. */
export function createApertureMask(gpu: Gpu, mesh: MeshInput) {
	const height = mesh.bounds.max[1] - mesh.bounds.min[1] || 1;
	const ratio = (mesh.bounds.max[0] - mesh.bounds.min[0]) / height;
	const aspect = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
	const rect = [-aspect / 2, -0.5, aspect, 1] as const;
	const { vertices, bounds } = apertureMaskVertices(mesh, aspect);
	const meshGeometry = geometry(gpu, {
		label: "hero-intro-exact-apertures",
		vertexCount: vertices.length / 5,
		buffers: [
			{
				data: vertices.length > 0 ? new Float32Array(vertices) : new Float32Array(5),
				stride: 20,
				attributes: { clipPosition: "float32x2", identity: "float32x3" },
			},
		],
	});
	const mask = createApertureMaskTarget(gpu, aspect);
	const raster = draw(gpu, { shader, geometry: meshGeometry, depth: false, cull: "none" });
	let rendered = false;
	return {
		target: mask,
		rect,
		bounds: vertices.length > 0 ? bounds : rect,
		render(f: Frame) {
			if (rendered) return;
			f.pass({ target: mask, clear: [0, 0, 0, 0] }, (pass) => {
				if (vertices.length > 0) pass.draw(raster);
			});
			rendered = true;
		},
		dispose() {
			meshGeometry.destroy();
			mask.color.destroy();
			mask.depth?.destroy();
		},
	};
}

function apertureMaskVertices(mesh: MeshInput, aspect: number) {
	const vertices: number[] = [];
	let maxX = -Infinity,
		maxY = -Infinity,
		minX = Infinity,
		minY = Infinity;
	const holes = extractApertures(mesh);
	// This choreography is for the three-opening mark. Other/invalid meshes fail closed.
	if (holes.length === 3) {
		for (const [index, hole] of holes.entries()) {
			const section = normalizeAperture(hole, mesh.bounds);
			if (section === null) continue;
			const { center, points } = section;
			for (const [i, point] of points.entries()) {
				for (const p of [center, point, points[(i + 1) % points.length]!]) {
					minX = Math.min(minX, p[0]);
					minY = Math.min(minY, p[1]);
					maxX = Math.max(maxX, p[0]);
					maxY = Math.max(maxY, p[1]);
					vertices.push(
						(p[0] * 2) / aspect,
						p[1] * 2,
						Number(index === 0),
						Number(index === 1),
						Number(index === 2),
					);
				}
			}
		}
	}
	return { vertices, bounds: [minX, minY, maxX - minX, maxY - minY] };
}

function createApertureMaskTarget(gpu: Gpu, aspect: number) {
	return target(gpu, {
		size: [
			Math.max(1, Math.round(1024 * Math.min(1, aspect))),
			Math.max(1, Math.round(1024 / Math.max(1, aspect))),
		],
		format: "rgba8unorm",
		msaa: true,
		clearColor: [0, 0, 0, 0],
		label: "hero-intro-aperture-mask",
	});
}
