import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./automate-demo.styles.ts";
import { useMemo, useState } from "react";
import { Check, Clock, Pause, Play, Plus, Search } from "../ui/icon-registry";
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

const AUTOMATIONS = [
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
] satisfies readonly [DemoAutomation, ...DemoAutomation[]];

const DEFAULT_AUTOMATION = AUTOMATIONS[0];

export function AutomateDemo() {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<AutomationFilter>("all");
	const [selectedId, setSelectedId] = useState(DEFAULT_AUTOMATION.id);
	const selected =
		AUTOMATIONS.find((automation) => automation.id === selectedId) ??
		DEFAULT_AUTOMATION;
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
			<div {...stylex.props(demoStyles.reset, styles.div71)}>
				<section {...stylex.props(demoStyles.reset, styles.section72)}>
					<header {...stylex.props(demoStyles.reset, styles.header73)}>
						<div {...stylex.props(demoStyles.reset, styles.div74)}>
							<h2 {...stylex.props(demoStyles.reset, styles.h175)}>
								Automations
							</h2>
							<p {...stylex.props(demoStyles.reset, styles.p78)}>
								3 scheduled tasks
							</p>
						</div>
						<button
							type="button"
							{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button84)}
						>
							<Plus {...stylex.props(demoStyles.reset, styles.plus86, styles.lucideScale)} /> New
						</button>
					</header>

					<div {...stylex.props(demoStyles.reset, styles.div90)}>
						<label {...stylex.props(demoStyles.reset, styles.label91)}>
							<span {...stylex.props(demoStyles.reset, styles.span92)}>Search automations</span>
							<Search {...stylex.props(demoStyles.reset, styles.search93, styles.lucideScale)} />
							<input
								type="search"
								name="automation-search"
								autoComplete="off"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search automations, e.g. health checks…"
								{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.element98)}
							/>
						</label>
						<div {...stylex.props(demoStyles.reset, styles.div101)}>
							{AUTOMATION_FILTERS.map((item) => (
								<button
									key={item.id}
									type="button"
									onClick={() => setFilter(item.id)}
									aria-pressed={filter === item.id}
									{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.filter, filter === item.id ? styles.filterActive : styles.filterIdle)}
								>
									{item.label}
								</button>
							))}
						</div>
					</div>

					<ul {...stylex.props(demoStyles.reset, styles.ul116)}>
						{visible.map((automation, index) => {
							const active = automation.id === selected.id;
							return (
								<li key={automation.id} {...stylex.props(demoStyles.reset, index < visible.length - 1 && styles.automationDivider)}>
									<button
										type="button"
										onClick={() => setSelectedId(automation.id)}
										{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.automationRow, active ? styles.automationActive : styles.automationIdle)}
									>
										<span {...stylex.props(demoStyles.reset, styles.span126)}>
											<span
												{...stylex.props(demoStyles.reset, styles.statusDot, automation.status === "active" ? styles.statusDotActive : styles.statusDotIdle)}
											/>
											<span {...stylex.props(demoStyles.reset, styles.span130)}>
												<span {...stylex.props(demoStyles.reset, styles.span131)}>
													{automation.name}
												</span>
												<span {...stylex.props(demoStyles.reset, styles.span134)}>
													<Clock {...stylex.props(demoStyles.reset, styles.clock135, styles.lucideScale)} />
													{automation.schedule}
												</span>
												<span {...stylex.props(demoStyles.reset, styles.span138)}>
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

				<section {...stylex.props(demoStyles.reset, styles.section152)}>
					<header {...stylex.props(demoStyles.reset, styles.header153)}>
						<div {...stylex.props(demoStyles.reset, styles.div74)}>
							<h3 {...stylex.props(demoStyles.reset, styles.h2155)}>
								{selected.name}
							</h3>
							<p {...stylex.props(demoStyles.reset, styles.p78)}>
								{selected.status === "active" ? selected.schedule : "Paused"}
							</p>
						</div>
						<div {...stylex.props(demoStyles.reset, styles.div162)}>
							<button
								type="button"
								{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button165)}
							>
								<Pause {...stylex.props(demoStyles.reset, styles.plus86, styles.lucideScale)} /> Pause
							</button>
							<button
								type="button"
								{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button171)}
							>
								<Play {...stylex.props(demoStyles.reset, styles.plus86, styles.lucideScale)} /> Run Now
							</button>
						</div>
					</header>

					<div {...stylex.props(demoStyles.reset, styles.div178)}>
						<div {...stylex.props(demoStyles.reset, styles.div179)}>
							<label {...stylex.props(demoStyles.reset, styles.label180)}>
								Name
								<input
									readOnly
									value={selected.name}
									{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.input185)}
								/>
							</label>
							<label {...stylex.props(demoStyles.reset, styles.label180)}>
								Task
								<textarea
									readOnly
									value={selected.prompt}
									rows={3}
									{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.textarea194)}
								/>
								<span {...stylex.props(demoStyles.reset, styles.span196)}>
									Local Studio sends this instruction to the selected model on
									every run.
								</span>
							</label>
							<section {...stylex.props(demoStyles.reset, styles.section201)}>
								<div {...stylex.props(demoStyles.reset, styles.div202)}>
									<Clock {...stylex.props(demoStyles.reset, styles.clock203, styles.lucideScale)} />
									<div {...stylex.props(demoStyles.reset)}>
										<h4 {...stylex.props(demoStyles.reset, styles.h3205)}>
											Schedule
										</h4>
										<p {...stylex.props(demoStyles.reset, styles.p78)}>
											{selected.schedule}
										</p>
									</div>
								</div>
								<div {...stylex.props(demoStyles.reset, styles.div213)}>
									<span {...stylex.props(demoStyles.reset, styles.span214)}>
										Daily
									</span>
									<span {...stylex.props(demoStyles.reset, styles.span217)}>
										08:00
									</span>
									<span {...stylex.props(demoStyles.reset, styles.span217)}>
										Weekdays only
									</span>
								</div>
							</section>
							<div {...stylex.props(demoStyles.reset, styles.div225)}>
								<div {...stylex.props(demoStyles.reset)}>
									<p {...stylex.props(demoStyles.reset, styles.p227)}>Model</p>
									<p {...stylex.props(demoStyles.reset, styles.p228)}>
										Qwen3.8-27B
									</p>
								</div>
								<div {...stylex.props(demoStyles.reset)}>
									<p {...stylex.props(demoStyles.reset, styles.p227)}>Working directory</p>
									<p {...stylex.props(demoStyles.reset, styles.p234)}>
										~/Projects/local-studio
									</p>
								</div>
							</div>
							<section {...stylex.props(demoStyles.reset, styles.section239)}>
								<h4 {...stylex.props(demoStyles.reset, styles.h3205)}>
									Recent Runs
								</h4>
								<div {...stylex.props(demoStyles.reset, styles.div243)}>
									<span {...stylex.props(demoStyles.reset, styles.div202)}>
										<Check {...stylex.props(demoStyles.reset, styles.check245, styles.lucideScale)} />
										<span {...stylex.props(demoStyles.reset)}>
											<strong {...stylex.props(demoStyles.reset, styles.strong247)}>Completed</strong>
											<span {...stylex.props(demoStyles.reset, styles.span248)}>
												Today at 08:00 · 42 seconds
											</span>
										</span>
									</span>
									<span {...stylex.props(demoStyles.reset, styles.span253)}>
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
