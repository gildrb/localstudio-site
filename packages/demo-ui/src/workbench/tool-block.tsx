export function ToolBlockView({
	block,
}: {
	block: {
		id: string;
		name: string;
		status: "done" | "running";
		resultText?: string | undefined;
	};
}) {
	return (
		<section className="rounded-md border border-(--border) bg-(--color-panel) px-3 py-2 text-[length:var(--fs-sm)]">
			<header className="flex items-center justify-between gap-2 font-mono text-(--dim)">
				<span>{block.name}</span>
				<span>{block.status === "done" ? "done" : "running"}</span>
			</header>
			{block.resultText ? (
				<pre className="mt-2 whitespace-pre-wrap text-(--fg)/80">{block.resultText}</pre>
			) : null}
		</section>
	);
}
