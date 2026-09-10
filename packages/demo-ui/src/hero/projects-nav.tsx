import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./projects-nav.styles.ts";
import { Folder, FolderOpen } from "../ui/icons";
export type HeroTaskId = "weekend" | "inbox";

export function HeroProjectsNav({
	expanded,
	activeTask,
	onSelectTask,
	titles,
}: {
	readonly expanded: boolean;
	readonly activeTask: HeroTaskId;
	readonly onSelectTask: (task: HeroTaskId) => void;
	readonly titles: Readonly<Record<HeroTaskId, string>>;
}) {
	if (!expanded) return null;
	return (
		<>
			<div {...stylex.props(demoStyles.reset, styles.div13)}>Projects</div>
			<HeroProject />
			<div {...stylex.props(demoStyles.reset, styles.div13)}>Tasks</div>
			<div {...stylex.props(demoStyles.reset, styles.div3)}>
				<button
					type="button"
					{...stylex.props(
						demoStyles.reset,
						demoStyles.controlReset,
						activeTask === "weekend" ? styles.focusedRow : styles.idleRow,
					)}
					onClick={() => {
						onSelectTask("weekend");
					}}
				>
					<span {...stylex.props(demoStyles.reset, styles.span63)}>{titles.weekend}</span>
					<span {...stylex.props(demoStyles.reset, styles.span66)}>now</span>
				</button>
				<button
					type="button"
					{...stylex.props(
						demoStyles.reset,
						demoStyles.controlReset,
						activeTask === "inbox" ? styles.focusedRow : styles.idleRow,
					)}
					onClick={() => {
						onSelectTask("inbox");
					}}
				>
					<span {...stylex.props(demoStyles.reset, styles.span63)}>{titles.inbox}</span>
					<span {...stylex.props(demoStyles.reset, styles.span66)}>3h</span>
				</button>
			</div>
		</>
	);
}

function HeroProject() {
	return (
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
					<span {...stylex.props(demoStyles.reset, styles.span50)}>Home</span>
				</button>
			</div>
		</div>
	);
}
