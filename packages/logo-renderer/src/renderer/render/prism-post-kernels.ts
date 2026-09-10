export const BLOOM_TAPS = [6, 10, 14, 18] as const;
export const BLOOM_DIVISORS = [2, 4, 8, 16] as const;
export const DUST_PARTICLES = 2200;
export const BLOOM_THRESHOLD = 0.1;
export const BLOOM_STRENGTH = 0.7;
// Reference radius .25 is the minimum of [.25, 3], hence normalized spread 0.
export const BLOOM_SPREAD = 0;
export const BLOOM_FACTORS = [1, 0.8, 0.55, 0];

// Energy-normalized Gaussian half-kernels and bilinear pairs from upstream
// bloom/config.ts, pairing.ts and uniforms.ts. Downsampling horizontal passes
// at levels 1/2 deliberately retain raw taps, exactly as the reference does.
export const KERNELS = BLOOM_TAPS.map((count) => {
	const sigma = count / 3;
	const weights = Array.from({ length: 24 }, (_, i) =>
		i < count ? Math.exp((-0.5 * i * i) / (sigma * sigma)) : 0,
	);
	const sum = weights[0]! + 2 * weights.slice(1, count).reduce((a, b) => a + b, 0);
	const normalized = weights.map((weight) => weight / sum);
	const pairedWeights = Array.from({ length: 12 }, () => 0);
	const offsets = Array.from({ length: 12 }, () => 0);
	const pairCount = Math.ceil((count - 1) / 2);
	for (let pair = 0; pair < pairCount; pair++) {
		const first = 1 + pair * 2;
		const second = first + 1;
		const a = normalized[first] ?? 0;
		const b = second < count ? (normalized[second] ?? 0) : 0;
		pairedWeights[pair] = a + b;
		offsets[pair] = a + b > 0 ? (first * a + second * b) / (a + b) : first;
	}
	return { normalized, pairedWeights, offsets, pairCount };
});
