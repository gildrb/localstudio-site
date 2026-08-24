import { Folder, FolderOpen } from "..";
function SidebarRail({ children }: { children: import("react").ReactNode }) {
	return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}
function SidebarSectionHeader({
	label,
}: {
	label: string;
	open?: boolean;
	onToggle?: () => void;
	children?: import("react").ReactNode;
}) {
	return <div className="px-2 py-1 text-[length:var(--fs-xs)] text-(--dim)">{label}</div>;
}

export type HeroTaskId = "weekend" | "inbox";

const focusedRow =
	"group relative flex h-[var(--sidebar-row-height)] items-center rounded-[var(--sidebar-row-radius)] pl-2 pr-0 bg-(--active) text-(--fg) transition-[color,background-color,opacity]";

const idleRow =
	"group relative flex h-[var(--sidebar-row-height)] items-center rounded-[var(--sidebar-row-radius)] pl-2 pr-0 text-(--fg)/85 transition-[color,background-color,opacity] hover:bg-(--hover) hover:text-(--fg)";

export function HeroProjectsNav({
	expanded,
	activeTask,
	onSelectTask,
	titles,
}: {
	expanded: boolean;
	activeTask: HeroTaskId;
	onSelectTask: (task: HeroTaskId) => void;
	titles: Record<HeroTaskId, string>;
}) {
	if (!expanded) return null;
	return (
		<>
			<SidebarSectionHeader label="Projects" open onToggle={() => undefined} />
			<div className="flex flex-col">
				<div className="group relative flex h-[var(--sidebar-row-height)] items-center rounded-[var(--sidebar-row-radius)] pl-2 pr-1.5 text-(--fg) transition-[color,background-color,opacity] hover:bg-(--hover)">
					<button
						type="button"
						title="/Users/local/Home"
						className="flex min-w-0 flex-1 items-center gap-2 px-0 pr-8 text-left"
					>
						<span className="relative h-3.5 w-3.5 shrink-0 opacity-70">
							<Folder className="absolute inset-0 h-3.5 w-3.5 opacity-0" />
							<FolderOpen className="absolute inset-0 h-3.5 w-3.5 opacity-100" />
						</span>
						<span className="truncate text-[length:var(--fs-md)] font-normal">
							Home
						</span>
					</button>
				</div>
			</div>
			<SidebarSectionHeader label="Tasks" open onToggle={() => undefined} />
			<SidebarRail>
				<button
					type="button"
					className={activeTask === "weekend" ? focusedRow : idleRow}
					onClick={() => onSelectTask("weekend")}
				>
					<span className="min-w-0 flex-1 truncate px-0 text-left text-[length:var(--fs-md)]">
						{titles.weekend}
					</span>
					<span className="pr-2 text-[length:var(--fs-xs)] text-(--hl2)">
						now
					</span>
				</button>
				<button
					type="button"
					className={activeTask === "inbox" ? focusedRow : idleRow}
					onClick={() => onSelectTask("inbox")}
				>
					<span className="min-w-0 flex-1 truncate px-0 text-left text-[length:var(--fs-md)]">
						{titles.inbox}
					</span>
					<span className="pr-2 text-[length:var(--fs-xs)] text-(--hl2)">
						3h
					</span>
				</button>
			</SidebarRail>
			<SidebarSectionHeader label="Terminals" open onToggle={() => undefined} />
		</>
	);
}
