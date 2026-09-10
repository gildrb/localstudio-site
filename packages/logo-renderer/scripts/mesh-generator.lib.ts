// Shared SVG-subpath -> swept extruded-solid mesh machinery.
// Shared by the brandmark generator; caps meet the inset end of a convex fillet.
import earcut from "earcut";
import fs from "node:fs";

export type Point = [number, number];
export type Contour = Point[];
type Normal = [number, number, number];

interface FilletProfile {
	halfThickness: number;
	filletRadius: number;
	filletSteps: number;
}
interface CapRange {
	coordinateStart: number;
	frontStart: number;
	backStart: number;
	count: number;
}
interface Mesh {
	positions: Float32Array;
	normals: Float32Array;
	indices: Uint32Array;
}
interface GltfOptions {
	outGltf: string;
	outBin: string;
	binUri: string;
	generator: string;
	name: string;
	check: boolean;
}

export const FLATTEN_TOLERANCE = 0.06; // svg units; silhouette smoothness budget
export const MAX_BEZIER_DEPTH = 24;

export function parseSubpath(data: string): Contour[] {
	// Supports the subset needed by the brand paths: m/M, c/C, l/L, z/Z.
	const tokens = data.match(/[mMcClLzZ]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
	let i = 0;
	let cursor: Point = [0, 0];
	let start: Point = [0, 0];
	const contours: Contour[] = [];
	let contour: Contour = [];
	const readPoint = (): Point => [Number(tokens[i++]), Number(tokens[i++])];
	while (i < tokens.length) {
		const raw = tokens[i++];
		if (raw === undefined) break;
		const cmd = raw.toLowerCase();
		const absolute = raw !== cmd;
		if (cmd === "m") {
			if (contour.length > 1) contours.push(contour);
			const p = readPoint();
			cursor = absolute ? p : [cursor[0] + p[0], cursor[1] + p[1]];
			start = [...cursor];
			contour = [cursor];
		} else if (cmd === "c") {
			const read = (): Point => {
				const p = readPoint();
				return absolute ? p : [cursor[0] + p[0], cursor[1] + p[1]];
			};
			const c1 = read();
			const c2 = read();
			const end = read();
			contour.push(...flattenCubic(cursor, c1, c2, end, 0));
			cursor = end;
		} else if (cmd === "l") {
			const p = readPoint();
			cursor = absolute ? p : [cursor[0] + p[0], cursor[1] + p[1]];
			contour.push(cursor);
		} else if (cmd === "z") {
			contour.push(start);
			cursor = [...start];
		} else {
			throw new Error(`Unsupported path command: ${raw}`);
		}
	}
	if (contour.length > 1) contours.push(contour);
	return contours;
}

function flattenCubic(p0: Point, p1: Point, p2: Point, p3: Point, depth: number): Contour {
	// Flatness: control points close to the chord p0->p3.
	const dx = p3[0] - p0[0];
	const dy = p3[1] - p0[1];
	const d1 = Math.abs((p1[0] - p3[0]) * dy - (p1[1] - p3[1]) * dx);
	const d2 = Math.abs((p2[0] - p3[0]) * dy - (p2[1] - p3[1]) * dx);
	if (depth >= MAX_BEZIER_DEPTH || (d1 + d2) ** 2 <= FLATTEN_TOLERANCE ** 2 * (dx * dx + dy * dy)) {
		return [p3];
	}
	const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	const p01 = mid(p0, p1);
	const p12 = mid(p1, p2);
	const p23 = mid(p2, p3);
	const p012 = mid(p01, p12);
	const p123 = mid(p12, p23);
	const p0123 = mid(p012, p123);
	return [
		...flattenCubic(p0, p01, p012, p0123, depth + 1),
		...flattenCubic(p0123, p123, p23, p3, depth + 1),
	];
}

export function dedupeContour(points: Contour): Contour {
	const out: Contour = [];
	for (const p of points) {
		const prev = out[out.length - 1];
		if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 1e-6) out.push(p);
	}
	while (out.length > 1) {
		const first = out[0];
		const last = out[out.length - 1];
		if (first === undefined || last === undefined) throw new Error("Contour endpoint is missing");
		if (!(Math.hypot(first[0] - last[0], first[1] - last[1]) <= 1e-6)) break;
		out.pop();
	}
	return out;
}

