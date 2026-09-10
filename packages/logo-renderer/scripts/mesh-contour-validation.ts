import type { Contour, Point } from "./mesh-generator.lib.ts";

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
	const abC = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
	const abD = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]);
	const cdA = (d[0] - c[0]) * (a[1] - c[1]) - (d[1] - c[1]) * (a[0] - c[0]);
	const cdB = (d[0] - c[0]) * (b[1] - c[1]) - (d[1] - c[1]) * (b[0] - c[0]);
	return abC * abD < -1e-14 && cdA * cdB < -1e-14;
}

export function assertSimpleContour(points: Contour, label: string): void {
	for (const [i, a] of points.entries()) {
		const b = points[(i + 1) % points.length];
		if (b === undefined) throw new Error("Contour edge has no endpoint");
		for (let j = i + 2; j < points.length; j += 1) {
			if (i === 0 && j === points.length - 1) continue;
			const c = points[j];
			const d = points[(j + 1) % points.length];
			if (c === undefined || d === undefined) throw new Error("Contour edge has no endpoint");
			if (segmentsIntersect(a, b, c, d))
				throw new Error(`${label} self-intersects at segments ${i} and ${j}`);
		}
	}
}

function contoursIntersect(a: Contour, b: Contour): boolean {
	for (const [i, startA] of a.entries()) {
		const endA = a[(i + 1) % a.length];
		if (endA === undefined) throw new Error("Contour edge has no endpoint");
		for (const [j, startB] of b.entries()) {
			const endB = b[(j + 1) % b.length];
			if (endB === undefined) throw new Error("Contour edge has no endpoint");
			if (segmentsIntersect(startA, endA, startB, endB)) return true;
		}
	}
	return false;
}

export function assertDisjointContours(contours: readonly Contour[], label: string): void {
	for (const [first, a] of contours.entries()) {
		for (let second = first + 1; second < contours.length; second += 1) {
			const b = contours[second];
			if (b === undefined) throw new Error("Contour is missing");
			if (contoursIntersect(a, b))
				throw new Error(`${label} contours ${first} and ${second} intersect`);
		}
	}
}
