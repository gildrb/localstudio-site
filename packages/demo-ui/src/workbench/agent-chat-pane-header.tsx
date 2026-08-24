import { useState } from "react";
import { Menu, PanelRightFilled, PanelRightHollow } from "../ui/icon-registry";

export function AgentChatPaneHeader({
	title,
	rightPanelOpen,
	onRename,
	onToggleRightPanel,
}: {
	title: string;
	rightPanelOpen: boolean;
	onRename: (title: string) => void;
	onToggleRightPanel: () => void;
}) {
	const [renaming, setRenaming] = useState(false);
	const [draftTitle, setDraftTitle] = useState(title);
	const RightPanelIcon = rightPanelOpen ? PanelRightFilled : PanelRightHollow;
	const finishRename = () => {
		const trimmed = draftTitle.trim();
		if (trimmed) onRename(trimmed);
		setRenaming(false);
	};
	return (
		<div className="grid h-[var(--h-toolbar-pane)] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-(--border) bg-(--color-header) py-0 pl-3 pr-2 text-xs md:pl-4">
			<div className="flex min-w-0 items-center gap-1">
				<button
					type="button"
					className="-ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-(--dim) hover:bg-(--hover) hover:text-(--fg) md:hidden"
					aria-label="Open navigation menu"
				>
					<Menu className="pointer-events-none h-[18px] w-[18px]" />
				</button>
				{renaming ? (
					<input
						autoFocus
						value={draftTitle}
						onFocus={(event) => event.currentTarget.select()}
						onChange={(event) => setDraftTitle(event.target.value)}
						onBlur={finishRename}
						onKeyDown={(event) => {
							if (event.key === "Enter") finishRename();
							if (event.key === "Escape") {
								setDraftTitle(title);
								setRenaming(false);
							}
						}}
						className="h-7 min-w-0 flex-1 rounded-sm bg-(--surface) px-1.5 py-0.5 text-[length:var(--fs-md)] font-medium text-(--fg) outline-none"
						aria-label="Rename session"
					/>
				) : (
					<button
						type="button"
						onClick={() => {
							setDraftTitle(title);
							setRenaming(true);
						}}
						className="block min-w-0 truncate whitespace-nowrap rounded-sm text-left text-[length:var(--fs-md)] font-medium leading-none text-(--fg) hover:bg-(--hover) md:text-[length:var(--fs-base)]"
						title={title}
						aria-label={`Rename session: ${title}`}
					>
						{title}
					</button>
				)}
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
				aria-label={
					rightPanelOpen ? "Hide right sidebar" : "Show right sidebar"
				}
			>
				<RightPanelIcon className="pointer-events-none h-3.5 w-3.5" />
			</button>
		</div>
	);
}
