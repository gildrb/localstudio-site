import Link from "..";
import {
	ChevronLeft,
	ChevronRight,
	Search as SearchIcon,
	SquarePen,
	PanelLeftFilled,
	Settings,
	Smartphone,
} from "..";
import { NavItemDesktop } from "..";
import { isRouteActive, tabs } from "..";
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
					<Link
						href="/agent?new=1&replace=1"
						prefetch={false}
						onClick={(event) => event.preventDefault()}
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
					</Link>
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
			<Link
				href="/settings#profile"
				prefetch={false}
				className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--sidebar-row-radius)] px-2 py-1 text-left transition-colors hover:bg-(--hover)"
			>
				<ProfileAvatar profile={profile} />
				<span className="truncate text-[length:var(--fs-md)] text-(--fg)">
					{profile.name}
				</span>
			</Link>
			<Link
				href="/settings#profile"
				prefetch={false}
				className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--sidebar-row-radius)] text-(--fg)/60 transition-colors hover:bg-(--hover) hover:text-(--fg)"
				title="Connect phone"
				aria-label="Connect phone in settings"
			>
				<Smartphone className="h-3.5 w-3.5" strokeWidth={1.75} />
			</Link>
			<Link
				href="/settings"
				prefetch={false}
				title="Settings"
				aria-label="Settings"
				className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--sidebar-row-radius)] text-(--fg)/60 transition-colors hover:bg-(--hover) hover:text-(--fg)"
			>
				<Settings className="h-3.5 w-3.5" strokeWidth={1.75} />
			</Link>
		</div>
	);
}
