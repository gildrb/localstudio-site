import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./computer-status-panel.styles.ts";
export function ComputerStatusPanel({
	activeProject,
	activeModel,
	focusedSession,
}: {
	activeProject?: { name: string } | null;
	activeModel?: { name: string } | null;
	focusedSession?: { title: string; status: string } | null;
}) {
	return (
		<section {...stylex.props(demoStyles.reset, styles.section11)}>
			<p {...stylex.props(demoStyles.reset)}>
				<span {...stylex.props(demoStyles.reset, styles.span13)}>Session</span>
				<span {...stylex.props(demoStyles.reset, styles.span14)}>{focusedSession?.title ?? "New task"}</span>
			</p>
			<p {...stylex.props(demoStyles.reset)}>
				<span {...stylex.props(demoStyles.reset, styles.span13)}>Status</span>
				<span {...stylex.props(demoStyles.reset, styles.span14)}>{focusedSession?.status ?? "idle"}</span>
			</p>
			<p {...stylex.props(demoStyles.reset)}>
				<span {...stylex.props(demoStyles.reset, styles.span13)}>Model</span>
				<span {...stylex.props(demoStyles.reset, styles.span14)}>{activeModel?.name ?? "None"}</span>
			</p>
			<p {...stylex.props(demoStyles.reset)}>
				<span {...stylex.props(demoStyles.reset, styles.span13)}>Project</span>
				<span {...stylex.props(demoStyles.reset, styles.span14)}>{activeProject?.name ?? "Home"}</span>
			</p>
		</section>
	);
}
