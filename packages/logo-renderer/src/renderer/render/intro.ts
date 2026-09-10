/** One-shot stationary-emitter choreography, inspired by vgpu Agent Radiance Cascades. */
export const ATMOSPHERE_INTRO_DURATION = 2.1;

export function atmosphereIntroState(time?: number) {
	if (time === undefined || !Number.isFinite(time) || time >= ATMOSPHERE_INTRO_DURATION) {
		return { strengths: [1, 1, 1] as const, pulses: [0, 0, 0] as const, settle: 1, active: false };
	}
	const smooth = (start: number, end: number) => {
		const x = Math.max(0, Math.min(1, (time - start) / (end - start)));
		return Math.max(0, Math.min(1, x * x * x * (x * (x * 6 - 15) + 10)));
	};
	const strengths = [smooth(0, 0.3), smooth(0.3, 0.6), smooth(0.6, 0.9)] as const;
	return {
		pulses: strengths,
		strengths,
		settle: smooth(1.4, ATMOSPHERE_INTRO_DURATION),
		active: true,
	};
}
