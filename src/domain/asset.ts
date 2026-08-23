export const assets = {
	wordmark: "/images/localstudio-logo.svg",
	mark: "/images/optimized.svg",
	workbenchBrowser: "/images/workbench-browser.png",
	workbenchBrowserHero: "/images/workbench-browser-1300.png",
	workbenchTerminal: "/images/workbench-terminal.png",
	usageProxy: "/images/usage-proxy.png",
	configureModels: "/images/configure-models.png",
	kittySessions: "/images/kittylitter-feature-sessions-660.webp",
	kittySessions2x: "/images/kittylitter-feature-sessions-1320.webp",
	kittyMultiAgent: "/images/kittylitter-feature-multi-agent-660.webp",
	kittyMultiAgent2x: "/images/kittylitter-feature-multi-agent-1320.webp",
	kittyAlleycat: "/images/kittylitter-feature-alleycat-660.webp",
	kittyAlleycat2x: "/images/kittylitter-feature-alleycat-1320.webp",
	sponsorNvidia: "/images/sponsors/nvidia.svg",
	sponsorFactory: "/images/sponsors/factory.svg",
	sponsorLambda: "/images/sponsors/lambda.svg",
	sponsorPrime: "/images/sponsors/prime-intellect.svg",
	sponsorTng: "/images/sponsors/tng.svg",
} as const;

export type AssetId = keyof typeof assets;

export function assetSrc(id: AssetId): string {
	return assets[id];
}

export function responsiveSrcSet(path: string) {
	const base = path.replace(/\.png$/, "");
	return `${base}-800.png 800w, ${base}-1300.png 1300w, ${base}-2600.png 2600w`;
}

export const heroSizes = "min(1399px, calc(100vw - 48px))";
export const storySizes = "(min-width: 900px) 835px, calc(100vw - 48px)";
export const frameSizes = "(min-width: 900px) 790px, calc(100vw - 48px)";
