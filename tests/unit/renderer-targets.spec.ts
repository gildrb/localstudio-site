import { expect, test } from "vite-plus/test";
import { cubeParamsData } from "../../packages/logo-renderer/src/renderer/render/cubemap";
import { init } from "vgpu/mock";
import { createBloomTargetCache } from "../../packages/logo-renderer/src/renderer/render/targets";

test("rear camera depth uses one full-precision channel", async () => {
	const gpu = await init();
	const cache = createBloomTargetCache(gpu);
	const targets = cache.ensure(640, 360, 8, true);

	expect(targets.backMaterial?.color.format).toBe("rgba16float");
	expect(targets.backDepth?.color.format).toBe("r32float");
	expect(targets.backDepth?.depth?.format).toBe("depth32float");
	expect(targets.scene.sampleCount).toBe(4);
	expect(targets.backDepth?.color.view).toBe(targets.backDepth?.color.view);

	cache.dispose();
	gpu.dispose();
});

test("day studio palette uses the reserved uniform without changing the night rig", () => {
	const night = cubeParamsData(2, [], 1);
	const day = cubeParamsData(2, [], 1, true);
	expect(night[2]).toBe(0);
	expect(day[2]).toBe(1);
	day[2] = 0;
	expect(day).toEqual(night);
});
