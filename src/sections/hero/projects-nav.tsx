import { Folder, FolderOpen } from "@/ui/icons";
import {
	SidebarRail,
	SidebarSectionHeader,
} from "@/features/agent/ui/projects-nav/nav-chrome";

export type HeroTaskId = "proxy" | "composer";

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
						title="/Users/sero/local-studio"
						className="flex min-w-0 flex-1 items-center gap-2 px-0 pr-8 text-left"
					>
						<span className="relative h-3.5 w-3.5 shrink-0 opacity-70">
							<Folder className="absolute inset-0 h-3.5 w-3.5 opacity-0" />
							<FolderOpen className="absolute inset-0 h-3.5 w-3.5 opacity-100" />
						</span>
						<span className="truncate text-[length:var(--fs-md)] font-normal">
							local-studio
						</span>
					</button>
				</div>
			</div>
			<SidebarSectionHeader label="Tasks" open onToggle={() => undefined} />
			<SidebarRail>
				<button
					type="button"
					className={activeTask === "proxy" ? focusedRow : idleRow}
					onClick={() => onSelectTask("proxy")}
				>
					<span className="min-w-0 flex-1 truncate px-0 text-left text-[length:var(--fs-md)]">
						{titles.proxy}
					</span>
					<span className="pr-2 text-[length:var(--fs-xs)] text-(--hl2)">
						now
					</span>
				</button>
				<button
					type="button"
					className={activeTask === "composer" ? focusedRow : idleRow}
					onClick={() => onSelectTask("composer")}
				>
					<span className="min-w-0 flex-1 truncate px-0 text-left text-[length:var(--fs-md)]">
						{titles.composer}
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
