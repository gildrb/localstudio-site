// Regenerates public/localai/localai-logo.gltf from the brand SVG path.
// Produces a dense outline (adaptive bezier flattening) swept through a true
// quarter-circle fillet so bevel shading is analytically smooth — no faceted
// chamfer bands. Caps are triangulated with earcut.
//
// Usage: vp run --filter @local-ai/logo-renderer generate

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
const SOURCE_SVG = path.join(ROOT, "public/images/localai_dark.svg");
const OUT_GLTF = path.join(ROOT, "public/localai/localai-logo.gltf");
const OUT_BIN = path.join(ROOT, "public/localai/localai-logo.bin");
const CHECK = process.argv.includes("--check");

// The cloud mark subpath in localai_dark.svg, extracted verbatim (relative to
// the end of the badge subpath it follows in the file).
const CLOUD_PATH_DATA =
	"m147.531,214.629c-1.812,5.375 -4.179,10.651 -7.123,15.75c-19.136,33.148 -56.879,48.918 -92.453,41.742c11.571,-34.396 44.099,-59.198 82.374,-59.198c5.888,0 11.641,0.587 17.202,1.706c12.941,-38.4 -2.499,-81.906 -38.93,-102.937c-36.443,-21.039 -81.858,-12.642 -108.637,17.793c3.74,4.247 7.117,8.924 10.056,14.01c19.148,33.136 13.952,73.703 -10.032,100.931c-23.995,-27.218 -29.209,-67.783 -10.075,-100.927c2.937,-5.087 6.312,-9.765 10.05,-14.014c-26.792,-30.423 -72.211,-38.801 -108.645,-17.747c-36.405,21.037 -51.83,64.52 -38.904,102.902c5.578,-1.126 11.348,-1.716 17.255,-1.716c38.281,0 70.813,24.811 82.38,59.215c-35.576,7.199 -73.334,-8.555 -92.488,-41.7c-2.956,-5.115 -5.331,-10.406 -7.147,-15.799c-39.7,8.012 -69.631,43.123 -69.631,85.17c0,47.954 38.932,86.886 86.886,86.886c0.378,0 0.755,-0.002 1.132,-0.007l258.401,0c0.375,0.005 0.75,0.007 1.126,0.007c47.954,0 86.886,-38.932 86.886,-86.886c0,-42.065 -29.958,-77.189 -69.684,-85.181Z";

// Model-space targets matching the previous Blender export so camera framing is unchanged.
const TARGET_HEIGHT = 0.147861;
const HALF_THICKNESS = 0.0115;
// The cloud has six narrow concave joins. Insets above 0.0013 self-intersect
// there, so keep the analytic fillet below that measured clearance.
const FILLET_RADIUS = 0.0012;
const FILLET_STEPS = 10;
const CLIPPER_SCALE = 100_000_000;
const CONTACT_CLOSE_RADIUS = 0.001;
const CONTACT_ARC_TOLERANCE = 0.00002;

