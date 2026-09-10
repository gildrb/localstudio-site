// Native fallback generation and deterministic depth/interaction checks.
// Static posters include the live additive light at its first-frame gain.
// Run the root atmosphere snapshot command with [--validate] [--blank] [--prism].
import { writeFileSync } from "node:fs";
import { logoRect } from "./atmosphere-options.ts";
import { renderScheme } from "./atmosphere-scene.ts";
import { checkNativeDepth } from "./atmosphere-depth.ts";
import { gpu, options } from "./atmosphere-runtime.ts";

const { width, height, output, validate } = options;
type AtmosphereReport =
	| Awaited<ReturnType<typeof renderScheme>>
	| Awaited<ReturnType<typeof checkNativeDepth>>;
const report: AtmosphereReport[] = [];
try {
	if (validate) report.push(await checkNativeDepth());
	for (const scheme of ["night", "day"]) {
		const result = await renderScheme(scheme);
		if (result !== null) report.push(result);
	}
	console.log(JSON.stringify({ width, height, logoRect, output, report }, null, 2));
	if (validate) writeFileSync(`${output}/validation.json`, JSON.stringify(report, null, 2));
} finally {
	gpu.dispose();
}
