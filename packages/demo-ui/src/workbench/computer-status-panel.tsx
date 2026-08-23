export function ComputerStatusPanel({
	activeProject,
	activeModel,
	focusedSession,
}: {
	activeProject?: { name: string; path: string } | null;
	activeModel?: { name: string } | null;
	focusedSession?: { title: string; status: string } | null;
	sessions?: unknown;
	gitSummary?: unknown;
}) {
	return (
		<section className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4 text-[length:var(--fs-sm)] text-(--fg)/80">
			<p>
				<span className="text-(--dim)">Session</span>
				<span className="ml-2">{focusedSession?.title ?? "New task"}</span>
			</p>
			<p>
				<span className="text-(--dim)">Status</span>
				<span className="ml-2">{focusedSession?.status ?? "idle"}</span>
			</p>
			<p>
				<span className="text-(--dim)">Model</span>
				<span className="ml-2">{activeModel?.name ?? "None"}</span>
			</p>
			<p>
				<span className="text-(--dim)">Project</span>
				<span className="ml-2">{activeProject?.name ?? "Home"}</span>
			</p>
		</section>
	);
}
