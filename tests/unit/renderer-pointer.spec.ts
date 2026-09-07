import { expect, test } from "bun:test";
import { writeParams } from "../../packages/logo-renderer/src/renderer/render/params";
import { mapPointerToLocalEnvironment } from "../../packages/logo-renderer/src/renderer/runtime/environment-input";

const rect = { left: 100, top: 200, width: 800, height: 400 };

function mapAt(normalizedX: number, normalizedY: number) {
	return mapPointerToLocalEnvironment({
		clientX: rect.left + rect.width * normalizedX,
		clientY: rect.top + rect.height * normalizedY,
		rect,
	});
}

test("renderer environment interaction follows its own bounds", () => {
	const localPoint = mapAt(0.61, 0.42);
	const translated = mapPointerToLocalEnvironment({
		clientX: rect.left + 500 + rect.width * 0.61,
		clientY: rect.top + 300 + rect.height * 0.42,
		rect: { ...rect, left: rect.left + 500, top: rect.top + 300 },
	});
	expect(translated).toEqual(localPoint);
	expect(mapAt(0.5, 0.5)).toEqual({
		envYaw: 0,
		envPitch: 0,
		normalizedX: 0,
		normalizedY: 0,
	});
});

test("reflections follow both cursor axes within a restrained range", () => {
	const above = mapAt(0.5, -0.25), below = mapAt(0.5, 1.25);
	expect(above.envPitch).toBe(-0.24);
	expect(below.envPitch).toBe(0.24);
	expect(mapAt(0.5, -1)).toEqual(above);
	expect(mapAt(0.5, 2)).toEqual(below);
	expect(mapAt(0, 0.5).envYaw).toBe(-0.35);
	expect(mapAt(1, 0.5).envYaw).toBe(0.35);
	expect(above.envYaw).toBe(0);
});

test("degenerate renderer bounds keep finite interaction values", () => {
	const mapped = mapPointerToLocalEnvironment({
		clientX: 2,
		clientY: -2,
		rect: { left: 0, top: 0, width: 0, height: 0 },
	});
	for (const value of Object.values(mapped)) expect(Number.isFinite(value)).toBe(true);
});


test("rear-depth opening is opt-in, bounded, and shared by material/depth passes", () => {
  const args: Parameters<typeof writeParams>[0] = {
    controls: {
      yaw: 0, pitch: 0, radius: 2, fov: 35, envYaw: 0, envPitch: 0,
      insideRendering: true, outsideRendering: true, material: "glass",
      wireframe: false, showEnv: false,
    },
    logicalWidth: 1000, logicalHeight: 500, passKind: 1,
    projectionPaddingRadius: 20,
    meshBounds: { min: [-1, -1, -0.1], max: [1, 1, 0.1] },
    orbitTarget: [0, 0, 0], thicknessScale: 1, isLight: false,
  };
  expect(writeParams(args).depthTransform).toEqual([1, 0, 0, 0]);
  for (const passKind of [0, 1, 2]) {
    const params = writeParams({ ...args, passKind, controls: { ...args.controls, depthOpening: 1 } });
    expect(params.depthTransform).toEqual([1.12, 0, 0, 0]);
  }
  expect(writeParams({ ...args, controls: { ...args.controls, depthOpening: -1 } }).depthTransform[0]).toBe(1);
  expect(writeParams({ ...args, controls: { ...args.controls, depthOpening: 2 } }).depthTransform[0]).toBe(1.12);
});
