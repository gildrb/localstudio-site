import { downloadPath } from "./route.ts";
import { site } from "./site.ts";

const version = "2.11.2";
const arch = "arm64";
const artifact = `Local-Studio-${arch}.dmg`;
const zip = `Local-Studio-${version}-${arch}-mac.zip`;
const tag = `v${version}`;

export const release = {
	version,
	artifact,
	zip,
	bytes: 255_134_313,
	label: "255 MB",
	arch,
	platform: "macOS (Apple Silicon)",
	published: "2026-08-12",
	url: `${site.products.localStudio.repository}/releases/download/${tag}/${artifact}`,
	releases: `${site.products.localStudio.repository}/releases`,
	latestAlias: `${site.products.localStudio.repository}/releases/latest/download/${artifact}`,
	sitePath: downloadPath,
} as const;
