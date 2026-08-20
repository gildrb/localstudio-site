export type LocalProfile = {
	name: string;
	hue: number;
	imageUrl?: string;
};

export const DEFAULT_PROFILE: LocalProfile = { name: "Studio", hue: 214 };
export const PROFILE_HUES = [214, 262, 152, 24, 340, 46] as const;
