import { GitBranchIcon } from "../ui/icons";

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
		<div className="relative z-20 mx-auto mt-2 flex w-full max-w-[calc(var(--composer-w)*0.9)] items-center gap-2 overflow-visible font-mono text-[length:var(--fs-xs)] text-(--dim) sm:mt-2.5 sm:w-[90%]">
			<div className="flex min-w-0 flex-1 items-center gap-2 overflow-visible">
				<span className="block min-w-0 max-w-[42%] truncate" title={cwd}>
					{displayCwd}
				</span>
				{gitBranch ? (
					<span className="inline-flex min-w-0 shrink items-center gap-1">
						<GitBranchIcon className="h-3 w-3 shrink-0" />
						<span className="truncate">{gitBranch}</span>
					</span>
				) : null}
				{gitSummary?.isRepo ? (
					<button
						type="button"
						onClick={onOpenDiff}
						className="inline-flex shrink-0 items-center gap-1 rounded-sm px-1 transition-colors hover:bg-(--fg)/[0.05]"
						title="View changes"
					>
						<span className="text-(--ok)">+{gitSummary.additions}</span>
						<span className="text-(--err)">-{gitSummary.deletions}</span>
					</button>
				) : null}
			</div>
			<button
				type="button"
				onClick={onOpenStatus}
				className="ml-auto inline-flex shrink-0 items-center rounded-sm px-1 text-(--dim) hover:text-(--fg)/80"
				title="Open status"
			>
				<span className="tabular-nums">
					{currentContextTokens}/{contextWindow}
				</span>
			</button>
		</div>
	);
}
