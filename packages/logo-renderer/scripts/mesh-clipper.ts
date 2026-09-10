import ClipperLib from "clipper-lib";
import type { Contour, Point } from "./mesh-generator.lib.ts";

interface ClipperProfile {
	readonly scale: number;
	readonly arcTolerance: number;
	readonly radius: number;
}

export function offsetContour(contour: Contour, profile: ClipperProfile): Point[][] {
	const { scale, arcTolerance, radius } = profile;
	const clipperPath = contour.map(([x, y]) => ({
		X: Math.round(x * scale),
		Y: Math.round(y * scale),
	}));
	const offset = new ClipperLib.ClipperOffset(2, Math.round(arcTolerance * scale));
	offset.AddPath(clipperPath, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
	const solution: ClipperLib.Paths = [];
	offset.Execute(solution, Math.round(radius * scale));
	return solution.map((result: readonly Readonly<ClipperLib.IntPoint>[]) =>
		result.map(({ X, Y }): Point => [X / scale, Y / scale]),
	);
}
