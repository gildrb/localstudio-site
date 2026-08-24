import { PanelRightFilled, PanelRightHollow } from "../ui/icon-registry";

export function AgentChatPaneHeader({
	title,
	rightPanelOpen,
	onToggleRightPanel,
}: {
	title: string;
	rightPanelOpen: boolean;
	onToggleRightPanel: () => void;
}) {
	const RightPanelIcon = rightPanelOpen ? PanelRightFilled : PanelRightHollow;
	return (
		<div className="grid h-[var(--h-toolbar-pane)] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-(--border) bg-(--color-header) py-0 pl-3 pr-2 text-xs md:pl-4">
			<div
				className="min-w-0 truncate whitespace-nowrap text-[length:var(--fs-md)] font-medium leading-none text-(--fg) md:text-[length:var(--fs-base)]"
				title={title}
			>
				{title}
			</div>
			<button
				type="button"
				onClick={onToggleRightPanel}
				aria-pressed={rightPanelOpen}
				className={`relative z-10 -my-1 inline-flex h-8 w-8 items-center justify-center rounded-md ${
					rightPanelOpen
						? "text-(--fg) hover:bg-(--hover)"
						: "text-(--dim) hover:bg-(--hover) hover:text-(--fg)"
				}`}
				title={rightPanelOpen ? "Hide right sidebar" : "Show right sidebar"}
				aria-label={rightPanelOpen ? "Hide right sidebar" : "Show right sidebar"}
			>
				<RightPanelIcon className="pointer-events-none h-3.5 w-3.5" />
			</button>
		</div>
	);
}
