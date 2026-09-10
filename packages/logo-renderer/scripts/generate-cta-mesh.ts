// Regenerates public/localai/cta-mark.gltf from the closing-CTA brand SVG.
// The mark is three disjoint petals (no holes), so every parsed contour is
// kept and caps are triangulated per contour.
//
// Usage: vp run --filter @local-ai/logo-renderer generate:cta

import fs from "node:fs";
import path from "node:path";
import {
	parseSubpath,
	dedupeContour,
	signedArea,
	contourNormals,
	normalizeContours,
	insetContours,
	type Contour,
	type Point,
} from "./mesh-generator.lib.ts";
import { assertSimpleContour, assertDisjointContours } from "./mesh-contour-validation.ts";
import { buildSweptSolid, type SweptSolid } from "./mesh-sweep.ts";
import { writeGltf } from "./mesh-gltf.ts";
import { offsetContour } from "./mesh-clipper.ts";
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

function roundTips(contour: Contour): Point[] {
	const solution = offsetContour(contour, {
		scale: CLIPPER_SCALE,
		arcTolerance: CLIPPER_ARC_TOLERANCE,
		radius: TIP_ROUND_RADIUS,
	});
	const [rounded] = solution;
	if (solution.length !== 1 || rounded === undefined)
		throw new Error(`tip rounding changed the petal contour count: ${solution.length}`);
	return rounded;
}

const source = fs.readFileSync(SOURCE_SVG, "utf8");
const match = source.match(/<path[^>]*\sd="([^"]+)"/u);
const PATH_DATA = match?.[1];
if (PATH_DATA === undefined) throw new Error(`no path data found in ${SOURCE_SVG}`);

function roundedContours(data: string): Point[][] {
	const contours = parseSubpath(data)
		.map((contour: Contour) => dedupeContour(contour))
		.filter((contour: Contour) => contour.length > 2);
	if (contours.length === 0) throw new Error("no usable contour found in path data");
	for (const contour of contours) {
		for (const [i, [x, y]] of contour.entries()) contour[i] = [x, -y];
		if (signedArea(contour) < 0) contour.reverse();
	}
	const normalized = normalizeContours(contours, TARGET_HEIGHT).map((contour: Contour) =>
		dedupeContour(contour),
	);
	return normalized
		.map((contour: Contour) => roundTips(contour))
		.map((contour: Contour) => dedupeContour(contour));
}

function capIndices(solid: SweptSolid): number[] {
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
	return indices;
}

function buildMesh(data: string) {
	const rounded = roundedContours(data);
	const contourNormals2d = rounded.map((contour: Contour) => contourNormals(contour));
	const bevelContours = insetContours(rounded, contourNormals2d, FILLET_RADIUS);
	for (const [i, contour] of rounded.entries()) assertSimpleContour(contour, `cta contour ${i}`);
	for (const [i, contour] of bevelContours.entries())
		assertSimpleContour(contour, `cta bevel inset ${i}`);
	assertDisjointContours(bevelContours, "cta bevel inset");
	const solid = buildSweptSolid(rounded, contourNormals2d, bevelContours, {
		halfThickness: HALF_THICKNESS,
		filletRadius: FILLET_RADIUS,
		filletSteps: FILLET_STEPS,
	});
	return {
		positions: new Float32Array(solid.positions),
		normals: new Float32Array(solid.normals),
		indices: new Uint32Array(capIndices(solid)),
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
