// Regenerates public/localai/cta-mark.gltf from the closing-CTA brand SVG.
// The mark is three disjoint petals (no holes), so every parsed contour is
// kept and caps are triangulated per contour.
//
// Usage: vp run --filter @local-ai/logo-renderer generate:cta

import ClipperLib from "clipper-lib";
import fs from "node:fs";
import path from "node:path";
import {
	parseSubpath,
	dedupeContour,
	signedArea,
	contourNormals,
	assertSimpleContour,
	assertDisjointContours,
	buildSweptSolid,
	writeGltf,
	type Contour,
	type Point,
} from "./mesh-generator.lib.ts";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const SOURCE_SVG = path.join(ROOT, "public/images/cta-mark.svg");
const OUT_GLTF = path.join(ROOT, "public/localai/cta-mark.gltf");
const OUT_BIN = path.join(ROOT, "public/localai/cta-mark.bin");
const CHECK = process.argv.includes("--check");

// Same model-space scale as the hero mark so camera and paint-grid constants
// behave identically across both instances.
const TARGET_HEIGHT = 0.147861;
const HALF_THICKNESS = 0.0115;
// Petal tips are needle-sharp: an analytic inset crosses itself there. Round
// them outward with Clipper first, then keep the fillet inside that radius.
// Hero parity: the fillet matches the hero mark's 0.0012 bevel exactly; tips
// round just above it so no needle geometry aliases, without bloating the
// petal silhouette.
const TIP_ROUND_RADIUS = 0.0018;
const FILLET_RADIUS = 0.0012;
const FILLET_STEPS = 10;
const CLIPPER_SCALE = 100_000_000;
const CLIPPER_ARC_TOLERANCE = 0.00002;

function roundTips(contour: Contour): Contour {
	const clipperPath = contour.map(([x, y]) => ({
		X: Math.round(x * CLIPPER_SCALE),
		Y: Math.round(y * CLIPPER_SCALE),
	}));
	const offset = new ClipperLib.ClipperOffset(2, Math.round(CLIPPER_ARC_TOLERANCE * CLIPPER_SCALE));
	offset.AddPath(clipperPath, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
	const solution: ClipperLib.Paths = [];
	offset.Execute(solution, Math.round(TIP_ROUND_RADIUS * CLIPPER_SCALE));
	const rounded = solution[0];
	if (solution.length !== 1 || rounded === undefined)
		throw new Error(`tip rounding changed the petal contour count: ${solution.length}`);
	return rounded.map(({ X, Y }): Point => [X / CLIPPER_SCALE, Y / CLIPPER_SCALE]);
}

const source = fs.readFileSync(SOURCE_SVG, "utf8");
const match = source.match(/<path[^>]*\sd="([^"]+)"/);
const PATH_DATA = match?.[1];
if (PATH_DATA === undefined) throw new Error(`no path data found in ${SOURCE_SVG}`);

function buildMesh(data: string) {
	const contours = parseSubpath(data)
		.map(dedupeContour)
		.filter((contour) => contour.length > 2);
	if (contours.length < 1) throw new Error("no usable contour found in path data");

	for (const contour of contours) {
		for (let i = 0; i < contour.length; i += 1) {
			const point = contour[i];
			if (point === undefined) throw new Error("Contour point is missing");
			contour[i] = [point[0], -point[1]];
		}
		if (signedArea(contour) < 0) contour.reverse();
	}

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
	const scale = TARGET_HEIGHT / (maxY - minY);
	const cx = (minX + maxX) / 2;
	const cy = (minY + maxY) / 2;
	const normalized = contours.map((contour) =>
		dedupeContour(contour.map(([x, y]): Point => [(x - cx) * scale, (y - cy) * scale])),
	);

	const rounded = normalized.map(roundTips).map(dedupeContour);
	const contourNormals2d = rounded.map(contourNormals);
	const bevelContours = rounded.map((contour, contourIndex) =>
		contour.map((point, i): Point => {
			const normal = contourNormals2d[contourIndex]?.[i];
			if (normal === undefined) throw new Error("Contour point normal is missing");
			return [point[0] - normal[0] * FILLET_RADIUS, point[1] - normal[1] * FILLET_RADIUS];
		}),
	);
	rounded.forEach((contour, i) => assertSimpleContour(contour, `cta contour ${i}`));
	bevelContours.forEach((contour, i) => assertSimpleContour(contour, `cta bevel inset ${i}`));
	assertDisjointContours(bevelContours, "cta bevel inset");

	const solid = buildSweptSolid(rounded, contourNormals2d, bevelContours, {
		halfThickness: HALF_THICKNESS,
		filletRadius: FILLET_RADIUS,
		filletSteps: FILLET_STEPS,
	});

	// Disjoint outers: triangulate each cap ring separately (no hole starts).
	const indices = [...solid.indices];
	for (const group of solid.perContour) {
		const coords: number[] = [];
		for (let i = 0; i < group.count; i += 1) {
			const o = (group.coordinateStart + i) * 2;
			const x = solid.capCoordinates[o];
			const y = solid.capCoordinates[o + 1];
			if (x === undefined || y === undefined) throw new Error("Cap coordinate is missing");
			coords.push(x, y);
		}
		const tri = solid.earcut(coords);
		for (let i = 0; i < tri.length; i += 3) {
			const a = tri[i];
			const b = tri[i + 1];
			const c = tri[i + 2];
			if (a === undefined || b === undefined || c === undefined)
				throw new Error("Incomplete cap triangle");
			indices.push(
				group.frontStart + a,
				group.frontStart + b,
				group.frontStart + c,
				group.backStart + c,
				group.backStart + b,
				group.backStart + a,
			);
		}
	}

	return {
		positions: new Float32Array(solid.positions),
		normals: new Float32Array(solid.normals),
		indices: new Uint32Array(indices),
	};
}

writeGltf(buildMesh(PATH_DATA), {
	outGltf: OUT_GLTF,
	outBin: OUT_BIN,
	binUri: "cta-mark.bin",
	generator: "ls-web scripts/generate-cta-mesh.mjs",
	name: "CtaMark",
	check: CHECK,
});
