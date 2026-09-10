import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./computer-status-panel.styles.ts";
export function ComputerStatusPanel({
	activeProject,
	activeModel,
	focusedSession,
}: {
	readonly activeProject?: { readonly name: string } | null;
	readonly activeModel?: { readonly name: string } | null;
	readonly focusedSession?: { readonly title: string; readonly status: string } | null;
}) {
	return (
		<section {...stylex.props(demoStyles.reset, styles.section11)}>
			<p {...stylex.props(demoStyles.reset)}>
				<span {...stylex.props(demoStyles.reset, styles.span13)}>Session</span>
				<span {...stylex.props(demoStyles.reset, styles.span14)}>
					{focusedSession?.title ?? "New task"}
				</span>
			</p>
			<p {...stylex.props(demoStyles.reset)}>
				<span {...stylex.props(demoStyles.reset, styles.span13)}>Status</span>
				<span {...stylex.props(demoStyles.reset, styles.span14)}>
					{focusedSession?.status ?? "idle"}
				</span>
			</p>
			<p {...stylex.props(demoStyles.reset)}>
				<span {...stylex.props(demoStyles.reset, styles.span13)}>Model</span>
				<span {...stylex.props(demoStyles.reset, styles.span14)}>
					{activeModel?.name ?? "None"}
				</span>
			</p>
			<p {...stylex.props(demoStyles.reset)}>
				<span {...stylex.props(demoStyles.reset, styles.span13)}>Project</span>
				<span {...stylex.props(demoStyles.reset, styles.span14)}>
					{activeProject?.name ?? "Home"}
				</span>
			</p>
		</section>
	);
}
