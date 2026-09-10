import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Measured desktop hero1585x1365, padded logo canvas928x610.5.
export const logoRect: readonly [number, number, number, number] = [0.2073, 0.0879, 0.5855, 0.4473];
export const logoWidth = 928;
export const logoHeight = 611;

export function readAtmosphereOptions(repositoryRoot: string) {
	const validate = process.argv.includes("--validate");
	const blank = process.argv.includes("--blank");
	const prism = process.argv.includes("--prism");
	const lightGain = Number(
		process.argv.find((arg) => arg.startsWith("--light-gain="))?.slice(13) ?? (prism ? 0 : 0.72),
	);
	assert.ok(
		Number.isFinite(lightGain) && lightGain >= 0 && lightGain <= 1,
		"light gain must be in [0, 1]",
	);
	assert.ok(
		!(prism && lightGain > 0),
		"validate the additive light separately from rejected Prism ribbons",
	);
	const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
	const output =
		outputArg?.slice(9) ??
		(validate
			? "/tmp/localstudio-atmosphere"
			: fileURLToPath(new URL("public/localai/", repositoryRoot)));
	mkdirSync(output, { recursive: true });
	const width = Number(process.argv.find((arg) => arg.startsWith("--width="))?.slice(8) ?? 640);
	assert.ok(
		Number.isInteger(width) && width >= 64 && width <= 2048,
		"width must be an integer in [64, 2048]",
	);
	const height = Math.round((width * 1365) / 1585);
	return { validate, blank, prism, lightGain, output, width, height };
}
