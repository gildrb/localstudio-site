import { expect, test } from "bun:test";
import { decodeGltfMesh } from "../../packages/logo-renderer/src/renderer/mesh";
import { extractApertures } from "../../packages/logo-renderer/src/renderer/render/apertures";
import { createPrismRibbonVertices, PRISM_BEAM_SLICES } from "../../packages/logo-renderer/src/renderer/render/prism/ribbons";
import type { MeshData } from "../../packages/logo-renderer/src/renderer/render/types";

const logoUrl = new URL("../../public/localai/localai-logo.gltf", import.meta.url);
const logo = await decodeGltfMesh(await Bun.file(logoUrl).json(), (uri) =>
  Bun.file(new URL(uri, logoUrl)).arrayBuffer());
const stride = 5;
const verticesPerSlice = 12;
const verticesPerHole = 24 * verticesPerSlice;
const ribbons = createPrismRibbonVertices(logo);
type Point = readonly [number, number];

function boundaryDistance(point: Point, polygon: readonly Point[]) {
  let distance = Infinity;
  for (const [index, a] of polygon.entries()) {
    const b = polygon[(index + 1) % polygon.length]!;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1,
      ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy)));
    distance = Math.min(distance, Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy));
  }
  return distance;
}

function insideOrOnBoundary(point: Point, polygon: readonly Point[]) {
  if (boundaryDistance(point, polygon) < 2e-7) return true;
  let inside = false;
  for (const [index, a] of polygon.entries()) {
    const b = polygon[(index + 1) % polygon.length]!;
    if ((a[1] > point[1]) !== (b[1] > point[1])
      && point[0] < a[0] + (point[1] - a[1]) * (b[0] - a[0]) / (b[1] - a[1])) inside = !inside;
  }
  return inside;
}

test("real logo emits 864 finite five-float ribbon vertices from three apertures", () => {
  expect(extractApertures(logo)).toHaveLength(3);
  expect(PRISM_BEAM_SLICES).toBe(24);
  expect(ribbons).toBeInstanceOf(Float32Array);
  expect(ribbons.length % stride).toBe(0);
  expect(ribbons.length / stride).toBe(864);
  for (let offset = 0; offset < ribbons.length; offset += stride) {
    for (const value of ribbons.subarray(offset, offset + stride)) expect(Number.isFinite(value)).toBe(true);
    expect(ribbons[offset + 2]).toBe(0);
    expect(ribbons[offset + 3]).toBeGreaterThanOrEqual(-1);
    expect(ribbons[offset + 3]).toBeLessThanOrEqual(1);
  }
});

test("24 nonoverlapping strips share exact radial edges and both ray segments", () => {
  for (let hole = 0; hole < 3; hole++) {
    const holeOffset = hole * verticesPerHole * stride;
    const profiles = new Set<number>();
    let radialWidth = 0;
    for (let slice = 0; slice < 24; slice++) {
      const offset = holeOffset + slice * verticesPerSlice * stride;
      const high = Math.fround(-1 + 2 * (slice + 1) / 24), low = Math.fround(-1 + 2 * slice / 24);
      const radial = [low, high, low, low, high, high];
      for (const [segment, [start, end]] of ([[0.001, 1], [1, 1.8]] as const).entries()) {
        const extent = [start, start, end, end, start, end].map((value) => Math.fround(value));
        for (let vertex = 0; vertex < 6; vertex++) {
          const base = offset + (segment * 6 + vertex) * stride;
          expect(ribbons[base + 3]).toBe(radial[vertex]);
          expect(ribbons[base + 4]).toBe(extent[vertex]);
          profiles.add(ribbons[base + 3]!);
          expect(ribbons.subarray(base, base + 4)).toEqual(
            ribbons.subarray(offset + vertex * stride, offset + vertex * stride + 4));
        }
      }
      if (slice > 0) expect(ribbons.subarray(offset, offset + 4)).toEqual(
        ribbons.subarray(offset - verticesPerSlice * stride + stride, offset - verticesPerSlice * stride + stride + 4));
      radialWidth += high - low;
    }
    expect(profiles.size).toBe(25);
    for (const profile of [-1, 0, 1]) expect(profiles.has(profile)).toBe(true);
    expect(radialWidth).toBeCloseTo(2, 12);
  }
});

