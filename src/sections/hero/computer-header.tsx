import { type ComponentType } from "react";
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
} from "@/ui/icon-registry";
import { CloseIcon } from "@/ui/icons";
import type { ComputerTab } from "@/features/agent/tools/types";
import type { TerminalOwnersSnapshot } from "@/features/agent/ui/use-persistent-terminal-owners";
import { terminalOwnerLabel } from "@/features/agent/terminal-owners";

const TAB_LABELS: Record<ComputerTab, string> = {
	status: "Status",
	tools: "Tools",
	"side-chat": "Side chat",
	browser: "Browser",
	files: "Filesystem",
	diff: "Review",
	terminal: "Terminal",
};

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
	shortcut?: string;
	title: string;
	onSelect: () => void;
	onClose?: () => void;
}) {
	return (
		<div
			className={`group inline-flex h-7 min-w-0 shrink-0 items-center rounded-md transition-[background-color,color] duration-150 ${
				selected
					? "bg-(--color-surface-hover) text-(--fg)"
					: "text-(--dim) hover:text-(--fg)"
			}`}
			title={title}
		>
			<button
				type="button"
				onClick={onSelect}
				className="inline-flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-md px-2.5 text-left"
			>
				{Icon ? (
					<Icon className="pointer-events-none h-3.5 w-3.5 shrink-0" />
				) : null}
				<span className="max-w-[8rem] truncate text-[length:var(--fs-sm)]">
					{label}
				</span>
				{shortcut ? (
					<span className="text-[length:var(--fs-2xs)] text-(--dim)/70">
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
					className={`-ml-1 mr-1 inline-flex h-5 w-5 items-center justify-center rounded text-(--dim)/65 opacity-0 transition-[color,opacity] duration-150 hover:text-(--fg) group-hover:opacity-100 focus-visible:opacity-100 ${
						selected ? "opacity-100" : ""
					}`}
					aria-label={`Close ${label}`}
					title={`Close ${label}`}
				>
					<CloseIcon className="pointer-events-none h-2 w-2" />
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
			className={`relative z-10 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-[background-color,color] duration-150 ${
				active
					? "bg-(--color-surface-hover) text-(--fg)"
					: "text-(--dim) hover:text-(--fg)"
			}`}
			title={label}
			aria-label={label}
			aria-pressed={active}
		>
			<Icon className="pointer-events-none h-3.5 w-3.5" />
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
	const tabMeta = (candidate: ComputerTab) =>
		candidate === "status"
			? { label: "Status", icon: Activity }
			: {
					label: TAB_LABELS[candidate],
					icon:
						TAB_OPTIONS.find((item) => item.tab === candidate)?.icon ??
						PanelRight,
				};
	return (
		<div className="relative flex h-[var(--h-toolbar-pane)] shrink-0 items-center gap-1 border-b border-(--border) bg-(--color-header) px-1.5 text-[length:var(--fs-sm)]">
			<div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overflow-y-hidden px-0.5 [scrollbar-width:thin]">
				{visibleTabs.map((openTab) => {
					const meta = tabMeta(openTab);
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
							onSelect={() => onSelectTerminalOwner(owner.mountKey)}
							onClose={() => onCloseTerminalOwner(owner.mountKey)}
						/>
					);
				})}
			</div>
			<div className="ml-auto flex shrink-0 items-center gap-1">
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
		<section className="min-h-0 flex-1 overflow-y-auto bg-(--color-panel) px-3 py-3">
			<div className="flex flex-col gap-1">
				{cards.map((card) => {
					const Icon = card.icon;
					const selected = card.key !== "side-chat" && activeTab === card.key;
					return (
						<button
							key={card.key}
							type="button"
							onClick={card.onClick}
							className={`group flex min-h-0 items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
								selected
									? "bg-(--color-surface-hover) text-(--fg)"
									: "text-(--fg)/75 hover:bg-(--hover) hover:text-(--fg)"
							}`}
						>
							<Icon className="h-4 w-4 shrink-0 text-(--dim)/75 transition-colors group-hover:text-(--fg)/80" />
							<span className="min-w-0 flex-1">
								<span className="block truncate text-[length:var(--fs-lg)] font-medium">
									{card.title}
								</span>
								<span className="block truncate text-[length:var(--fs-sm)] text-(--dim)">
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
