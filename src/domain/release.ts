import { site } from "./site.ts";

const version = "2.11.2";
const artifact = "Local-Studio-arm64.dmg";
const tag = `v${version}`;

export const release = {
	version,
	artifact,
	zip: "Local-Studio-2.11.2-arm64-mac.zip",
	bytes: 255_134_313,
	label: "255 MB",
	arch: "arm64",
	platform: "macOS (Apple Silicon)",
	published: "2026-08-12",
	url: `${site.products.localStudio.repository}/releases/download/${tag}/${artifact}`,
	releases: `${site.products.localStudio.repository}/releases`,
	latestAlias: `${site.products.localStudio.repository}/releases/latest/download/${artifact}`,
	sitePath: "/download",
} as const;

export type Release = typeof release;