test("each ribbon axis stays inside its actual hole and meets the exact contour", () => {
  const height = logo.bounds.max[1] - logo.bounds.min[1];
  const middleX = (logo.bounds.min[0] + logo.bounds.max[0]) / 2;
  const middleY = (logo.bounds.min[1] + logo.bounds.max[1]) / 2;
  for (const [index, aperture] of extractApertures(logo).entries()) {
    // Independent glTF-to-glyph normalization: center XY, divide by full glyph height.
    const polygon = aperture.points.map(([x, y]): Point => [(x - middleX) / height, (y - middleY) / height]);
    const center: Point = [(aperture.centroid[0] - middleX) / height, (aperture.centroid[1] - middleY) / height];
    const offset = index * verticesPerHole * stride;
    const data = ribbons.subarray(offset, offset + verticesPerHole * stride);
    for (let vertex = 0; vertex < data.length; vertex += stride) {
      const point: Point = [data[vertex]!, data[vertex + 1]!];
      expect(insideOrOnBoundary(point, polygon)).toBe(true);
      if (Math.abs(data[vertex + 3]!) === 1) expect(boundaryDistance(point, polygon)).toBeLessThan(2e-7);
      if (data[vertex + 3] === 0) {
        expect(point[0]).toBeCloseTo(center[0], 6);
        expect(point[1]).toBeCloseTo(center[1], 6);
      }
    }
    // The principal direction diagonalizes the contour covariance independently.
    const axisX = data[0]! - center[0], axisY = data[1]! - center[1];
    const length = Math.hypot(axisX, axisY);
    let crossCovariance = 0;
    for (const point of polygon) {
      const x = point[0] - center[0], y = point[1] - center[1];
      crossCovariance += ((x * axisX + y * axisY) / length) * ((-x * axisY + y * axisX) / length);
    }
    expect(length).toBeGreaterThan(0);
    expect(crossCovariance).toBeCloseTo(0, 6);
  }
});

test("ribbon generation is deterministic and leaves all source mesh data untouched", () => {
  const before = structuredClone(logo);
  const first = createPrismRibbonVertices(logo), second = createPrismRibbonVertices(logo);
  expect(first).toEqual(second);
  expect(first).not.toBe(second);
  expect(logo).toEqual(before);
});

test("mesh translation and unit scaling preserve normalized ribbon geometry", () => {
  const scale = 4;
  const shift = [2, -3, 5] as const;
  const moved: MeshData = {
    positions: logo.positions.map((value, index) => value * scale + shift[index % 3]!),
    normals: logo.normals.slice(), indices: logo.indices.slice(),
    bounds: {
      min: [logo.bounds.min[0] * scale + shift[0], logo.bounds.min[1] * scale + shift[1], logo.bounds.min[2] * scale + shift[2]],
      max: [logo.bounds.max[0] * scale + shift[0], logo.bounds.max[1] * scale + shift[1], logo.bounds.max[2] * scale + shift[2]],
    },
  };
  const transformed = createPrismRibbonVertices(moved);
  expect(transformed).toHaveLength(ribbons.length);
  for (let index = 0; index < ribbons.length; index++) expect(transformed[index]).toBeCloseTo(ribbons[index]!, 5);
});

test("empty mesh and a solid front cap emit no aperture ribbons", () => {
  const empty: MeshData = { positions: new Float32Array(), normals: new Float32Array(),
    indices: new Uint32Array(), bounds: { min: [0, 0, 0], max: [0, 0, 0] } };
  expect(createPrismRibbonVertices(empty)).toEqual(new Float32Array());
  const solid: MeshData = {
    positions: new Float32Array([-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1]),
    normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3]), bounds: { min: [-1, -1, 1], max: [1, 1, 1] },
  };
  expect(createPrismRibbonVertices(solid)).toEqual(new Float32Array());
});
