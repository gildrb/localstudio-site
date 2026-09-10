import earcut from "earcut";
import type { Contour, Point } from "./mesh-generator.lib.ts";

type Normal = readonly [number, number, number];
interface FilletProfile {
	readonly halfThickness: number;
	readonly filletRadius: number;
	readonly filletSteps: number;
}
interface CapRange {
	readonly coordinateStart: number;
	readonly frontStart: number;
	readonly backStart: number;
	readonly count: number;
}
export interface SweptSolid {
	readonly positions: readonly number[];
	readonly normals: readonly number[];
	readonly indices: readonly number[];
	readonly capCoordinates: readonly number[];
	readonly holeStarts: readonly number[];
	readonly frontCapVertices: readonly number[];
	readonly backCapVertices: readonly number[];
	readonly perContour: readonly CapRange[];
	readonly earcut: typeof earcut;
}

class MeshSweep {
	readonly positions: number[] = [];
	readonly normals: number[] = [];
	readonly indices: number[] = [];
	readonly capCoordinates: number[] = [];
	readonly holeStarts: number[] = [];
	readonly frontCapVertices: number[] = [];
	readonly backCapVertices: number[] = [];
	readonly perContour: CapRange[] = [];
	readonly earcut = earcut;
	readonly #profile: FilletProfile;
	#outline: Contour = [];
	#normals2d: Contour = [];

	constructor(profile: FilletProfile) {
		this.#profile = profile;
	}

	#fillet(k: number) {
		const { halfThickness: T, filletRadius: r, filletSteps: K } = this.#profile;
		const alpha = (k / K) * (Math.PI / 2);
		// Move outward from the inset cap to the outline wall. This tangent
		// is perpendicular to the supplied (sin(alpha), cos(alpha)) normal.
		return { inset: r * (1 - Math.sin(alpha)), z: T - r + r * Math.cos(alpha) };
	}

	#pushRing(inset: number, z: number, normalFor: (normal: Point) => Normal): number {
		const start = this.positions.length / 3;
		for (const [i, point] of this.#outline.entries()) {
			const normal2d = this.#normals2d[i];
			if (normal2d === undefined) throw new Error("Contour point normal is missing");
			this.positions.push(point[0] - normal2d[0] * inset, point[1] - normal2d[1] * inset, z);
			this.normals.push(...normalFor(normal2d));
		}
		return start;
	}

	#linkRings(a: number, b: number): void {
		const n = this.#outline.length;
		for (let i = 0; i < n; i += 1) {
			const j = (i + 1) % n;
			this.indices.push(a + i, b + i, b + j, a + i, b + j, a + j);
		}
	}

	#frontRings(): number[] {
		const K = this.#profile.filletSteps;
		const rings: number[] = [];
		for (let k = 1; k <= K; k += 1) {
			const { inset, z } = this.#fillet(k);
			const alpha = (k / K) * (Math.PI / 2);
			rings.push(
				this.#pushRing(inset, z, (normal) => [
					normal[0] * Math.sin(alpha),
					normal[1] * Math.sin(alpha),
					Math.cos(alpha),
				]),
			);
		}
		return rings;
	}

	#backRings(): number[] {
		const K = this.#profile.filletSteps;
		const rings: number[] = [];
		for (let k = K - 1; k >= 1; k -= 1) {
			const { inset, z } = this.#fillet(k);
			const alpha = (k / K) * (Math.PI / 2);
			rings.push(
				this.#pushRing(inset, -z, (normal) => [
					normal[0] * Math.sin(alpha),
					normal[1] * Math.sin(alpha),
					-Math.cos(alpha),
				]),
			);
		}
		return rings;
	}

	addContour(outline: Contour, normals2d: Contour, bevel: Contour): void {
		this.#outline = outline;
		this.#normals2d = normals2d;
		const n = outline.length;
		const { halfThickness: T, filletRadius: r } = this.#profile;
		if (this.perContour.length > 0) this.holeStarts.push(this.capCoordinates.length / 2);
		const coordinateStart = this.capCoordinates.length / 2;
		for (const point of bevel) this.capCoordinates.push(...point);
		const frontCap = this.#pushRing(r, T, () => [0, 0, 1]);
		for (let i = 0; i < n; i += 1) this.frontCapVertices.push(frontCap + i);
		const frontRings = this.#frontRings();
		const wallTop = frontRings.at(-1);
		if (wallTop === undefined) throw new Error("Fillet profile has no front rings");
		const wallBottom = this.#pushRing(0, -(T - r), (normal) => [normal[0], normal[1], 0]);
		const backRings = this.#backRings();
		const backCap = this.#pushRing(r, -T, () => [0, 0, -1]);
		for (let i = 0; i < n; i += 1) this.backCapVertices.push(backCap + i);
		let upper = frontCap;
		for (const ring of frontRings) {
			this.#linkRings(upper, ring);
			upper = ring;
		}
		this.#linkRings(wallTop, wallBottom);
		upper = wallBottom;
		for (const ring of backRings) {
			this.#linkRings(upper, ring);
			upper = ring;
		}
		this.#linkRings(upper, backCap);
		this.perContour.push({ coordinateStart, frontStart: frontCap, backStart: backCap, count: n });
	}
}

// Sweeps every contour through a quarter-circle fillet profile and returns the
// side-wall mesh plus per-contour cap vertex ranges. Cap triangulation policy
// (holes vs disjoint outers) stays with the caller.
export function buildSweptSolid(
	contours: readonly Contour[],
	contourNormals2d: readonly Contour[],
	bevelContours: readonly Contour[],
	profile: FilletProfile,
): SweptSolid {
	const solid = new MeshSweep(profile);
	for (const [i, outline] of contours.entries()) {
		const normals = contourNormals2d[i];
		const bevel = bevelContours[i];
		if (normals === undefined || bevel === undefined)
			throw new Error("Contour sweep data is missing");
		solid.addContour(outline, normals, bevel);
	}
	return solid;
}
