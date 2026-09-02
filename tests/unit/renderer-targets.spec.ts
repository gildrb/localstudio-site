import { expect, test } from "bun:test";
import { init } from "../../packages/logo-renderer/node_modules/vgpu/dist/mock.js";
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
