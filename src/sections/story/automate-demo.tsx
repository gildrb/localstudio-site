import { useMemo, useState } from "react";
import { Check, Clock, Pause, Play, Plus, Search } from "@local-studio/demo-ui";
import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";

type AutomationFilter = "all" | "active" | "paused";
type DemoAutomation = {
	id: string;
	name: string;
	prompt: string;
	schedule: string;
	nextRun: string;
	status: Exclude<AutomationFilter, "all">;
};

const AUTOMATION_FILTERS: Array<{ id: AutomationFilter; label: string }> = [
	{ id: "all", label: "All" },
	{ id: "active", label: "Active" },
	{ id: "paused", label: "Paused" },
];

const AUTOMATIONS: DemoAutomation[] = [
	{
		id: "daily-brief",
		name: "Daily brief",
		prompt:
			"Review my recent work and summarize priorities, blockers, and next actions.",
		schedule: "Weekdays at 08:00",
		nextRun: "Tomorrow at 08:00",
		status: "active",
	},
	{
		id: "weekly-review",
		name: "Weekly review",
		prompt:
			"Review what I worked on this week and draft a concise status update.",
		schedule: "Fridays at 16:00",
		nextRun: "Friday at 16:00",
		status: "active",
	},
	{
		id: "follow-up-monitor",
		name: "Follow-up monitor",
		prompt: "Review recent activity and flag anything that needs my attention.",
		schedule: "Every hour",
		nextRun: "Paused",
		status: "paused",
	},
];

