import { readFile } from "node:fs/promises";
import { expect, test } from "vite-plus/test";
import { decodeGltfMesh, parseGltfDocument } from "../../packages/logo-renderer/src/renderer/mesh";
import { extractApertures } from "../../packages/logo-renderer/src/renderer/render/apertures";
import type { MeshData } from "../../packages/logo-renderer/src/renderer/render/types";

const logoUrl = new URL("../../public/localai/localai-logo.gltf", import.meta.url);
const logo = await decodeGltfMesh(parseGltfDocument(await readFile(logoUrl, "utf8")), (uri) =>
	readFile(new URL(uri, logoUrl)).then((bytes) =>
		bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
	),
);

function quadWithHole(): MeshData {
	const positions = new Float32Array([
		-2, -2, 1, 2, -2, 1, 2, 2, 1, -2, 2, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
	]);
	const normals = new Float32Array(positions.length);
	for (let i = 2; i < normals.length; i += 3) normals[i] = 1;
	return {
		positions,
		normals,
		indices: new Uint32Array([
			0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7,
		]),
		bounds: { min: [-2, -2, 1], max: [2, 2, 1] },
	};
}

test("actual glTF front cap contains three exact clockwise aperture loops", () => {
	const before = [logo.positions.slice(), logo.normals.slice(), logo.indices.slice()];
	const holes = extractApertures(logo);
	expect(holes).toHaveLength(3);
	expect(extractApertures(logo)).toEqual(holes);
	const frontVertices = new Set<string>();
	for (let i = 0; i < logo.positions.length; i += 3) {
		if (logo.positions[i + 2] === logo.bounds.max[2] && logo.normals[i + 2] === 1)
			frontVertices.add(Array.from(logo.positions.subarray(i, i + 3)).join(","));
	}
	for (const hole of holes) {
		expect(hole.points.length).toBeGreaterThan(3);
		expect(new Set(hole.points.map((point) => point.join(","))).size).toBe(hole.points.length);
		expect(hole.signedArea).toBeLessThan(0);
		expect(hole.centroid.every((value) => Number.isFinite(value))).toBe(true);
		let twiceArea = 0;
		for (let i = 0; i < hole.points.length; i += 1) {
			const a = hole.points[i]!,
				b = hole.points[(i + 1) % hole.points.length]!;
			expect(frontVertices.has(a.join(","))).toBe(true);
			expect(a[2]).toBe(logo.bounds.max[2]);
			twiceArea += a[0] * b[1] - b[0] * a[1];
		}
		expect(twiceArea / 2).toBeCloseTo(hole.signedArea, 12);
		expect(Math.abs(hole.signedArea)).toBeLessThan(
			((logo.bounds.max[0] - logo.bounds.min[0]) * (logo.bounds.max[1] - logo.bounds.min[1])) / 4,
		);
	}
	expect([logo.positions, logo.normals, logo.indices]).toEqual(before);
});

test("synthetic square opening excludes outer boundary and retains exact centroid", () => {
	const holes = extractApertures(quadWithHole());
	expect(holes).toHaveLength(1);
	expect(holes[0]).toEqual({
		points: [
			[-1, -1, 1],
			[-1, 1, 1],
			[1, 1, 1],
			[1, -1, 1],
		],
		centroid: [0, 0, 1],
		signedArea: -4,
	});
});

test("exact coincident vertices and reordered triangles retain the same opening", () => {
	const mesh = quadWithHole();
	const expected = extractApertures(mesh);
	const indices = Array.from(mesh.indices);
	const triangles: number[][] = [];
	for (let i = 0; i < indices.length; i += 3) triangles.unshift(indices.slice(i, i + 3));
	mesh.indices = new Uint32Array(triangles.flat());
	expect(extractApertures(mesh)).toEqual(expected);
	const positions = new Float32Array(mesh.indices.length * 3);
	const normals = new Float32Array(positions.length);
	for (let i = 0; i < mesh.indices.length; i += 1) {
		const vertex = mesh.indices[i]! * 3;
		positions.set(mesh.positions.subarray(vertex, vertex + 3), i * 3);
		normals[i * 3 + 2] = 1;
	}
	expect(
		extractApertures({
			...mesh,
			positions,
			normals,
			indices: Uint32Array.from({ length: mesh.indices.length }, (_, i) => i),
		}),
	).toEqual(expected);
});

