import type { MeshData } from "./types";

type Point = readonly [number, number, number];
export type Aperture = {
  /** Clockwise model-space front-cap boundary; last connects to first. */
  readonly points: readonly Point[];
  /** Area centroid; it can lie outside a concave aperture. */
  readonly centroid: Point;
  readonly signedArea: number;
};

/** Extract only enclosed openings. Invalid or ambiguous cap topology fails closed. */
export function extractApertures(mesh: MeshData): readonly Aperture[] {
  const { positions, normals, indices, bounds } = mesh;
  const scale = Math.max(...bounds.max.map((value, axis) => value - bounds.min[axis]!));
  if (!Number.isFinite(scale) || scale <= 0 || !Number.isFinite(bounds.max[2])
    || positions.length % 3 || normals.length !== positions.length || indices.length % 3) return [];
  const tolerance = scale * 1e-6;
  const areaTolerance = scale * scale * 1e-12;
  const cap = frontCap(mesh, tolerance);
  if (!cap) return [];
  const { points, capVertices } = cap;
  const next = capBoundary(mesh, points, capVertices, areaTolerance);
  if (!next) return [];
  const loops: Aperture[] = [];
  const visited = new Set<number>();
  // Coordinate ordering makes results independent of triangle submission order.
  // eslint-disable-next-line unicorn/no-array-sort -- Sort a fresh local array; this package targets ES2022.
  const starts = [...next.keys()].sort((a, b) => points[a]![0] - points[b]![0]
    || points[a]![1] - points[b]![1] || points[a]![2] - points[b]![2]);
  for (const start of starts) {
    if (visited.has(start)) continue;
    const boundary: Point[] = [];
    let vertex = start;
    do {
      if (visited.has(vertex)) return [];
      visited.add(vertex);
      boundary.push(points[vertex]!);
      const successor = next.get(vertex);
      if (successor === undefined) return [];
      vertex = successor;
    } while (vertex !== start);
    if (boundary.length < 3) return [];
    const polygon = aperturePolygon(boundary);
    if (Math.abs(polygon.signedArea) <= areaTolerance) return [];
    loops.push(polygon);
  }
  const outer = loops.filter((loop) => loop.signedArea > 0);
  const holes = loops.filter((loop) => loop.signedArea < 0);
  for (const hole of holes) {
    if (outer.filter((loop) => containsPoint(loop.points, hole.points[0]!)).length !== 1) return [];
    if (holes.some((other) => other !== hole && containsPoint(other.points, hole.points[0]!))) return [];
  }
  // eslint-disable-next-line unicorn/no-array-sort -- The filtered array is local; this package targets ES2022.
  return holes.sort((a, b) => a.centroid[0] - b.centroid[0] || a.centroid[1] - b.centroid[1]);
}

function frontCap(mesh: MeshData, tolerance: number) {
  const { positions, normals, bounds } = mesh;
  const points: Point[] = [];
  const canonical = new Map<string, number>();
  const capVertices = new Map<number, number>();
  for (let offset = 0; offset < positions.length; offset += 3) {
    const x = positions[offset]!, y = positions[offset + 1]!, z = positions[offset + 2]!;
    if (![x, y, z, normals[offset], normals[offset + 1], normals[offset + 2]].every((value) => Number.isFinite(value))) return;
    if (Math.abs(z - bounds.max[2]) > tolerance || Math.abs(normals[offset]!) > 1e-5
      || Math.abs(normals[offset + 1]!) > 1e-5 || normals[offset + 2]! < 1 - 1e-5) continue;
    // Weld exact duplicates from split glTF primitives, without rounding the geometry.
    const key = `${x},${y},${z}`;
    let vertex = canonical.get(key);
    if (vertex === undefined) {
      vertex = points.length;
      canonical.set(key, vertex);
      points.push([x, y, z]);
    }
    capVertices.set(offset / 3, vertex);
  }
  return { points, capVertices };
}

function capBoundary(mesh: MeshData, points: readonly Point[], capVertices: ReadonlyMap<number, number>, areaTolerance: number) {
  const { positions, indices } = mesh;
  const edges = new Map<string, { from: number; to: number; count: number }>();
  for (let offset = 0; offset < indices.length; offset += 3) {
    const triangle = [indices[offset]!, indices[offset + 1]!, indices[offset + 2]!];
    if (triangle.some((vertex) => vertex >= positions.length / 3)) return;
    const [a, b, c] = triangle.map((vertex) => capVertices.get(vertex));
    if (a === undefined || b === undefined || c === undefined) continue;
    const pa = points[a]!, pb = points[b]!, pc = points[c]!;
    const cross = (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pb[1] - pa[1]) * (pc[0] - pa[0]);
    if (cross <= areaTolerance) return;
    for (const [from, to] of [[a, b], [b, c], [c, a]] as const) {
      const key = `${Math.min(from, to)},${Math.max(from, to)}`;
      const edge = edges.get(key);
      if (edge) {
        if (edge.count !== 1 || edge.from !== to || edge.to !== from) return;
        edge.count += 1;
      } else edges.set(key, { from, to, count: 1 });
    }
  }
  const next = new Map<number, number>();
  const incoming = new Set<number>();
  for (const { from, to, count } of edges.values()) {
    if (count !== 1) continue;
    if (next.has(from) || incoming.has(to)) return;
    next.set(from, to);
    incoming.add(to);
  }
  if ([...next.keys()].some((vertex) => !incoming.has(vertex))) return;
  return next;
}

function aperturePolygon(points: readonly Point[]): Aperture {
  const origin = points[0]!;
  let cx = 0, cy = 0, twiceArea = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i]!, b = points[(i + 1) % points.length]!;
    const ax = a[0] - origin[0], ay = a[1] - origin[1];
    const bx = b[0] - origin[0], by = b[1] - origin[1];
    const cross = ax * by - bx * ay;
    twiceArea += cross;
    cx += (ax + bx) * cross;
    cy += (ay + by) * cross;
  }
  return {
    points,
    centroid: [origin[0] + cx / (3 * twiceArea), origin[1] + cy / (3 * twiceArea), origin[2]],
    signedArea: twiceArea / 2,
  };
}

function containsPoint(polygon: readonly Point[], point: Point): boolean {
  let inside = false;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i]!, b = polygon[(i + 1) % polygon.length]!;
    if ((a[1] > point[1]) !== (b[1] > point[1])
      && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
