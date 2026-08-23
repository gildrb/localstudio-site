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
