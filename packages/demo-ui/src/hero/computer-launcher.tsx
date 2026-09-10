import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./computer-header.styles.ts";
import {
	FolderTree,
	GitBranch,
	Globe2,
	MessageSquarePlus,
	TerminalSquare,
} from "../ui/icon-registry";
import type { ComputerTab, HeroLucideIcon } from "./computer-tabs";
type LauncherProps = {
	readonly activeTab: ComputerTab;
	readonly onOpenSideChat: () => void;
	readonly onOpenTerminal: () => void;
	readonly onSelectTab: (tab: ComputerTab) => void;
};
export function ComputerLauncherPanel({
	activeTab,
	onOpenSideChat,
	onOpenTerminal,
	onSelectTab,
}: LauncherProps) {
	return (
		<section {...stylex.props(demoStyles.reset, styles.section313)}>
			<div {...stylex.props(demoStyles.reset, styles.div314)}>
				{cards.map((card) => {
					const Icon = card.icon;
					const selected = card.key !== "side-chat" && activeTab === card.key;
					return (
						<button
							key={card.key}
							type="button"
							onClick={
								card.key === "side-chat"
									? onOpenSideChat
									: card.key === "terminal"
										? onOpenTerminal
										: () => {
												onSelectTab(card.key);
											}
							}
							{...stylex.props(
								demoStyles.reset,
								demoStyles.controlReset,
								styles.launcherCard,
								selected ? styles.launcherSelected : styles.launcherIdle,
							)}
						>
							<Icon {...stylex.props(demoStyles.reset, styles.icon329, styles.launcherIcon)} />
							<span {...stylex.props(demoStyles.reset, styles.span330)}>
								<span {...stylex.props(demoStyles.reset, styles.span331)}>{card.title}</span>
								<span {...stylex.props(demoStyles.reset, styles.span334)}>{card.description}</span>
							</span>
						</button>
					);
				})}
			</div>
		</section>
	);
}

type LauncherCard = {
	readonly key: Exclude<ComputerTab, "status" | "tools">;
	readonly title: string;
	readonly description: string;
	readonly icon: HeroLucideIcon;
};
const cards: readonly LauncherCard[] = [
	{ key: "files", title: "Files", description: "Browse project files", icon: FolderTree },
	{
		key: "side-chat",
		title: "Side chat",
		description: "Start a side conversation",
		icon: MessageSquarePlus,
	},
	{ key: "browser", title: "Browser", description: "Open a website", icon: Globe2 },
	{ key: "diff", title: "Review", description: "Diff, commit, push, and PR", icon: GitBranch },
	{
		key: "terminal",
		title: "Terminal",
		description: "Start an interactive shell",
		icon: TerminalSquare,
	},
];
