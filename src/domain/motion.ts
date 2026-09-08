const ease = [0.16, 1, 0.3, 1] as const;

export const motion = {
	ease,
	heroEnter: { duration: 0.21, ease },
	featureEntry: { duration: 0.3, ease },
	featureSwap: { duration: 0.5, ease },
} as const;
