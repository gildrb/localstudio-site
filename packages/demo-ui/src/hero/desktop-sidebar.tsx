import {
	ChevronLeft,
	ChevronRight,
	Search as SearchIcon,
	SquarePen,
	PanelLeftFilled,
	Settings,
	Smartphone,
} from "../ui/icon-registry";
import { NavItemDesktop } from "../shell/left-sidebar-nav";
import { isRouteActive, tabs } from "../shell/left-sidebar-nav-model";
const DEFAULT_SIDEBAR_WIDTH = 244;
function ProfileAvatar({ profile }: { profile: { name: string } }) {
	return <span className="inline-block h-6 w-6 rounded-full bg-(--hover)" aria-hidden="true" title={profile.name} />;
}
function useLocalProfile(): [{ name: string }] {
	return [{ name: "Sero" }];
}
import { HeroProjectsNav, type HeroTaskId } from "./projects-nav";

const HISTORY_STEPPER_CLASS =
	"flex h-6 w-6 items-center justify-center rounded-md text-(--hl2) transition-colors hover:bg-(--hover) hover:text-(--fg)";

export function HeroDesktopSidebar({
	pathname = "/agent",
	showProjects = true,
	activeTask,
	onSelectTask,
	titles,
}: {
	pathname?: string;
	showProjects?: boolean;
	activeTask?: HeroTaskId;
	onSelectTask?: (task: HeroTaskId) => void;
	titles?: Record<HeroTaskId, string>;
}) {
	return (
		<aside
			className="relative flex sticky top-0 h-full border-r border-(--border) bg-(--sidebar-bg) flex-col shrink-0 z-40 overflow-hidden"
			style={{ width: DEFAULT_SIDEBAR_WIDTH }}
		>
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden opacity-100">
				<div className="sticky top-0 z-50 flex h-[var(--h-toolbar)] shrink-0 items-center gap-1 bg-(--sidebar-bg) px-2">
					<button
						type="button"
						className="flex h-7 w-7 items-center justify-center rounded-lg text-(--hl2) transition-colors hover:bg-(--hover) hover:text-(--fg)"
						title="Collapse sidebar"
						aria-label="Collapse sidebar"
					>
						<PanelLeftFilled className="h-3 w-3" strokeWidth={1.75} />
					</button>
					<button
						type="button"
						className={HISTORY_STEPPER_CLASS}
						title="Go back"
						aria-label="Go back"
					>
						<ChevronLeft className="h-3 w-3" strokeWidth={1.75} />
					</button>
					<button
						type="button"
						className={HISTORY_STEPPER_CLASS}
						title="Go forward"
						aria-label="Go forward"
					>
						<ChevronRight className="h-3 w-3" strokeWidth={1.75} />
					</button>
					<button
						type="button"
						className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-(--hl2) transition-colors hover:bg-(--hover) hover:text-(--fg)"
						title="Search sessions (⌘K)"
						aria-label="Search sessions"
					>
						<SearchIcon className="h-4 w-4" strokeWidth={1.75} />
					</button>
				</div>
				<nav className="sidebar-scroller flex min-h-0 flex-1 flex-col gap-[var(--sidebar-row-gap)] overflow-x-hidden overflow-y-auto px-[var(--sidebar-padding-x)] py-0.5 [contain:layout_paint]">
					<button
						type="button"
						className="flex h-[var(--sidebar-row-height)] shrink-0 items-center gap-2 rounded-[var(--sidebar-row-radius)] px-2 text-(--fg)/85 transition-colors hover:bg-(--hover) hover:text-(--fg)"
						title="New task"
					>
						<SquarePen
							className="h-4 w-4 shrink-0 opacity-70"
							strokeWidth={1.6}
						/>
						<span className="flex-1 truncate text-left text-[length:var(--fs-md)] font-normal">
							New task
						</span>
					</button>
					{tabs.map((tab) => (
						<NavItemDesktop
							key={tab.href}
							href={tab.href}
							label={tab.label}
							Icon={tab.icon}
							active={isRouteActive(pathname, tab.href)}
						/>
					))}
					{showProjects && activeTask && onSelectTask && titles ? (
						<HeroProjectsNav
							expanded
							activeTask={activeTask}
							onSelectTask={onSelectTask}
							titles={titles}
						/>
					) : null}
				</nav>
				<div className="shrink-0 bg-(--sidebar-bg) px-[var(--sidebar-padding-x)] pb-2 pt-1">
					<HeroProfileFooter />
				</div>
			</div>
		</aside>
	);
}

function HeroProfileFooter() {
	const [profile] = useLocalProfile();
	return (
		<div className="flex h-[var(--sidebar-row-height)] items-center gap-1">
			<div className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1 text-left">
				<ProfileAvatar profile={profile} />
				<span className="truncate text-[length:var(--fs-md)] text-(--fg)">
					{profile.name}
				</span>
			</div>
			<span
				className="flex h-7 w-7 shrink-0 items-center justify-center text-(--fg)/40"
				title="Connect phone"
				aria-hidden="true"
			>
				<Smartphone className="h-3.5 w-3.5" strokeWidth={1.75} />
			</span>
			<span
				title="Settings"
				className="flex h-7 w-7 shrink-0 items-center justify-center text-(--fg)/40"
				aria-hidden="true"
			>
				<Settings className="h-3.5 w-3.5" strokeWidth={1.75} />
			</span>
		</div>
	);
}
