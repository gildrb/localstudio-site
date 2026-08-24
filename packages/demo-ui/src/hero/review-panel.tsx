import { GitBranchIcon } from "../ui/icons";
import { DEMO_DIFF } from "../scenario/sequence";
import { DiffPreview } from "../workbench/diff-preview";

export function HeroReviewPanel({ ready }: { ready: boolean }) {
	return (
		<section className="flex min-h-0 flex-1 flex-col bg-(--color-panel)">
			<div className="flex h-9 shrink-0 items-center gap-2 border-b border-(--border)/80 bg-(--color-header) px-3 text-xs">
				<GitBranchIcon className="h-3.5 w-3.5" />
				<span>{ready ? "Review" : "No changes"}</span>
			</div>
			<div className="min-h-0 flex-1 overflow-auto p-3">
				{ready ? <DiffPreview body={DEMO_DIFF} /> : null}
			</div>
		</section>
	);
}