export function signedArea(points: Contour): number {
	let area = 0;
	for (let i = 0; i < points.length; i += 1) {
		const a = points[i];
		const b = points[(i + 1) % points.length];
		if (a === undefined || b === undefined) throw new Error("Contour edge has no endpoint");
		area += a[0] * b[1] - b[0] * a[1];
	}
	return area / 2;
}

export function contourNormals(points: Contour): Contour {
	// Bisect unit edge tangents. Adaptive SVG sampling gives neighboring
	// edges unequal lengths; using next - prev biases normals toward long edges.
	const n = points.length;
	const normals: Contour = [];
	for (let i = 0; i < n; i += 1) {
		const prev = points[(i - 1 + n) % n];
		const next = points[(i + 1) % n];
		const point = points[i];
		if (prev === undefined || next === undefined || point === undefined)
			throw new Error("Contour edge has no endpoint");
		const before = Math.hypot(point[0] - prev[0], point[1] - prev[1]);
		const after = Math.hypot(next[0] - point[0], next[1] - point[1]);
		let tx = (point[0] - prev[0]) / before + (next[0] - point[0]) / after;
		let ty = (point[1] - prev[1]) / before + (next[1] - point[1]) / after;
		const len = Math.hypot(tx, ty) || 1;
		tx /= len;
		ty /= len;
		// For CCW winding, (ty, -tx) points outward.
		normals[i] = [ty, -tx];
	}
	return normals;
}