export function AutomateDemo() {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<AutomationFilter>("all");
	const [selectedId, setSelectedId] = useState(AUTOMATIONS[0].id);
	const selected =
		AUTOMATIONS.find((automation) => automation.id === selectedId) ??
		AUTOMATIONS[0];
	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return AUTOMATIONS.filter(
			(automation) =>
				(filter === "all" || automation.status === filter) &&
				(!needle || automation.name.toLowerCase().includes(needle)),
		);
	}, [filter, query]);

	return (
		<DemoShell scene="automate" label="Automations" crop={STORY_CROP}>
			<div className="flex min-h-0 w-[820px] max-md:w-[680px]">
				<section className="flex min-h-0 w-[320px] shrink-0 flex-col border-r border-(--ui-border) bg-(--ui-bg) max-md:w-[280px]">
					<header className="flex h-14 shrink-0 items-center justify-between border-b border-(--ui-border) px-4">
						<div className="min-w-0">
							<h1 className="truncate text-[length:var(--fs-xl)] font-medium text-(--ui-fg)">
								Automations
							</h1>
							<p className="text-[length:var(--fs-xs)] text-(--ui-muted)">
								3 scheduled tasks
							</p>
						</div>
						<button
							type="button"
							className="inline-flex h-7 items-center gap-1 rounded-md bg-(--ui-fg) px-2.5 text-[length:var(--fs-xs)] text-(--ui-bg)"
						>
							<Plus className="h-3 w-3" /> New
						</button>
					</header>

					<div className="shrink-0 space-y-2 border-b border-(--ui-separator) p-3">
						<label className="relative block">
							<span className="sr-only">Search automations</span>
							<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--ui-muted)" />
							<input
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search automations"
								className="h-8 w-full rounded-[var(--ui-radius)] border border-(--ui-border) bg-(--ui-surface) pl-9 pr-3 text-[length:var(--fs-sm)] outline-none"
							/>
						</label>
						<div className="inline-flex rounded-[var(--ui-radius)] border border-(--ui-border) bg-(--ui-surface) p-0.5">
							{AUTOMATION_FILTERS.map((item) => (
								<button
									key={item.id}
									type="button"
									onClick={() => setFilter(item.id)}
									aria-pressed={filter === item.id}
									className={`h-7 rounded-md px-2.5 text-[length:var(--fs-xs)] ${filter === item.id ? "bg-(--ui-active) text-(--ui-fg)" : "text-(--ui-muted)"}`}
								>
									{item.label}
								</button>
							))}
						</div>
					</div>

					<ul className="min-h-0 flex-1 divide-y divide-(--ui-separator)/70 overflow-y-auto p-1.5">
						{visible.map((automation) => {
							const active = automation.id === selected.id;
							return (
								<li key={automation.id}>
									<button
										type="button"
										onClick={() => setSelectedId(automation.id)}
										className={`w-full rounded-[var(--ui-radius)] px-3 py-2.5 text-left ${active ? "bg-(--ui-active)" : "hover:bg-(--ui-hover)/60"}`}
									>
										<span className="flex items-start gap-3">
											<span
												className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${automation.status === "active" ? "bg-(--ui-accent)" : "bg-(--ui-muted)/45"}`}
											/>
											<span className="min-w-0 flex-1">
												<span className="block truncate text-[length:var(--fs-base)] font-medium">
													{automation.name}
												</span>
												<span className="mt-1 flex items-center gap-1.5 truncate text-[length:var(--fs-sm)] text-(--ui-muted)">
													<Clock className="h-3 w-3 shrink-0" />
													{automation.schedule}
												</span>
												<span className="mt-1 block truncate text-[length:var(--fs-xs)] text-(--ui-muted)/75">
													{automation.status === "paused"
														? "Paused"
														: `Next run ${automation.nextRun}`}
												</span>
											</span>
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</section>

				<section className="flex min-h-0 flex-1 flex-col bg-(--ui-bg)">
					<header className="flex h-14 shrink-0 items-center justify-between border-b border-(--ui-border) px-5">
						<div className="min-w-0">
							<h2 className="truncate text-[length:var(--fs-lg)] font-medium">
								{selected.name}
							</h2>
							<p className="text-[length:var(--fs-xs)] text-(--ui-muted)">
								{selected.status === "active" ? selected.schedule : "Paused"}
							</p>
						</div>
						<div className="flex gap-1.5">
							<button
								type="button"
								className="inline-flex h-7 items-center gap-1.5 rounded-md border border-(--ui-border) px-2.5 text-[length:var(--fs-xs)]"
							>
								<Pause className="h-3 w-3" /> Pause
							</button>
							<button
								type="button"
								className="inline-flex h-7 items-center gap-1.5 rounded-md bg-(--ui-fg) px-2.5 text-[length:var(--fs-xs)] text-(--ui-bg)"
							>
								<Play className="h-3 w-3" /> Run now
							</button>
						</div>
					</header>

					<div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
						<div className="grid gap-4">
							<label className="grid gap-1.5 text-[length:var(--fs-xs)] font-medium">
								Name
								<input
									readOnly
									value={selected.name}
									className="h-8 rounded-md border border-(--ui-border) bg-(--ui-surface) px-3 text-[length:var(--fs-sm)] font-normal"
								/>
							</label>
							<label className="grid gap-1.5 text-[length:var(--fs-xs)] font-medium">
								Task
								<textarea
									readOnly
									value={selected.prompt}
									rows={3}
									className="resize-none rounded-md border border-(--ui-border) bg-(--ui-surface) px-3 py-2 text-[length:var(--fs-sm)] font-normal leading-5"
								/>
								<span className="font-normal text-(--ui-muted)">
									Local Studio sends this instruction to the selected model on
									every run.
								</span>
							</label>
							<section className="border-t border-(--ui-separator) pt-4">
								<div className="flex items-center gap-2">
									<Clock className="h-3.5 w-3.5 text-(--ui-muted)" />
									<div>
										<h3 className="text-[length:var(--fs-sm)] font-medium">
											Schedule
										</h3>
										<p className="text-[length:var(--fs-xs)] text-(--ui-muted)">
											{selected.schedule}
										</p>
									</div>
								</div>
								<div className="mt-3 flex gap-2">
									<span className="rounded-md border border-(--ui-border) bg-(--ui-active) px-3 py-1.5 text-[length:var(--fs-xs)]">
										Daily
									</span>
									<span className="rounded-md border border-(--ui-border) px-3 py-1.5 text-[length:var(--fs-xs)]">
										08:00
									</span>
									<span className="rounded-md border border-(--ui-border) px-3 py-1.5 text-[length:var(--fs-xs)]">
										Weekdays only
									</span>
								</div>
							</section>
							<div className="grid grid-cols-2 gap-4 border-t border-(--ui-separator) pt-4 text-[length:var(--fs-xs)]">
								<div>
									<p className="font-medium">Model</p>
									<p className="mt-1.5 rounded-md border border-(--ui-border) bg-(--ui-surface) px-3 py-2 text-[length:var(--fs-sm)]">
										Qwen3.8-27B
									</p>
								</div>
								<div>
									<p className="font-medium">Working directory</p>
									<p className="mt-1.5 truncate rounded-md border border-(--ui-border) bg-(--ui-surface) px-3 py-2 font-mono">
										~/Projects/local-studio
									</p>
								</div>
							</div>
							<section className="border-t border-(--ui-separator) pt-4 max-md:hidden">
								<h3 className="text-[length:var(--fs-sm)] font-medium">
									Recent runs
								</h3>
								<div className="mt-2 flex items-center justify-between rounded-md border border-(--ui-border) px-3 py-2 text-[length:var(--fs-xs)]">
									<span className="flex items-center gap-2">
										<Check className="h-3.5 w-3.5 text-(--ui-accent)" />
										<span>
											<strong className="block font-medium">Completed</strong>
											<span className="text-(--ui-muted)">
												Today at 08:00 · 42 seconds
											</span>
										</span>
									</span>
									<span className="font-mono text-(--ui-muted)">
										8.4K tokens
									</span>
								</div>
							</section>
						</div>
					</div>
				</section>
			</div>
		</DemoShell>
	);
}
