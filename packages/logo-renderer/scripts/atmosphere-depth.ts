import assert from "node:assert/strict";
import { draw, target } from "vgpu/node";
import { createGpuMesh } from "../src/renderer/render/mesh-gpu.ts";
import { writeParams } from "../src/renderer/render/params.ts";
import {
	cameraAxisDepthRange,
	meshOrbitTarget,
	meshThicknessScale,
} from "../src/renderer/render/camera.ts";
import { bloomRadiusForDevicePixelRatio, PASS_OUTSIDE } from "../src/renderer/render/constants.ts";
import depthShader from "../src/renderer/shaders/glass/back-depth.wgsl";
import { logoWidth, logoHeight } from "./atmosphere-options.ts";
import { gpu, mesh, controls, imprint } from "./atmosphere-runtime.ts";

type NativeDepthReport = {
	readonly yaw: number;
	readonly min: number;
	readonly max: number;
	readonly count: number;
	readonly cpuRange: ReturnType<typeof cameraAxisDepthRange>;
};

function depthStatistics(
	depths: Readonly<Pick<Float32Array, "values">>,
	range: Readonly<ReturnType<typeof cameraAxisDepthRange>>,
) {
	let min = Infinity;
	let max = -Infinity;
	let count = 0;
	for (const value of depths.values()) {
		assert.ok(Number.isFinite(value), "finite native depth");
		if (value < -999999) continue;
		min = Math.min(min, value);
		max = Math.max(max, value);
		count++;
	}
	assert.ok(count > 100 && max - min > 0.001, "genuine nonplanar front depth");
	assert.ok(
		min >= range.min - 0.001 && max <= range.max + 0.001,
		"depth agrees with CPU normalized mesh bounds",
	);
	return { min, max, count };
}

export async function checkNativeDepth() {
	// Independent native extraction of the exact depth shader/projection used
	// by the volume, checked against CPU bounds in normalized mesh space.
	const geometry = createGpuMesh(gpu, mesh);
	const pad = bloomRadiusForDevicePixelRatio(2);
	const depthTarget = target(gpu, {
		size: [logoWidth + pad * 2, logoHeight + pad * 2],
		format: "r32float",
		depth: "depth24plus",
		clearColor: [-1e6, 0, 0, 0],
	});
	const depthPass = draw(gpu, {
		shader: depthShader,
		geometry: geometry.triangles,
		cull: "back",
		depth: { write: true, compare: "less" },
	});
	const depthReports: NativeDepthReport[] = [];
	for (const yaw of [0, 0.12]) {
		const params = writeParams({
			controls: { ...controls, yaw },
			logicalWidth: logoWidth,
			logicalHeight: logoHeight,
			passKind: PASS_OUTSIDE,
			projectionPaddingRadius: pad,
			meshBounds: mesh.bounds,
			orbitTarget: meshOrbitTarget(mesh),
			thicknessScale: meshThicknessScale(mesh.bounds),
			isLight: false,
			imprint,
		});
		depthPass.set({ params });
		depthPass.draw(depthTarget);
		const depths = await depthTarget.readFloats();
		const range = cameraAxisDepthRange(mesh.bounds, params.cameraForward);
		const { min, max, count } = depthStatistics(depths, range);
		depthReports.push({ yaw, min, max, count, cpuRange: range });
	}

	geometry.triangles.destroy();
	geometry.lines.destroy();
	depthTarget.color.destroy();
	depthTarget.depth?.destroy();
	return { nativeDepth: depthReports };
}
