export const assets = {
	wordmark: "/images/localstudio-logo.svg",
	mark: "/images/optimized.svg",
	favicon: "/images/favicon.svg",
	faviconDark: "/images/favicon-dark.svg",
	localaiDark: "/images/localai_dark.svg",
	workbenchBrowser: "/images/workbench-browser.png",
	workbenchBrowser800: "/images/workbench-browser-800.png",
	workbenchBrowserHero: "/images/workbench-browser-1300.png",
	workbenchBrowser2600: "/images/workbench-browser-2600.png",
	workbenchTerminal: "/images/workbench-terminal.png",
	workbenchTerminal800: "/images/workbench-terminal-800.png",
	workbenchTerminal1300: "/images/workbench-terminal-1300.png",
	workbenchTerminal2600: "/images/workbench-terminal-2600.png",
	usageProxy: "/images/usage-proxy.png",
	usageProxy800: "/images/usage-proxy-800.png",
	usageProxy1300: "/images/usage-proxy-1300.png",
	usageProxy2600: "/images/usage-proxy-2600.png",
	configureModels: "/images/configure-models.png",
	configureModels800: "/images/configure-models-800.png",
	configureModels1300: "/images/configure-models-1300.png",
	configureModels2600: "/images/configure-models-2600.png",
	kittyIphone01: "/images/kittylitter-appstore-iphone-01-660.avif",
	kittyIphone01_2x: "/images/kittylitter-appstore-iphone-01.avif",
	kittyIphone02: "/images/kittylitter-appstore-iphone-02-660.avif",
	kittyIphone02_2x: "/images/kittylitter-appstore-iphone-02.avif",
	kittyIphone03: "/images/kittylitter-appstore-iphone-03-660.avif",
	kittyIphone03_2x: "/images/kittylitter-appstore-iphone-03.avif",
	kittyIphone04: "/images/kittylitter-appstore-iphone-04-660.avif",
	kittyIphone04_2x: "/images/kittylitter-appstore-iphone-04.avif",
	kittyIphone05: "/images/kittylitter-appstore-iphone-05-660.avif",
	kittyIphone05_2x: "/images/kittylitter-appstore-iphone-05.avif",
	kittyIphone06: "/images/kittylitter-appstore-iphone-06-660.avif",
	kittyIphone06_2x: "/images/kittylitter-appstore-iphone-06.avif",
	kittyIphone07: "/images/kittylitter-appstore-iphone-07-660.avif",
	kittyIphone07_2x: "/images/kittylitter-appstore-iphone-07.avif",
	kittyIphone08: "/images/kittylitter-appstore-iphone-08-660.avif",
	kittyIphone08_2x: "/images/kittylitter-appstore-iphone-08.avif",
	kittyIphone09: "/images/kittylitter-appstore-iphone-09-660.avif",
	kittyIphone09_2x: "/images/kittylitter-appstore-iphone-09.avif",
	kittyIphone10: "/images/kittylitter-appstore-iphone-10-660.avif",
	kittyIphone10_2x: "/images/kittylitter-appstore-iphone-10.avif",
	sponsorNvidia: "/images/sponsors/nvidia.svg",
	sponsorFactory: "/images/sponsors/factory.svg",
	sponsorLambda: "/images/sponsors/lambda.svg",
	sponsorPrime: "/images/sponsors/prime-intellect.svg",
	sponsorTng: "/images/sponsors/tng.svg",
	fontSans: "/fonts/geist-sans.woff2",
	fontMono: "/fonts/geist-mono.woff2",
	logoMesh: "/localai/localai-logo.gltf",
	logoMeshBin: "/localai/localai-logo.bin",
} as const;

const registered = new Set<string>(Object.values(assets));

export function responsiveSrcSet(path: string) {
	const base = path.replace(/\.png$/, "");
	const variants = [`${base}-800.png`, `${base}-1300.png`, `${base}-2600.png`];
	for (const variant of variants) {
		if (!registered.has(variant)) {
			throw new Error(`unregistered srcset variant: ${variant}`);
		}
	}
	return `${variants[0]} 800w, ${variants[1]} 1300w, ${variants[2]} 2600w`;
}

export const heroSizes = "min(1399px, calc(100vw - 48px))";
export const frameSizes = "(min-width: 900px) 790px, calc(100vw - 48px)";
