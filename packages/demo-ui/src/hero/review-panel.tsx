import { GitBranchIcon } from "..";
import { DEMO_DIFF } from "../scenario/sequence";

export function HeroReviewPanel({ ready }: { ready: boolean }) {
	return (
		<section className="flex min-h-0 flex-1 flex-col bg-(--color-panel)">
			<div className="flex h-9 shrink-0 items-center gap-2 border-b border-(--border)/80 bg-(--color-header) px-3 text-xs">
				<GitBranchIcon className="h-3.5 w-3.5" />
				<span>{ready ? "Review" : "No changes"}</span>
			</div>
			<pre className="min-h-0 flex-1 overflow-auto p-3 font-mono text-[length:var(--fs-xs)] text-(--fg)/80">
				{ready ? DEMO_DIFF : ""}
			</pre>
		</section>
	);
}
