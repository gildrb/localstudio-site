export const site = {
	origin: "https://localstudio.ai",
	lastmod: "2026-08-25",
	copyrightYear: 2026,
	source: "https://github.com/gildrb/web-localstudio",
	company: {
		name: "Sybil Solutions",
		url: "https://www.sybilsolutions.ai/",
		alias: "https://sybilsolutions.ai",
		github: "https://github.com/sybil-solutions",
		contact: "sherif@sybilsolutions.ai",
		x: "https://x.com/0xsero",
	},
	products: {
		localStudio: {
			name: "Local Studio",
			repository: "https://github.com/sybil-solutions/local-studio",
		},
		kittyLitter: {
			name: "KittyLitter",
			minimumLocalStudio: "2.9.0",
			minimumVersion: "1.6.0",
			url: "https://kittylitter.app",
			appStore: "https://apps.apple.com/us/app/kittylitter/id6759521788",
			playStore: "https://play.google.com/store/apps/details?id=com.sigkitten.litter.android",
			source: "https://github.com/dnakov/litter",
		},
		localAi: {
			name: "Local AI",
			url: "https://local.ai",
		},
		codexShim: {
			name: "Codex Shim",
			repository: "https://github.com/sybil-solutions/codex-shim",
		},
	},
} as const;

export type Site = typeof site;
