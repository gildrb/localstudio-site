export type LocalProfile = {
	name: string;
	hue: number;
	imageUrl?: string;
};

export const DEFAULT_PROFILE: LocalProfile = { name: "Studio", hue: 214 };

export function profileAvatarColor(hue: number): string {
	return `oklch(0.55 0.13 ${hue})`;
}