export function assertSimpleContour(points: Contour, label: string): void {
	const cross = (a: Point, b: Point, c: Point) =>
		(b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
	for (let i = 0; i < points.length; i += 1) {
		const a = points[i];
		const b = points[(i + 1) % points.length];
		if (a === undefined || b === undefined) throw new Error("Contour edge has no endpoint");
		for (let j = i + 2; j < points.length; j += 1) {
			if (i === 0 && j === points.length - 1) continue;
			const c = points[j];
			const d = points[(j + 1) % points.length];
			if (c === undefined || d === undefined) throw new Error("Contour edge has no endpoint");
			const abC = cross(a, b, c);
			const abD = cross(a, b, d);
			const cdA = cross(c, d, a);
			const cdB = cross(c, d, b);
			if (abC * abD < -1e-14 && cdA * cdB < -1e-14)
				throw new Error(`${label} self-intersects at segments ${i} and ${j}`);
		}
	}
}

export function assertDisjointContours(contours: Contour[], label: string): void {
	const cross = (a: Point, b: Point, c: Point) =>
		(b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
	for (let first = 0; first < contours.length; first += 1) {
		for (let second = first + 1; second < contours.length; second += 1) {
			const a = contours[first];
			const b = contours[second];
			if (a === undefined || b === undefined) throw new Error("Contour is missing");
			for (let i = 0; i < a.length; i += 1) {
				for (let j = 0; j < b.length; j += 1) {
					const a0 = a[i];
					const a1 = a[(i + 1) % a.length];
					const b0 = b[j];
					const b1 = b[(j + 1) % b.length];
					if (a0 === undefined || a1 === undefined || b0 === undefined || b1 === undefined)
						throw new Error("Contour edge has no endpoint");
					const abC = cross(a0, a1, b0);
					const abD = cross(a0, a1, b1);
					const cdA = cross(b0, b1, a0);
					const cdB = cross(b0, b1, a1);
					if (abC * abD < -1e-14 && cdA * cdB < -1e-14)
						throw new Error(`${label} contours ${first} and ${second} intersect`);
				}
			}
		}
	}
}

// Sweeps every contour through a quarter-circle fillet profile and returns the
// side-wall mesh plus per-contour cap vertex ranges. Cap triangulation policy
// (holes vs disjoint outers) stays with the caller.
export function buildSweptSolid(
	contours: Contour[],
	contourNormals2d: Contour[],
	bevelContours: Contour[],
	{ halfThickness, filletRadius, filletSteps }: FilletProfile,
) {
	const positions: number[] = [];
	const normals: number[] = [];
	const indices: number[] = [];
	const capCoordinates: number[] = [];
	const holeStarts: number[] = [];
	const frontCapVertices: number[] = [];
	const backCapVertices: number[] = [];
	const perContour: CapRange[] = [];
	const T = halfThickness;
	const r = filletRadius;
	const K = filletSteps;
	const fillet = (k: number) => {
		const alpha = (k / K) * (Math.PI / 2);
		// Move outward from the inset cap to the outline wall. This tangent
		// is perpendicular to the supplied (sin(alpha), cos(alpha)) normal.
		return { inset: r * (1 - Math.sin(alpha)), z: T - r + r * Math.cos(alpha) };
	};

	for (let contourIndex = 0; contourIndex < contours.length; contourIndex += 1) {
		const outline = contours[contourIndex];
		const normals2d = contourNormals2d[contourIndex];
		const bevel = bevelContours[contourIndex];
		if (outline === undefined || normals2d === undefined || bevel === undefined)
			throw new Error("Contour sweep data is missing");
		const n = outline.length;
		if (contourIndex > 0) holeStarts.push(capCoordinates.length / 2);
		const coordinateStart = capCoordinates.length / 2;
		for (const point of bevel) capCoordinates.push(...point);

		const pushRing = (inset: number, z: number, normalFor: (normal: Point) => Normal) => {
			const start = positions.length / 3;
			for (let i = 0; i < n; i += 1) {
				const point = outline[i];
				const normal2d = normals2d[i];
				if (point === undefined || normal2d === undefined)
					throw new Error("Contour point or normal is missing");
				positions.push(point[0] - normal2d[0] * inset, point[1] - normal2d[1] * inset, z);
				normals.push(...normalFor(normal2d));
			}
			return start;
		};
		const linkRings = (a: number, b: number) => {
			for (let i = 0; i < n; i += 1) {
				const j = (i + 1) % n;
				indices.push(a + i, b + i, b + j, a + i, b + j, a + j);
			}
		};

		const frontCap = pushRing(r, T, () => [0, 0, 1]);
		for (let i = 0; i < n; i += 1) frontCapVertices.push(frontCap + i);
		const frontRings: number[] = [];
		for (let k = 1; k <= K; k += 1) {
			const { inset, z } = fillet(k);
			const alpha = (k / K) * (Math.PI / 2);
			frontRings.push(
				pushRing(inset, z, (normal) => [
					normal[0] * Math.sin(alpha),
					normal[1] * Math.sin(alpha),
					Math.cos(alpha),
				]),
			);
		}
		const wallTop = frontRings[frontRings.length - 1];
		if (wallTop === undefined) throw new Error("Fillet profile has no front rings");
		const wallBottom = pushRing(0, -(T - r), (normal) => [normal[0], normal[1], 0]);
		const backRings: number[] = [];
		for (let k = K - 1; k >= 1; k -= 1) {
			const { inset, z } = fillet(k);
			const alpha = (k / K) * (Math.PI / 2);
			backRings.push(
				pushRing(inset, -z, (normal) => [
					normal[0] * Math.sin(alpha),
					normal[1] * Math.sin(alpha),
					-Math.cos(alpha),
				]),
			);
		}
		const backCap = pushRing(r, -T, () => [0, 0, -1]);
		for (let i = 0; i < n; i += 1) backCapVertices.push(backCap + i);

		let upper = frontCap;
		for (const ring of frontRings) {
			linkRings(upper, ring);
			upper = ring;
		}
		linkRings(wallTop, wallBottom);
		upper = wallBottom;
		for (const ring of backRings) {
			linkRings(upper, ring);
			upper = ring;
		}
		linkRings(upper, backCap);

		perContour.push({
			coordinateStart,
			frontStart: frontCap,
			backStart: backCap,
			count: n,
		});
	}

	return {
		positions,
		normals,
		indices,
		capCoordinates,
		holeStarts,
		frontCapVertices,
		backCapVertices,
		perContour,
		earcut,
	};
}

export function writeGltf(mesh: Mesh, options: GltfOptions): void {
	const { outGltf, outBin, binUri, generator, name, check } = options;
	const vertexCount = mesh.positions.length / 3;
	const positionBytes = mesh.positions.byteLength;
	const normalBytes = mesh.normals.byteLength;
	const indexBytes = mesh.indices.byteLength;
	const bufferLength = positionBytes + normalBytes + indexBytes;
	const buffer = new Uint8Array(bufferLength);
	buffer.set(new Uint8Array(mesh.positions.buffer, 0, positionBytes), 0);
	buffer.set(new Uint8Array(mesh.normals.buffer, 0, normalBytes), positionBytes);
	buffer.set(new Uint8Array(mesh.indices.buffer, 0, indexBytes), positionBytes + normalBytes);

	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;
	for (let i = 0; i < mesh.positions.length; i += 3) {
		const x = mesh.positions[i];
		const y = mesh.positions[i + 1];
		const z = mesh.positions[i + 2];
		if (x === undefined || y === undefined || z === undefined)
			throw new Error("Incomplete mesh position");
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
		minZ = Math.min(minZ, z);
		maxZ = Math.max(maxZ, z);
	}

	const gltf = {
		asset: { generator, version: "2.0" },
		scene: 0,
		scenes: [{ name: "Scene", nodes: [0] }],
		nodes: [{ mesh: 0, name }],
		meshes: [
			{
				name,
				primitives: [
					{
						attributes: { POSITION: 0, NORMAL: 1 },
						indices: 2,
					},
				],
			},
		],
		accessors: [
			{
				bufferView: 0,
				componentType: 5126,
				count: vertexCount,
				type: "VEC3",
				min: [minX, minY, minZ],
				max: [maxX, maxY, maxZ],
			},
			{ bufferView: 1, componentType: 5126, count: vertexCount, type: "VEC3" },
			{ bufferView: 2, componentType: 5125, count: mesh.indices.length, type: "SCALAR" },
		],
		bufferViews: [
			{ buffer: 0, byteLength: positionBytes, byteOffset: 0, target: 34962 },
			{ buffer: 0, byteLength: normalBytes, byteOffset: positionBytes, target: 34962 },
			{
				buffer: 0,
				byteLength: indexBytes,
				byteOffset: positionBytes + normalBytes,
				target: 34963,
			},
		],
		buffers: [{ byteLength: bufferLength, uri: binUri }],
	};

	const gltfBody = `${JSON.stringify(gltf, null, "\t")}\n`;
	if (check) {
		const mismatches: string[] = [];
		if (
			!fs.existsSync(outBin) ||
			!Buffer.from(fs.readFileSync(outBin)).equals(Buffer.from(buffer))
		) {
			mismatches.push(outBin);
		}
		if (!fs.existsSync(outGltf) || fs.readFileSync(outGltf, "utf8") !== gltfBody) {
			mismatches.push(outGltf);
		}
		if (mismatches.length) {
			console.error(`mesh outputs are stale:\n${mismatches.join("\n")}`);
			process.exitCode = 1;
			return;
		}
		console.log(`${name} mesh outputs ok (${bufferLength} bytes, ${vertexCount} vertices)`);
		return;
	}
	fs.writeFileSync(outBin, buffer);
	fs.writeFileSync(outGltf, gltfBody);
	console.log(
		`wrote ${outGltf} (${bufferLength} bytes): ${vertexCount} vertices, ${mesh.indices.length / 3} triangles`,
	);
}