test("solid cap and empty or non-front geometry have no apertures", () => {
	const mesh = quadWithHole();
	mesh.indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
	expect(extractApertures(mesh)).toEqual([]);
	mesh.indices = new Uint32Array();
	expect(extractApertures(mesh)).toEqual([]);
	const back = quadWithHole();
	back.normals.fill(0);
	expect(extractApertures(back)).toEqual([]);
});

test("degenerate, duplicate, reversed and invalid-index cap triangles fail closed", () => {
	for (const triangle of [
		[0, 0, 1],
		[0, 1, 5],
		[0, 5, 1],
		[0, 1, 999],
	]) {
		const mesh = quadWithHole();
		mesh.indices = new Uint32Array([...mesh.indices, ...triangle]);
		expect(extractApertures(mesh)).toEqual([]);
	}
	const invalid = quadWithHole();
	invalid.positions[0] = Number.NaN;
	expect(extractApertures(invalid)).toEqual([]);
});

test("front-cap tolerance scales with the mesh and excludes nonplanar bevel triangles", () => {
	for (const scale of [0.001, 1000]) {
		const mesh = quadWithHole();
		mesh.positions = mesh.positions.map((value) => value * scale);
		mesh.bounds = { min: [-2 * scale, -2 * scale, scale], max: [2 * scale, 2 * scale, scale] };
		const hole = extractApertures(mesh)[0]!;
		expect(hole.signedArea).toBeCloseTo(-4 * scale * scale, scale < 1 ? 10 : 3);
		expect(hole.centroid[2]).toBeCloseTo(scale, 6);
	}
	const mesh = quadWithHole();
	mesh.normals[2] = 0.99;
	expect(extractApertures(mesh)).toEqual([]);
});

test("nonmanifold cap boundaries that share only a vertex fail closed", () => {
	const mesh = quadWithHole();
	mesh.positions = new Float32Array([...mesh.positions, -3, -2, 1, -2, -3, 1]);
	mesh.normals = new Float32Array([...mesh.normals, 0, 0, 1, 0, 0, 1]);
	mesh.indices = new Uint32Array([...mesh.indices, 0, 8, 9]);
	mesh.bounds.min = [-3, -3, 1];
	expect(extractApertures(mesh)).toEqual([]);
});

test("actual apertures support a nonoverlapping centroid fan without changing contours", () => {
	for (const hole of extractApertures(logo)) {
		let area = 0;
		for (let i = 0; i < hole.points.length; i += 1) {
			const a = hole.points[i]!,
				b = hole.points[(i + 1) % hole.points.length]!;
			const cross =
				(a[0] - hole.centroid[0]) * (b[1] - hole.centroid[1]) -
				(a[1] - hole.centroid[1]) * (b[0] - hole.centroid[0]);
			expect(cross).toBeLessThan(0);
			area += cross / 2;
		}
		expect(area).toBeCloseTo(hole.signedArea, 12);
	}
});

test("concave aperture contours remain exact without assuming a centroid fan", () => {
	const mesh = quadWithHole();
	mesh.positions = new Float32Array([
		-1, -1, 1, 5, -1, 1, 5, 2, 1, 2, 2, 1, 2, 5, 1, -1, 5, 1, 0, 0, 1, 2, 0, 1, 2, 1, 1, 1, 1, 1, 1,
		2, 1, 0, 2, 1,
	]);
	mesh.normals = new Float32Array(mesh.positions.length);
	for (let i = 2; i < mesh.normals.length; i += 3) mesh.normals[i] = 1;
	const indices: number[] = [];
	for (let i = 0; i < 6; i += 1) {
		const j = (i + 1) % 6;
		indices.push(i, j, j + 6, i, j + 6, i + 6);
	}
	mesh.indices = new Uint32Array(indices);
	mesh.bounds = { min: [-1, -1, 1], max: [5, 5, 1] };
	const holes = extractApertures(mesh);
	expect(holes).toHaveLength(1);
	expect(holes[0]!.points).toEqual([
		[0, 0, 1],
		[0, 2, 1],
		[1, 2, 1],
		[1, 1, 1],
		[2, 1, 1],
		[2, 0, 1],
	]);
	expect(holes[0]!.signedArea).toBe(-3);
	expect(holes[0]!.centroid[0]).toBeCloseTo(5 / 6);
	expect(holes[0]!.centroid[1]).toBeCloseTo(5 / 6);
});
