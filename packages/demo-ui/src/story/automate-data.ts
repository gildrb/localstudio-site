export type AutomationFilter = "all" | "active" | "paused";
export type DemoAutomation = {
	readonly id: string;
	readonly name: string;
	readonly prompt: string;
	readonly schedule: string;
	readonly nextRun: string;
	readonly status: Exclude<AutomationFilter, "all">;
};

export const AUTOMATION_FILTERS: readonly {
	readonly id: AutomationFilter;
	readonly label: string;
}[] = [
	{ id: "all", label: "All" },
	{ id: "active", label: "Active" },
	{ id: "paused", label: "Paused" },
];

export const AUTOMATIONS: readonly [DemoAutomation, ...DemoAutomation[]] = [
	{
		id: "daily-brief",
		name: "Daily brief",
		prompt: "Review my recent work and summarize priorities, blockers, and next actions.",
		schedule: "Weekdays at 08:00",
		nextRun: "Tomorrow at 08:00",
		status: "active",
	},
	{
		id: "weekly-review",
		name: "Weekly review",
		prompt: "Review what I worked on this week and draft a concise status update.",
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

export const DEFAULT_AUTOMATION = AUTOMATIONS[0];
