import type { ComponentProps, ExoticComponent } from "react";
import {
	Activity,
	FolderTree,
	GitBranch,
	Globe2,
	MessageSquarePlus,
	PanelRight,
	TerminalSquare,
	type LucideIcon,
} from "../ui/icon-registry";
export type HeroLucideIcon = ExoticComponent<ComponentProps<LucideIcon>>;

export type ComputerTab =
	| "status"
	| "tools"
	| "side-chat"
	| "browser"
	| "files"
	| "diff"
	| "terminal";
export type TerminalOwner = { readonly mountKey?: string };
export type TerminalOwnersSnapshot = {
	readonly owners: readonly TerminalOwner[];
	readonly activeOwnerKey: string | null;
};
export function terminalOwnerLabel(owner: TerminalOwner, index: number) {
	return owner.mountKey ?? `Terminal ${index + 1}`;
}

const TAB_LABELS = {
	status: "Status",
	tools: "Tools",
	"side-chat": "Side chat",
	browser: "Browser",
	files: "Filesystem",
	diff: "Review",
	terminal: "Terminal",
} as const satisfies Record<ComputerTab, string>;

export const TAB_OPTIONS: ReadonlyArray<
	Readonly<{
		readonly tab: ComputerTab;
		readonly label: string;
		description: string;
		readonly icon?: HeroLucideIcon;
	}>
> = [
	{
		tab: "side-chat",
		label: "Side chat",
		description: "Focused side conversation",
		icon: MessageSquarePlus,
	},
	{
		tab: "browser",
		label: "Browser",
		description: "Web, localhost, and file previews",
		icon: Globe2,
	},
	{
		tab: "diff",
		label: "Review",
		description: "Diff, commit, push, and PR",
		icon: GitBranch,
	},
	{
		tab: "files",
		label: "Filesystem",
		description: "Project files and rendered previews",
		icon: FolderTree,
	},
	{
		tab: "terminal",
		label: "Terminal",
		description: "Project shell",
		icon: TerminalSquare,
	},
];

export function computerTabMeta(candidate: ComputerTab): {
	readonly label: string;
	readonly icon: HeroLucideIcon;
} {
	return candidate === "status"
		? { label: "Status", icon: Activity }
		: {
				label: TAB_LABELS[candidate],
				icon: TAB_OPTIONS.find((item) => item.tab === candidate)?.icon ?? PanelRight,
			};
}
