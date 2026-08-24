// Regenerates public/localai/localai-logo.gltf from the brand SVG path.
// Produces a dense outline (adaptive bezier flattening) swept through a true
// quarter-circle fillet so bevel shading is analytically smooth — no faceted
// chamfer bands. Caps are triangulated with earcut.
//
// Usage: pnpm --filter @local-ai/logo-renderer generate

import earcut from "earcut";
import fs from "node:fs";
import path from "node:path";

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
const FILLET_RADIUS = 0.0055;
const FILLET_STEPS = 10;
const FLATTEN_TOLERANCE = 0.06; // svg units; silhouette smoothness budget
const MAX_BEZIER_DEPTH = 24;

function parseSubpath(data) {
  // Supports the subset used by the brand path: relative m, c, l and Z.
  const tokens = data.match(/[mclz]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  let i = 0;
  let cursor = [0, 0];
  let start = [0, 0];
  const contours = [];
  let contour = [];
  const readPoint = () => {
    const x = Number(tokens[i++]);
    const y = Number(tokens[i++]);
    return [x, y];
  };
  while (i < tokens.length) {
    const cmd = tokens[i++].toLowerCase();
    if (cmd === "m") {
      if (contour.length > 1) contours.push(contour);
      const p = readPoint();
      cursor = [cursor[0] + p[0], cursor[1] + p[1]];
      start = [...cursor];
      contour = [cursor];
    } else if (cmd === "c") {
      const c1 = [cursor[0] + Number(tokens[i++]), cursor[1] + Number(tokens[i++])];
      const c2 = [cursor[0] + Number(tokens[i++]), cursor[1] + Number(tokens[i++])];
      const end = [cursor[0] + Number(tokens[i++]), cursor[1] + Number(tokens[i++])];
      contour.push(...flattenCubic(cursor, c1, c2, end, 0));
      cursor = end;
    } else if (cmd === "l") {
      const p = readPoint();
      cursor = [cursor[0] + p[0], cursor[1] + p[1]];
      contour.push(cursor);
    } else if (cmd === "z") {
      contour.push(start);
      cursor = [...start];
    } else {
      throw new Error(`Unsupported path command: ${cmd}`);
    }
  }
  if (contour.length > 1) contours.push(contour);
  return contours;
}

function flattenCubic(p0, p1, p2, p3, depth) {
  // Flatness: control points close to the chord p0->p3.
  const dx = p3[0] - p0[0];
  const dy = p3[1] - p0[1];
  const d1 = Math.abs((p1[0] - p3[0]) * dy - (p1[1] - p3[1]) * dx);
  const d2 = Math.abs((p2[0] - p3[0]) * dy - (p2[1] - p3[1]) * dx);
  if (depth >= MAX_BEZIER_DEPTH || (d1 + d2) ** 2 <= FLATTEN_TOLERANCE ** 2 * (dx * dx + dy * dy)) {
    return depth === 0 ? [p3] : [p3];
  }
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
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

function dedupeContour(points) {
  const out = [];
  for (const p of points) {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 1e-6) out.push(p);
  }
  while (
    out.length > 1 &&
    Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) <= 1e-6
  ) {
    out.pop();
  }
  return out;
}

function signedArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  return area / 2;
}

function contourNormals(points) {
  // Outward 2D normals from neighbor tangents. The dense adaptive sampling
  // keeps these smooth along G1 logo curves.
  const n = points.length;
  const normals = Array.from({ length: n });
  for (let i = 0; i < n; i += 1) {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    let tx = next[0] - prev[0];
    let ty = next[1] - prev[1];
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    // For CCW winding, (ty, -tx) points outward.
    normals[i] = [ty, -tx];
  }
  return normals;
}

