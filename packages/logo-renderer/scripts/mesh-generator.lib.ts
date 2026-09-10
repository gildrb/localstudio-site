// Shared SVG-subpath and contour geometry for the swept brand meshes.
export type Point = readonly [number, number];
export type Contour = readonly Point[];

// SVG units; silhouette smoothness budget.
export const FLATTEN_TOLERANCE = 0.06;
export const MAX_BEZIER_DEPTH = 24;

export function parseSubpath(data: string): Point[][] {
	// Supports the subset needed by the brand paths: m/M, c/C, l/L, z/Z.
	const tokens = data.match(/[mMcClLzZ]|-?\d*\.?\d+(?:e-?\d+)?/gu) ?? [];
	let i = 0;
	let cursor: Point = [0, 0];
	let start: Point = [0, 0];
	const contours: Point[][] = [];
	let contour: Point[] = [];
	const readPoint = (absolute: boolean): Point => {
		const point: Point = [Number(tokens[i++]), Number(tokens[i++])];
		return absolute ? point : [cursor[0] + point[0], cursor[1] + point[1]];
	};
	while (i < tokens.length) {
		const raw = tokens[i++];
		if (raw === undefined) break;
		const cmd = raw.toLowerCase();
		const absolute = raw !== cmd;
		if (cmd === "m") {
			if (contour.length > 1) contours.push(contour);
			cursor = readPoint(absolute);
			start = [...cursor];
			contour = [cursor];
		} else if (cmd === "c") {
			const c1 = readPoint(absolute);
			const c2 = readPoint(absolute);
			const end = readPoint(absolute);
			contour.push(...flattenCubic([cursor, c1, c2, end], 0));
			cursor = end;
		} else if (cmd === "l") {
			cursor = readPoint(absolute);
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

function flattenCubic(curve: readonly [Point, Point, Point, Point], depth: number): Point[] {
	const [p0, p1, p2, p3] = curve;
	// Flatness: control points close to the chord p0->p3.
	const dx = p3[0] - p0[0];
	const dy = p3[1] - p0[1];
	const d1 = Math.abs((p1[0] - p3[0]) * dy - (p1[1] - p3[1]) * dx);
	const d2 = Math.abs((p2[0] - p3[0]) * dy - (p2[1] - p3[1]) * dx);
	if (depth >= MAX_BEZIER_DEPTH || (d1 + d2) ** 2 <= FLATTEN_TOLERANCE ** 2 * (dx * dx + dy * dy)) {
		return [p3];
	}
	const p01: Point = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
	const p12: Point = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
	const p23: Point = [(p2[0] + p3[0]) / 2, (p2[1] + p3[1]) / 2];
	const p012: Point = [(p01[0] + p12[0]) / 2, (p01[1] + p12[1]) / 2];
	const p123: Point = [(p12[0] + p23[0]) / 2, (p12[1] + p23[1]) / 2];
	const p0123: Point = [(p012[0] + p123[0]) / 2, (p012[1] + p123[1]) / 2];
	return [
		...flattenCubic([p0, p01, p012, p0123], depth + 1),
		...flattenCubic([p0123, p123, p23, p3], depth + 1),
	];
}

export function dedupeContour(points: Contour): Point[] {
	const out: Point[] = [];
	for (const p of points) {
		const prev = out.at(-1);
		if (prev === undefined || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 1e-6) out.push(p);
	}
	let first = out[0];
	let last = out.at(-1);
	while (
		out.length > 1 &&
		first !== undefined &&
		last !== undefined &&
		Math.hypot(first[0] - last[0], first[1] - last[1]) <= 1e-6
	) {
		out.pop();
		first = out[0];
		last = out.at(-1);
	}
	return out;
}

export function signedArea(points: Contour): number {
	let area = 0;
	for (const [i, a] of points.entries()) {
		const b = points[(i + 1) % points.length];
		if (b === undefined) throw new Error("Contour edge has no endpoint");
		area += a[0] * b[1] - b[0] * a[1];
	}
	return area / 2;
}

export function contourNormals(points: Contour): Point[] {
	// Bisect unit edge tangents. Adaptive SVG sampling gives neighboring
	// edges unequal lengths; using next - prev biases normals toward long edges.
	const n = points.length;
	return points.map((point, i): Point => {
		const prev = points[(i - 1 + n) % n];
		const next = points[(i + 1) % n];
		if (prev === undefined || next === undefined) throw new Error("Contour edge has no endpoint");
		const before = Math.hypot(point[0] - prev[0], point[1] - prev[1]);
		const after = Math.hypot(next[0] - point[0], next[1] - point[1]);
		let tx = (point[0] - prev[0]) / before + (next[0] - point[0]) / after;
		let ty = (point[1] - prev[1]) / before + (next[1] - point[1]) / after;
		const length = Math.hypot(tx, ty);
		const len = length === 0 || Number.isNaN(length) ? 1 : length;
		tx /= len;
		ty /= len;
		// For CCW winding, (ty, -tx) points outward.
		return [ty, -tx];
	});
}

export function normalizeContours(contours: readonly Contour[], targetHeight: number): Point[][] {
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	for (const contour of contours) {
		for (const [x, y] of contour) {
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}
	}
	const scale = targetHeight / (maxY - minY);
	const cx = (minX + maxX) / 2;
	const cy = (minY + maxY) / 2;
	return contours.map((contour: Contour) =>
		contour.map(([x, y]): Point => [(x - cx) * scale, (y - cy) * scale]),
	);
}

export function insetContours(
	contours: readonly Contour[],
	normals: readonly Contour[],
	radius: number,
): Point[][] {
	return contours.map((contour: Contour, contourIndex) => {
		const contourNormals2d = normals[contourIndex];
		if (contourNormals2d === undefined) throw new Error("Contour normals are missing");
		return contour.map((point, i): Point => {
			const normal = contourNormals2d[i];
			if (normal === undefined) throw new Error("Contour point normal is missing");
			return [point[0] - normal[0] * radius, point[1] - normal[1] * radius];
		});
	});
}
