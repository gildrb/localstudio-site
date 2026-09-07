import { extractApertures } from "../apertures";
import { normalizePositionForGpu } from "../camera";
import type { MeshData } from "../types";

export const PRISM_BEAM_OPACITY = 0.72;
export const PRISM_BEAM_SLICES = 24;

/** Exact aperture cross-sections; XYZ anchor, signed radial profile, ray extent. */
export function createPrismRibbonVertices(mesh: MeshData): Float32Array<ArrayBuffer> {
  const data: number[] = [];
  for (const aperture of extractApertures(mesh)) {
    const center = normalizePositionForGpu([...aperture.centroid], mesh.bounds);
    const points = aperture.points.map((point) => normalizePositionForGpu([...point], mesh.bounds));
    // A centroid outside a concave kernel is not a valid emitter section.
    if (points.some((a, index) => {
      const b = points[(index + 1) % points.length]!;
      return (a[0] - center[0]) * (b[1] - center[1])
        - (a[1] - center[1]) * (b[0] - center[0]) > 1e-10;
    })) continue;
    let xx = 0, xy = 0, yy = 0;
    for (const point of points) {
      const x = point[0] - center[0], y = point[1] - center[1];
      xx += x * x; xy += x * y; yy += y * y;
    }
    const angle = 0.5 * Math.atan2(2 * xy, xx - yy);
    const axisX = Math.cos(angle), axisY = Math.sin(angle);
    let negative = -Infinity, positive = Infinity;
    for (let index = 0; index < points.length; index++) {
      const a = points[index]!, b = points[(index + 1) % points.length]!;
      const sideA = (a[1] - center[1]) * axisX - (a[0] - center[0]) * axisY;
      const sideB = (b[1] - center[1]) * axisX - (b[0] - center[0]) * axisY;
      if (Math.abs(sideB - sideA) < 1e-12) continue;
      const t = -sideA / (sideB - sideA);
      if (t < 0 || t > 1) continue;
      const distance = (a[0] + (b[0] - a[0]) * t - center[0]) * axisX
        + (a[1] + (b[1] - a[1]) * t - center[1]) * axisY;
      if (distance < 0) negative = Math.max(negative, distance);
      else positive = Math.min(positive, distance);
    }
    if (!Number.isFinite(negative) || !Number.isFinite(positive)
      || positive - negative <= 1e-8) continue;
    for (let slice = 0; slice < PRISM_BEAM_SLICES; slice++) {
      const low = -1 + 2 * slice / PRISM_BEAM_SLICES;
      const high = -1 + 2 * (slice + 1) / PRISM_BEAM_SLICES;
      for (const [start, end] of [[0.001, 1], [1, 1.8]] as const) {
        for (const [radial, extent] of [
          [low, start], [high, start], [low, end],
          [low, end], [high, start], [high, end],
        ] as const) {
          const offset = radial * (radial < 0 ? -negative : positive);
          data.push(center[0] + axisX * offset, center[1] + axisY * offset,
            center[2], radial, extent);
        }
      }
    }
  }
  return new Float32Array(data);
}
