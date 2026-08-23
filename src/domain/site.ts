export const site = {
	origin: "https://localstudio.ai",
	company: {
		name: "Sybil Solutions",
		url: "https://www.sybilsolutions.ai/",
	},
	products: {
		localStudio: {
			name: "Local Studio",
			repository: "https://github.com/sybil-solutions/local-studio",
		},
		kittyLitter: {
			name: "KittyLitter",
			url: "https://kittylitter.app",
			appStore: "https://apps.apple.com/us/app/kittylitter/id6759521788",
			playStore: "https://play.google.com/store/apps/details?id=com.sigkitten.litter.android",
		},
		localAi: {
			name: "Local AI",
			url: "https://local.ai",
		},
	},
} as const;

export type Site = typeof site;
