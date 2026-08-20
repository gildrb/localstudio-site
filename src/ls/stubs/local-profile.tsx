import {
  DEFAULT_PROFILE,
  profileAvatarColor,
  type LocalProfile,
} from "./local-profile-model";

export function useLocalProfile(): [
	LocalProfile,
	(patch: Partial<LocalProfile>) => void,
] {
	return [DEFAULT_PROFILE, () => undefined];
}

function initials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const first = parts[0]?.[0] ?? "S";
	const second = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
	return `${first}${second}`.toUpperCase();
}

export function ProfileAvatar({
	profile,
	size = 22,
}: {
	profile: LocalProfile;
	size?: number;
}) {
	return (
		<span
			className="flex shrink-0 items-center justify-center rounded-full bg-cover bg-center font-medium text-white"
			style={{
				width: size,
				height: size,
				fontSize: Math.round(size * 0.42),
				backgroundColor: profileAvatarColor(profile.hue),
				...(profile.imageUrl
					? {
							backgroundImage: `url(${JSON.stringify(profile.imageUrl).slice(1, -1)})`,
						}
					: {}),
			}}
			aria-hidden
		>
			{profile.imageUrl ? null : initials(profile.name)}
		</span>
	);
}
