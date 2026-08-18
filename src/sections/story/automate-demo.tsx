import { useEffect, useState } from "react";
import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";

const JOBS = [
	{
		name: "Proxy health check",
		when: "Every 15 min",
		state: "Next run in 4 min",
	},
	{ name: "Pull Qwen3.8-27B", when: "Daily 02:00", state: "Last run ok" },
	{ name: "Usage recap", when: "Mondays 09:00", state: "Paused" },
];

export function AutomateDemo() {
	const [selected, setSelected] = useState(0);
	useEffect(() => {
		const id = window.setInterval(() => {
			setSelected((index) => (index + 1) % JOBS.length);
		}, 1600);
		return () => window.clearInterval(id);
	}, []);

	return (
		<DemoShell
			scene="automate"
			pathname="/agent/automations"
			label="Automations"
			crop={STORY_CROP}
		>
			<div className="min-h-0 flex-1 overflow-hidden px-8 py-7">
				<h3 className="text-[length:var(--fs-xl)] font-medium">Automations</h3>
				<p className="mt-1 text-[length:var(--fs-sm)] text-(--dim)">
					3 scheduled tasks
				</p>
				<div className="mt-6 grid gap-3">
					{JOBS.map((job, index) => (
						<button
							key={job.name}
							type="button"
							className={`rounded-xl border px-4 py-4 text-left ${
								selected === index
									? "border-(--border) bg-(--active)"
									: "border-transparent bg-(--ui-surface)/60 hover:bg-(--hover)"
							}`}
							onClick={() => setSelected(index)}
						>
							<span className="block text-[length:var(--fs-md)] font-medium">
								{job.name}
							</span>
							<span className="mt-1 block text-[length:var(--fs-sm)] text-(--dim)">
								{job.when}
							</span>
							<span className="mt-1 block text-[length:var(--fs-xs)] text-(--dim)">
								{job.state}
							</span>
						</button>
					))}
				</div>
			</div>
		</DemoShell>
	);
}