function buildMesh() {
  const contours = parseSubpath(CLOUD_PATH_DATA).map(dedupeContour);
  const contour = contours.reduce((longest, current) =>
    current.length > longest.length ? current : longest,
  );
  if (!contour.length) throw new Error("No usable contour found in path data");

  // Work in y-up CCW space (SVG is y-down).
  for (let i = 0; i < contour.length; i += 1) {
    contour[i] = [contour[i][0], -contour[i][1]];
  }
  if (signedArea(contour) < 0) contour.reverse();

  // Fit into model space: height TARGET_HEIGHT, centered on the bbox center.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of contour) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const scale = TARGET_HEIGHT / (maxY - minY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const outline = contour.map(([x, y]) => [(x - cx) * scale, (y - cy) * scale]);
  const n = outline.length;
  const normals2d = contourNormals(outline);

  const positions = [];
  const normals = [];
  const indices = [];
  const ringStarts = []; // per ring: first vertex index, rings have n vertices

  const pushRing = (inset, z, normalFor) => {
    const start = positions.length / 3;
    for (let i = 0; i < n; i += 1) {
      const p = outline[i];
      const nrm = normals2d[i];
      positions.push(p[0] - nrm[0] * inset, p[1] - nrm[1] * inset, z);
      const [rnx, rny, rnz] = normalFor(i);
      normals.push(rnx, rny, rnz);
    }
    ringStarts.push(start);
    return start;
  };

  // Ring order: front cap rim (+T) -> front fillet k=1..K -> wall bottom ->
  // back fillet k=K-1..1 -> back cap rim (-T). The fillet k=K ring coincides
  // with the wall top, so the wall reuses the front fillet K ring.
  const T = HALF_THICKNESS;
  const r = FILLET_RADIUS;
  const K = FILLET_STEPS;
  const fillet = (k) => {
    const alpha = (k / K) * (Math.PI / 2);
    return { inset: r * Math.sin(alpha), z: T - r + r * Math.cos(alpha) };
  };

  const frontCap = pushRing(0, T, () => [0, 0, 1]);
  const frontRings = [];
  for (let k = 1; k <= K; k += 1) {
    const { inset, z } = fillet(k);
    const alpha = (k / K) * (Math.PI / 2);
    const sinA = Math.sin(alpha);
    const cosA = Math.cos(alpha);
    frontRings.push(
      pushRing(inset, z, (i) => {
        const nrm = normals2d[i];
        return [nrm[0] * sinA, nrm[1] * sinA, cosA];
      }),
    );
  }
  const wallTop = frontRings[frontRings.length - 1];
  const wallBottom = pushRing(r, -(T - r), (i) => {
    const nrm = normals2d[i];
    return [nrm[0], nrm[1], 0];
  });
  const backRings = [];
  for (let k = K - 1; k >= 1; k -= 1) {
    const { inset, z } = fillet(k);
    const alpha = (k / K) * (Math.PI / 2);
    const sinA = Math.sin(alpha);
    const cosA = Math.cos(alpha);
    backRings.push(
      pushRing(inset, -z, (i) => {
        const nrm = normals2d[i];
        return [nrm[0] * sinA, nrm[1] * sinA, -cosA];
      }),
    );
  }
  const backCap = pushRing(0, -T, () => [0, 0, -1]);

  const linkRings = (a, b) => {
    // `a` is the upper ring (closer to +z), `b` the lower one. With the outline
    // CCW in y-up space, this order faces the triangles outward.
    for (let i = 0; i < n; i += 1) {
      const j = (i + 1) % n;
      const a0 = a + i;
      const a1 = a + j;
      const b0 = b + i;
      const b1 = b + j;
      indices.push(a0, b0, b1, a0, b1, a1);
    }
  };

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

  // Caps.
  const capTriangulation = earcut(outline.flat());
  for (let i = 0; i < capTriangulation.length; i += 3) {
    // Front cap faces +z: CCW in xy is CCW viewed from +z.
    indices.push(
      frontCap + capTriangulation[i],
      frontCap + capTriangulation[i + 1],
      frontCap + capTriangulation[i + 2],
    );
    // Back cap faces -z: reverse winding.
    indices.push(
      backCap + capTriangulation[i + 2],
      backCap + capTriangulation[i + 1],
      backCap + capTriangulation[i],
    );
  }

  return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint32Array(indices), outlineCount: n };
}

function writeGltf(mesh) {
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
    minX = Math.min(minX, mesh.positions[i]);
    maxX = Math.max(maxX, mesh.positions[i]);
    minY = Math.min(minY, mesh.positions[i + 1]);
    maxY = Math.max(maxY, mesh.positions[i + 1]);
    minZ = Math.min(minZ, mesh.positions[i + 2]);
    maxZ = Math.max(maxZ, mesh.positions[i + 2]);
  }

  const gltf = {
    asset: { generator: "ls-web scripts/generate-logo-mesh.mjs", version: "2.0" },
    scene: 0,
    scenes: [{ name: "Scene", nodes: [0] }],
    nodes: [{ mesh: 0, name: "LocalAI" }],
    meshes: [
      {
        name: "LocalAI",
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
    buffers: [{ byteLength: bufferLength, uri: "localai-logo.bin" }],
  };

  const gltfBody = `${JSON.stringify(gltf, null, "\t")}\n`;
  if (CHECK) {
    const mismatches = [];
    if (!fs.existsSync(OUT_BIN) || !Buffer.from(fs.readFileSync(OUT_BIN)).equals(Buffer.from(buffer))) {
      mismatches.push(OUT_BIN);
    }
    if (!fs.existsSync(OUT_GLTF) || fs.readFileSync(OUT_GLTF, "utf8") !== gltfBody) {
      mismatches.push(OUT_GLTF);
    }
    if (mismatches.length) {
      console.error(`logo mesh outputs are stale:\n${mismatches.join("\n")}`);
      process.exitCode = 1;
      return;
    }
    console.log(`logo mesh outputs ok (${bufferLength} bytes, ${vertexCount} vertices)`);
    return;
  }
  fs.writeFileSync(OUT_BIN, buffer);
  fs.writeFileSync(OUT_GLTF, gltfBody);
  console.log(
    `wrote ${OUT_GLTF} (${bufferLength} bytes): ${vertexCount} vertices, ${mesh.indices.length / 3} triangles, outline ${mesh.outlineCount} points`,
  );
}

const source = fs.readFileSync(SOURCE_SVG, "utf8");
if (!source.includes(CLOUD_PATH_DATA)) {
  throw new Error(`logo source does not contain the expected cloud path: ${SOURCE_SVG}`);
}
writeGltf(buildMesh());
