import * as stylex from "@stylexjs/stylex";
import { styles } from "./desktop-sidebar.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
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
	return <span {...stylex.props(demoStyles.reset, styles.span14)} aria-hidden="true" title={profile.name} />;
}
function useLocalProfile(): [{ name: string }] {
	return [{ name: "Sero" }];
}
import { HeroProjectsNav, type HeroTaskId } from "./projects-nav";


export function HeroDesktopSidebar({
	mobile = false,
	pathname = "/agent",
	showProjects = true,
	activeTask,
	onSelectTask,
	titles,
}: {
	mobile?: boolean;
	pathname?: string;
	showProjects?: boolean;
	activeTask?: HeroTaskId;
	onSelectTask?: (task: HeroTaskId) => void;
	titles?: Record<HeroTaskId, string>;
}) {
	return (
		<aside
			{...stylex.props(demoStyles.reset, styles.aside39, demoStyles.fixedWidth(DEFAULT_SIDEBAR_WIDTH))}
		>
			<div {...stylex.props(demoStyles.reset, styles.div42)}>
				<div {...stylex.props(demoStyles.reset, styles.div43)}>
					<button
						type="button"
						{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button46)}
						title="Collapse sidebar"
						aria-label="Collapse sidebar"
					>
						<PanelLeftFilled {...stylex.props(demoStyles.reset, styles.panelleftfilled50)} strokeWidth={1.75} />
					</button>
					<button
						type="button"
						{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.historyStepper)}
						title="Go back"
						aria-label="Go back"
					>
						<ChevronLeft {...stylex.props(demoStyles.reset, styles.panelleftfilled50, styles.lucideScale)} strokeWidth={1.75} />
					</button>
					<button
						type="button"
						{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.historyStepper)}
						title="Go forward"
						aria-label="Go forward"
					>
						<ChevronRight {...stylex.props(demoStyles.reset, styles.panelleftfilled50, styles.lucideScale)} strokeWidth={1.75} />
					</button>
					<button
						type="button"
						{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button70)}
						title="Search sessions (⌘K)"
						aria-label="Search sessions"
					>
						<SearchIcon {...stylex.props(demoStyles.reset, styles.searchicon74, styles.lucideScale)} strokeWidth={1.75} />
					</button>
				</div>
				<nav {...stylex.props(demoStyles.reset, styles.sidebarScroller, demoStyles.sidebarScroller, mobile && demoStyles.hiddenOverflow)}>
					<button
						type="button"
						{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button80)}
						title="New task"
					>
						<SquarePen
							{...stylex.props(demoStyles.reset, styles.squarepen84, styles.lucideScale)}
							strokeWidth={1.6}
						/>
						<span {...stylex.props(demoStyles.reset, styles.span87)}>
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
				<div {...stylex.props(demoStyles.reset, styles.div109)}>
					<HeroProfileFooter />
				</div>
			</div>
		</aside>
	);
}

function HeroProfileFooter() {
	const [profile] = useLocalProfile();
	return (
		<div {...stylex.props(demoStyles.reset, styles.div120)}>
			<div {...stylex.props(demoStyles.reset, styles.div121)}>
				<ProfileAvatar profile={profile} />
				<span {...stylex.props(demoStyles.reset, styles.span123)}>
					{profile.name}
				</span>
			</div>
			<span
				{...stylex.props(demoStyles.reset, styles.span128)}
				title="Connect phone"
				aria-hidden="true"
			>
				<Smartphone {...stylex.props(demoStyles.reset, styles.smartphone132, styles.lucideScale)} strokeWidth={1.75} />
			</span>
			<span
				title="Settings"
				{...stylex.props(demoStyles.reset, styles.span128)}
				aria-hidden="true"
			>
				<Settings {...stylex.props(demoStyles.reset, styles.smartphone132, styles.lucideScale)} strokeWidth={1.75} />
			</span>
		</div>
	);
}
