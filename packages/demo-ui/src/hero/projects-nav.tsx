import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./projects-nav.styles.ts";
import { Folder, FolderOpen } from "../ui/icons";
function SidebarRail({ children }: { children: import("react").ReactNode }) {
	return <div {...stylex.props(demoStyles.reset, styles.div3)}>{children}</div>;
}
function SidebarSectionHeader({
	label,
}: {
	label: string;
	open?: boolean;
	onToggle?: () => void;
	children?: import("react").ReactNode;
}) {
	return <div {...stylex.props(demoStyles.reset, styles.div13)}>{label}</div>;
}

export type HeroTaskId = "weekend" | "inbox";


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
			<div {...stylex.props(demoStyles.reset, styles.div39)}>
				<div {...stylex.props(demoStyles.reset, styles.div40)}>
					<button
						type="button"
						title="/Users/sero/Home"
						{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button44)}
					>
						<span {...stylex.props(demoStyles.reset, styles.span46)}>
							<Folder {...stylex.props(demoStyles.reset, styles.folder47)} />
							<FolderOpen {...stylex.props(demoStyles.reset, styles.folderopen48)} />
						</span>
						<span {...stylex.props(demoStyles.reset, styles.span50)}>
							Home
						</span>
					</button>
				</div>
			</div>
			<SidebarSectionHeader label="Tasks" open onToggle={() => undefined} />
			<SidebarRail>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, activeTask === "weekend" ? styles.focusedRow : styles.idleRow)}
					onClick={() => onSelectTask("weekend")}
				>
					<span {...stylex.props(demoStyles.reset, styles.span63)}>
						{titles.weekend}
					</span>
					<span {...stylex.props(demoStyles.reset, styles.span66)}>
						now
					</span>
				</button>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, activeTask === "inbox" ? styles.focusedRow : styles.idleRow)}
					onClick={() => onSelectTask("inbox")}
				>
					<span {...stylex.props(demoStyles.reset, styles.span63)}>
						{titles.inbox}
					</span>
					<span {...stylex.props(demoStyles.reset, styles.span66)}>
						3h
					</span>
				</button>
			</SidebarRail>
		</>
	);
}