function closePointContacts(outline: Contour): Contour[] {
	const clipperPath = outline.map(([x, y]) => ({
		X: Math.round(x * CLIPPER_SCALE),
		Y: Math.round(y * CLIPPER_SCALE),
	}));
	const offset = new ClipperLib.ClipperOffset(2, Math.round(CONTACT_ARC_TOLERANCE * CLIPPER_SCALE));
	offset.AddPath(clipperPath, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
	const solution: ClipperLib.Paths = [];
	offset.Execute(solution, Math.round(CONTACT_CLOSE_RADIUS * CLIPPER_SCALE));
	if (solution.length < 2)
		throw new Error("Logo contact closing did not preserve its negative spaces");

	const contours = solution
		.map((result) => result.map(({ X, Y }): Point => [X / CLIPPER_SCALE, Y / CLIPPER_SCALE]))
		.toSorted((a, b) => Math.abs(signedArea(b)) - Math.abs(signedArea(a)));
	for (let i = 0; i < contours.length; i += 1) {
		const shouldBePositive = i === 0;
		const contour = contours[i];
		if (contour === undefined) throw new Error("Contour is missing");
		if (signedArea(contour) > 0 !== shouldBePositive) contour.reverse();
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
	return contours.map((contour) =>
		contour.map(([x, y]): Point => [(x - cx) * scale, (y - cy) * scale]),
	);
}

function buildMesh() {
	const parsed = parseSubpath(CLOUD_PATH_DATA).map(dedupeContour);
	const source = parsed.reduce((longest, current) =>
		current.length > longest.length ? current : longest,
	);
	if (!source.length) throw new Error("No usable contour found in path data");

	for (let i = 0; i < source.length; i += 1) {
		const point = source[i];
		if (point === undefined) throw new Error("Contour point is missing");
		source[i] = [point[0], -point[1]];
	}
	if (signedArea(source) < 0) source.reverse();

	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	for (const [x, y] of source) {
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
	}
	const sourceScale = TARGET_HEIGHT / (maxY - minY);
	const sourceCenterX = (minX + maxX) / 2;
	const sourceCenterY = (minY + maxY) / 2;
	const sourceOutline = dedupeContour(
		source.map(([x, y]): Point => [
			(x - sourceCenterX) * sourceScale,
			(y - sourceCenterY) * sourceScale,
		]),
	);
	// The SVG uses three point contacts to bridge its holes into one fill path.
	// Give those joins finite width before extrusion so every 3D edge is smooth.
	const contours = closePointContacts(sourceOutline);
	const contourNormals2d = contours.map(contourNormals);
	const bevelContours = contours.map((contour, contourIndex) =>
		contour.map((point, i): Point => {
			const normal = contourNormals2d[contourIndex]?.[i];
			if (normal === undefined) throw new Error("Contour point normal is missing");
			return [point[0] - normal[0] * FILLET_RADIUS, point[1] - normal[1] * FILLET_RADIUS];
		}),
	);
	contours.forEach((contour, i) => assertSimpleContour(contour, `logo contour ${i}`));
	bevelContours.forEach((contour, i) => assertSimpleContour(contour, `logo bevel inset ${i}`));
	assertDisjointContours(bevelContours, "logo bevel inset");

	const solid = buildSweptSolid(contours, contourNormals2d, bevelContours, {
		halfThickness: HALF_THICKNESS,
		filletRadius: FILLET_RADIUS,
		filletSteps: FILLET_STEPS,
	});

	const capTriangulation = solid.earcut(solid.capCoordinates, solid.holeStarts, 2);
	const indices = [...solid.indices];
	for (let i = 0; i < capTriangulation.length; i += 3) {
		const a = capTriangulation[i];
		const b = capTriangulation[i + 1];
		const c = capTriangulation[i + 2];
		if (a === undefined || b === undefined || c === undefined)
			throw new Error("Incomplete cap triangle");
		const frontA = solid.frontCapVertices[a];
		const frontB = solid.frontCapVertices[b];
		const frontC = solid.frontCapVertices[c];
		const backC = solid.backCapVertices[c];
		const backB = solid.backCapVertices[b];
		const backA = solid.backCapVertices[a];
		if (
			frontA === undefined ||
			frontB === undefined ||
			frontC === undefined ||
			backC === undefined ||
			backB === undefined ||
			backA === undefined
		)
			throw new Error("Cap triangle vertex is missing");
		indices.push(frontA, frontB, frontC, backC, backB, backA);
	}

	return {
		positions: new Float32Array(solid.positions),
		normals: new Float32Array(solid.normals),
		indices: new Uint32Array(indices),
		outlineCount: contours.reduce((sum, contour) => sum + contour.length, 0),
	};
}

const source = fs.readFileSync(SOURCE_SVG, "utf8");
if (!source.includes(CLOUD_PATH_DATA)) {
	throw new Error(`logo source does not contain the expected cloud path: ${SOURCE_SVG}`);
}
writeGltf(buildMesh(), {
	outGltf: OUT_GLTF,
	outBin: OUT_BIN,
	binUri: "localai-logo.bin",
	generator: "ls-web scripts/generate-logo-mesh.mjs",
	name: "LocalAI",
	check: CHECK,
});
