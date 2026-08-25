import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./agent-composer-status-bar.styles.ts";
import { GitBranchIcon } from "../ui/icons";

const numberFormatter = new Intl.NumberFormat("en-US");

export function AgentComposerStatusBar({
	cwd,
	gitBranch,
	gitSummary,
	currentContextTokens,
	contextWindow,
	onOpenStatus,
	onOpenDiff,
}: {
	cwd: string;
	gitBranch?: string;
	gitSummary?: {
		isRepo: boolean;
		additions: number;
		deletions: number;
		statusCount: number;
	};
	currentContextTokens: number;
	contextWindow: number;
	onOpenStatus: () => void;
	onOpenDiff: () => void;
}) {
	const home = cwd.match(/^\/Users\/[^/]+(\/.*)?$/);
	const displayCwd = home ? `~${home[1] ?? ""}` : cwd;
	return (
		<div {...stylex.props(demoStyles.reset, styles.div28)}>
			<div {...stylex.props(demoStyles.reset, styles.div29)}>
				<span {...stylex.props(demoStyles.reset, styles.span30)} title={cwd}>
					{displayCwd}
				</span>
				{gitBranch ? (
					<span {...stylex.props(demoStyles.reset, styles.span34)}>
						<GitBranchIcon {...stylex.props(demoStyles.reset, styles.gitbranchicon35, styles.lucideScale)} />
						<span {...stylex.props(demoStyles.reset, styles.span36)}>{gitBranch}</span>
					</span>
				) : null}
				{gitSummary?.isRepo ? (
					<button
						type="button"
						onClick={onOpenDiff}
						{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button43)}
						title="View changes"
					>
						<span {...stylex.props(demoStyles.reset, styles.span46)}>+{numberFormatter.format(gitSummary.additions)}</span>
						<span {...stylex.props(demoStyles.reset, styles.span47)}>-{numberFormatter.format(gitSummary.deletions)}</span>
					</button>
				) : null}
			</div>
			<button
				type="button"
				onClick={onOpenStatus}
				{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button54)}
				title="Open status"
			>
				<span {...stylex.props(demoStyles.reset, styles.span57)}>
					{numberFormatter.format(currentContextTokens)}/{numberFormatter.format(contextWindow)}
				</span>
			</button>
		</div>
	);
}
