import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./review-panel.styles.ts";
import { GitBranchIcon } from "../ui/icons";
import { DEMO_DIFF } from "../scenario/sequence";
import { DiffPreview } from "../workbench/diff-preview";

export function HeroReviewPanel({ ready }: { ready: boolean }) {
	return (
		<section {...stylex.props(demoStyles.reset, styles.section7)}>
			<div {...stylex.props(demoStyles.reset, styles.div8)}>
				<GitBranchIcon {...stylex.props(demoStyles.reset, styles.gitbranchicon9, styles.lucideScale)} />
				<span {...stylex.props(demoStyles.reset)}>{ready ? "Review" : "No changes"}</span>
			</div>
			<div {...stylex.props(demoStyles.reset, styles.div12)}>
				{ready ? <DiffPreview body={DEMO_DIFF} /> : null}
			</div>
		</section>
	);
}
