import {
	DEMO_MODEL,
	DEMO_PROMPT,
	DEMO_TOOLS,
	type DemoState,
	type DemoToolSpec,
} from "../scenario/sequence";
import type { AgentModel, ChatMessage, Project, Session } from "./hero-types";
import type { HeroTaskId } from "./projects-nav";
import type { ToolBlock } from "../workbench/tool-block";
export const contextWindow = 202144;
export const HERO_COMPUTER_WIDTH = 320;
export const DEMO_WIDTH = 1392;
export const DEMO_HEIGHT = 787;
export const FOLLOW_UP_REPLY =
	"This is an interactive preview. Run Local Studio with your own files, tools, and local models.";

export const demoModel: AgentModel = {
	id: "qwen38-27b",
	name: DEMO_MODEL,
	provider: "local-studio",
	contextWindow,
	maxTokens: contextWindow,
	reasoning: true,
	vision: false,
	active: true,
};

export const demoProject: Project = {
	id: "home",
	name: "Home",
	path: "/Users/sero/Home",
	addedAt: "2026-08-01",
	exists: true,
	hasGit: true,
	branch: "main",
};

export const emptyTerminals = { owners: [], activeOwnerKey: null };

export const inboxMessages: readonly ChatMessage[] = [
	{
		id: "inbox-user",
		role: "user",
		text: "Turn the unread school emails into one checklist for Monday. Don't reply to anyone.",
	},
	{
		id: "inbox-assistant",
		role: "assistant",
		text: "Monday is clear: return the library book, sign the museum form, and pack trainers for PE. I saved the checklist locally and sent nothing.",
	},
];

export function userMessage(): ChatMessage {
	return { id: "user-1", role: "user", text: DEMO_PROMPT };
}

export function toolBlocksFor(state: Readonly<DemoState>): readonly Readonly<ToolBlock>[] {
	return DEMO_TOOLS.slice(0, state.toolsStarted).map((tool: Readonly<DemoToolSpec>, index) => ({
		id: tool.id,
		name: tool.name,
		status: index < state.toolsDone ? "done" : "running",
		args: tool.args,
		resultText: index < state.toolsDone ? tool.resultText : undefined,
	}));
}

export function demoSession(
	state: Readonly<DemoState>,
	submitted: boolean,
	task: HeroTaskId,
	title: string,
	extras: readonly ChatMessage[],
): Session {
	const inbox = task === "inbox";
	const base = inbox ? inboxMessages : submitted ? [userMessage()] : [];
	return {
		id: inbox ? "session-inbox" : "session-weekend",
		piSessionId: inbox ? "pi-inbox" : "pi-weekend",
		projectId: demoProject.id,
		cwd: demoProject.path,
		modelId: demoModel.id,
		title,
		messages: [...base, ...extras],
		status:
			inbox || state.phase === "done"
				? "idle"
				: state.phase === "load"
					? "starting"
					: submitted
						? "running"
						: "idle",
		error: "",
		input: "",
		tokenStats: {
			read: inbox ? 900 : 1800 + state.toolsDone * 400,
			write: inbox ? 280 : 600 + state.toolsDone * 180,
			current: inbox || state.resultVisible ? 2400 : submitted ? 900 : 0,
		},
		contextUsage: {
			tokens: inbox || state.resultVisible ? 2400 : submitted ? 900 : 0,
			percent: inbox || state.resultVisible ? 2 : 1,
		},
	};
}

export function demoGitSummary(reviewReady: boolean) {
	return {
		isRepo: true,
		branch: "main",
		additions: reviewReady ? 12 : 0,
		deletions: 0,
		statusCount: reviewReady ? 1 : 0,
	} as const;
}
