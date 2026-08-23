export const release = {
	version: "2.11.2",
	artifact: "Local-Studio-arm64.dmg",
	zip: "Local-Studio-2.11.2-arm64-mac.zip",
	bytes: 255_134_313,
	label: "255 MB",
	arch: "arm64",
	platform: "macOS (Apple Silicon)",
	published: "2026-08-12",
	url: "https://github.com/sybil-solutions/local-studio/releases/download/v2.11.2/Local-Studio-arm64.dmg",
	releases: "https://github.com/sybil-solutions/local-studio/releases",
	latestAlias:
		"https://github.com/sybil-solutions/local-studio/releases/latest/download/Local-Studio-arm64.dmg",
	sitePath: "/download",
} as const;

export type Release = typeof release;
