import { useMemo, useState } from "react";
import { GitBranchIcon } from "@/ui/icons";
import { DiffFileList } from "@/features/agent/ui/git-diff-panel-diff-view";
import {
	parseUnifiedDiff,
	type DiffViewMode,
} from "@/features/agent/ui/git-diff-panel-model";
import { DEMO_DIFF } from "../../demo/sequence";

export function HeroReviewPanel({ ready }: { ready: boolean }) {
	const [viewMode, setViewMode] = useState<DiffViewMode>("unified");
	const files = useMemo(() => parseUnifiedDiff(DEMO_DIFF), []);
	return (
		<section className="flex min-h-0 flex-1 flex-col bg-(--color-panel)">
			<div className="flex h-9 shrink-0 items-center gap-2 border-b border-(--border)/80 bg-(--color-header) px-3 text-xs">
				<GitBranchIcon className="h-3.5 w-3.5 text-(--dim)" />
				<span className="min-w-0 flex-1 truncate text-(--fg)">main</span>
				<span className="shrink-0 font-mono text-[length:var(--fs-xs)]">
					<span className="text-(--color-diff-added)">+12</span>{" "}
					<span className="text-(--color-diff-removed)">-0</span>
				</span>
			</div>
			{ready ? (
				<DiffFileList
					files={files}
					viewMode={viewMode}
					onViewMode={setViewMode}
				/>
			) : (
				<div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-xs text-(--dim)">
					No itinerary changes yet
				</div>
			)}
		</section>
	);
}
