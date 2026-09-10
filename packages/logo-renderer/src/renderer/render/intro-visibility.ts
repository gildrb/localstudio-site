import type { Gpu } from "vgpu";
import { StorageBuffer } from "vgpu/core";
import { normalizePositionForGpu } from "./camera";
import type { MeshInput, Vec3 } from "./types";

/** Intro-only, double-sided visibility over the same normalized triangles as the mesh draw. */
export function createIntroVisibility(gpu: Gpu, mesh: MeshInput) {
	const hierarchy = new VisibilityHierarchy();
	hierarchy.build(createVisibilityFaces(mesh));
	const nodeData = new Float32Array(hierarchy.nodes.flat());
	const triangleData = new Float32Array(hierarchy.triangles);
	const bvhNodes = new StorageBuffer(gpu.device, {
		size: nodeData.byteLength,
		label: "intro-visibility-nodes",
	});
	const bvhTriangles = new StorageBuffer(gpu.device, {
		size: triangleData.byteLength,
		label: "intro-visibility-triangles",
	});
	bvhNodes.write(nodeData);
	bvhTriangles.write(triangleData);
	return {
		bvhNodes,
		bvhTriangles,
		dispose() {
			bvhNodes.destroy();
			bvhTriangles.destroy();
		},
	};
}

type VisibilityFace = {
	readonly points: readonly [Vec3, Vec3, Vec3];
	readonly lower: Vec3;
	readonly upper: Vec3;
	readonly center: Vec3;
};

function createVisibilityFaces(mesh: MeshInput) {
	const vertices: Vec3[] = [];
	for (let i = 0; i < mesh.positions.length; i += 3) {
		vertices.push(
			normalizePositionForGpu(
				[mesh.positions[i]!, mesh.positions[i + 1]!, mesh.positions[i + 2]!],
				mesh.bounds,
			),
		);
	}
	const faces: VisibilityFace[] = [];
	for (let i = 0; i < mesh.indices.length; i += 3) {
		const points: [Vec3, Vec3, Vec3] = [
			vertices[mesh.indices[i]!]!,
			vertices[mesh.indices[i + 1]!]!,
			vertices[mesh.indices[i + 2]!]!,
		];
		const lower: [number, number, number] = [Infinity, Infinity, Infinity];
		const upper: [number, number, number] = [-Infinity, -Infinity, -Infinity];
		const center: [number, number, number] = [0, 0, 0];
		for (const point of points) {
			for (const axis of [0, 1, 2] as const) {
				lower[axis] = Math.min(lower[axis], point[axis]);
				upper[axis] = Math.max(upper[axis], point[axis]);
				center[axis] += point[axis] / 3;
			}
		}
		faces.push({ points, lower, upper, center });
	}
	return faces;
}

class VisibilityHierarchy {
	readonly nodes: number[][] = [];
	readonly triangles: number[] = [];

	build(partition: VisibilityFace[]): number {
		const index = this.nodes.length;
		this.nodes.push([]);
		const lower: [number, number, number] = [Infinity, Infinity, Infinity];
		const upper: [number, number, number] = [-Infinity, -Infinity, -Infinity];
		for (const face of partition) {
			for (const axis of [0, 1, 2] as const) {
				lower[axis] = Math.min(lower[axis], face.lower[axis]);
				upper[axis] = Math.max(upper[axis], face.upper[axis]);
			}
		}
		if (partition.length <= 6) {
			const first = this.triangles.length / 12;
			for (const face of partition) {
				const [a, b, c] = face.points;
				this.triangles.push(
					...a,
					0,
					b[0] - a[0],
					b[1] - a[1],
					b[2] - a[2],
					0,
					c[0] - a[0],
					c[1] - a[1],
					c[2] - a[2],
					0,
				);
			}
			this.nodes[index] = [...lower, first, ...upper, partition.length];
		} else {
			const extent: Vec3 = [upper[0] - lower[0], upper[1] - lower[1], upper[2] - lower[2]];
			let axis: 0 | 1 | 2 = 0;
			if (extent[1] > extent[axis]) axis = 1;
			if (extent[2] > extent[axis]) axis = 2;
			partition.sort((a, b) => a.center[axis] - b.center[axis]);
			const middle = Math.floor(partition.length / 2);
			this.build(partition.slice(0, middle));
			const right = this.build(partition.slice(middle));
			// Preorder layout: left child is index + 1; index field stores the right child.
			this.nodes[index] = [...lower, right, ...upper, 0];
		}
		return index;
	}
}
