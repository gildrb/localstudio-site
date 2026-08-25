import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./computer-header.styles.ts";
import { useState, type ComponentType } from "react";
import {
	Activity,
	FolderTree,
	GitBranch,
	Globe2,
	MessageSquarePlus,
	PanelRight,
	PanelRightFilled,
	Plus,
	TerminalSquare,
	type LucideIcon,
} from "../ui/icon-registry";
import { CloseIcon } from "../ui/icons";
export type ComputerTab =
	| "status"
	| "tools"
	| "side-chat"
	| "browser"
	| "files"
	| "diff"
	| "terminal";
type TerminalOwnersSnapshot = { owners: { mountKey?: string }[]; activeOwnerKey: string | null };
function terminalOwnerLabel(owner: { mountKey?: string }, index: number) {
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

const TAB_OPTIONS: Array<{
	tab: ComputerTab;
	label: string;
	description: string;
	icon?: LucideIcon;
}> = [
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

function computerTabMeta(candidate: ComputerTab) {
	return candidate === "status"
		? { label: "Status", icon: Activity }
		: {
				label: TAB_LABELS[candidate],
				icon: TAB_OPTIONS.find((item) => item.tab === candidate)?.icon ?? PanelRight,
			};
}
function TabPill({
	icon: Icon,
	label,
	selected,
	shortcut,
	title,
	onSelect,
	onClose,
}: {
	icon?: LucideIcon;
	label: string;
	selected: boolean;
	shortcut?: string | undefined;
	title: string;
	onSelect: () => void;
	onClose?: (() => void) | undefined;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			{...stylex.props(demoStyles.reset, styles.tab, selected ? styles.selectedTab : styles.idleTab)}
			title={title}
		>
			<button
				type="button"
				onClick={onSelect}
				{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button113)}
			>
				{Icon ? (
					<Icon {...stylex.props(demoStyles.reset, styles.icon116, styles.lucideScale)} />
				) : null}
				<span {...stylex.props(demoStyles.reset, styles.span118)}>
					{label}
				</span>
				{shortcut ? (
					<span {...stylex.props(demoStyles.reset, styles.span122)}>
						{shortcut}
					</span>
				) : null}
			</button>
			{onClose ? (
				<button
					type="button"
					onClick={(event) => {
						event.stopPropagation();
						onClose();
					}}
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.closeButton, (hovered || selected) && styles.closeHovered)}
					aria-label={`Close ${label}`}
					title={`Close ${label}`}
				>
					<CloseIcon {...stylex.props(demoStyles.reset, styles.closeicon140)} />
				</button>
			) : null}
		</div>
	);
}

function HeaderIconButton({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	icon: ComponentType<{ className?: string }>;
	label: string;
	active?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.headerButton, active ? styles.headerButtonActive : styles.headerButtonIdle)}
			title={label}
			aria-label={label}
			aria-pressed={active}
		>
			<Icon {...stylex.props(demoStyles.reset, styles.icon171, styles.lucideScale)} />
		</button>
	);
}

export function ComputerHeader({
	tab,
	openTabs,
	terminalState,
	onSelectTab,
	onOpenCurrentTerminal,
	onSelectTerminalOwner,
	onCloseTerminalOwner,
	onCloseTab,
	onShowLauncher,
	onClosePanel,
}: {
	tab: ComputerTab;
	openTabs: ComputerTab[];
	terminalState: TerminalOwnersSnapshot;
	onSelectTab: (tab: ComputerTab) => void;
	onOpenCurrentTerminal: () => void;
	onSelectTerminalOwner: (ownerKey: string) => void;
	onCloseTerminalOwner: (ownerKey: string) => void;
	onCloseTab: (tab: ComputerTab) => void;
	onShowLauncher: () => void;
	onClosePanel: () => void;
}) {
	const visibleTabs = openTabs.filter(
		(openTab) =>
			openTab !== "tools" &&
			(openTab !== "terminal" || terminalState.owners.length === 0),
	);
	return (
		<div {...stylex.props(demoStyles.reset, styles.div205)}>
			<div {...stylex.props(demoStyles.reset, styles.div206)}>
				{visibleTabs.map((openTab) => {
					const meta = computerTabMeta(openTab);
					return (
						<TabPill
							key={openTab}
							icon={meta.icon}
							label={meta.label}
							title={meta.label}
							selected={tab === openTab}
							onSelect={() =>
								openTab === "terminal"
									? onOpenCurrentTerminal()
									: onSelectTab(openTab)
							}
							onClose={
								openTab === "status" ? undefined : () => onCloseTab(openTab)
							}
						/>
					);
				})}
				{terminalState.owners.map((owner, index) => {
					const label = terminalOwnerLabel(owner, index);
					const selected =
						tab === "terminal" &&
						terminalState.activeOwnerKey === owner.mountKey;
					const shortcut = index < 9 ? `⌘⌥${index + 1}` : undefined;
					return (
						<TabPill
							key={owner.mountKey}
							icon={TerminalSquare}
							label={label}
							title={shortcut ? `${label} (${shortcut})` : label}
							shortcut={shortcut}
							selected={selected}
							onSelect={() => onSelectTerminalOwner(owner.mountKey ?? "")}
							onClose={() => onCloseTerminalOwner(owner.mountKey ?? "")}
						/>
					);
				})}
			</div>
			<div {...stylex.props(demoStyles.reset, styles.div247)}>
				<HeaderIconButton
					icon={Plus}
					label="Show tools"
					active={tab === "tools"}
					onClick={onShowLauncher}
				/>
				<HeaderIconButton
					icon={PanelRightFilled}
					label="Close controller panel"
					onClick={onClosePanel}
				/>
			</div>
		</div>
	);
}

export function ComputerLauncherPanel({
	activeTab,
	onOpenSideChat,
	onOpenTerminal,
	onSelectTab,
}: {
	activeTab: ComputerTab;
	onOpenSideChat: () => void;
	onOpenTerminal: () => void;
	onSelectTab: (tab: ComputerTab) => void;
}) {
	const cards = [
		{
			key: "files",
			title: "Files",
			description: "Browse project files",
			icon: FolderTree,
			onClick: () => onSelectTab("files"),
		},
		{
			key: "side-chat",
			title: "Side chat",
			description: "Start a side conversation",
			icon: MessageSquarePlus,
			onClick: onOpenSideChat,
		},
		{
			key: "browser",
			title: "Browser",
			description: "Open a website",
			icon: Globe2,
			onClick: () => onSelectTab("browser"),
		},
		{
			key: "diff",
			title: "Review",
			description: "Diff, commit, push, and PR",
			icon: GitBranch,
			onClick: () => onSelectTab("diff"),
		},
		{
			key: "terminal",
			title: "Terminal",
			description: "Start an interactive shell",
			icon: TerminalSquare,
			onClick: onOpenTerminal,
		},
	] as const;
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
							onClick={card.onClick}
							{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.launcherCard, selected ? styles.launcherSelected : styles.launcherIdle)}
						>
							<Icon {...stylex.props(demoStyles.reset, styles.icon329, styles.launcherIcon)} />
							<span {...stylex.props(demoStyles.reset, styles.span330)}>
								<span {...stylex.props(demoStyles.reset, styles.span331)}>
									{card.title}
								</span>
								<span {...stylex.props(demoStyles.reset, styles.span334)}>
									{card.description}
								</span>
							</span>
						</button>
					);
				})}
			</div>
		</section>
	);
}
