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
		},
		localAi: {
			name: "Local AI",
			url: "https://local.ai",
		},
	},
} as const;

export type Site = typeof site;
