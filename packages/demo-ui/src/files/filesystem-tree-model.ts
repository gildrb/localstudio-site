const TONE_GROUPS: [string, string[]][] = [
	[
		"text-(--link)",
		[
			"ts",
			"tsx",
			"js",
			"jsx",
			"mjs",
			"cjs",
			"py",
			"rs",
			"go",
			"rb",
			"java",
			"c",
			"cpp",
			"h",
			"swift",
			"kt",
		],
	],
	[
		"text-(--warn)",
		["css", "scss", "sass", "less", "sh", "bash", "zsh", "fish"],
	],
	["text-(--ok)", ["json", "yaml", "yml", "toml", "ini", "env", "lock"]],
	["text-(--fg) opacity-60", ["md", "mdx", "txt", "rst"]],
	[
		"text-(--err) opacity-70",
		["png", "jpg", "jpeg", "gif", "webp", "svg", "mp4", "mov"],
	],
];

const FILE_TONE_BY_EXT: Record<string, string> = Object.fromEntries(
	TONE_GROUPS.flatMap(([tone, extensions]) =>
		extensions.map((extension) => [extension, tone] as const),
	),
);

export function fileTone(name: string): string {
	const dot = name.lastIndexOf(".");
	const extension = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
	return FILE_TONE_BY_EXT[extension] ?? "text-(--dim)";
}
