export type ChatMessage = {
	readonly id: string;
	readonly role: "user" | "assistant";
	readonly text: string;
};
export type AgentModel = {
	readonly id: string;
	readonly name: string;
	readonly provider: string;
	readonly contextWindow: number;
	readonly maxTokens: number;
	readonly reasoning: boolean;
	readonly vision: boolean;
	readonly active: boolean;
};
export type Project = {
	readonly id: string;
	readonly name: string;
	readonly path: string;
	readonly addedAt: string;
	readonly exists: boolean;
	readonly hasGit: boolean;
	readonly branch: string;
};
export type Session = {
	readonly id: string;
	readonly piSessionId: string;
	readonly projectId: string;
	readonly cwd: string;
	readonly modelId: string;
	readonly title: string;
	readonly messages: readonly ChatMessage[];
	readonly status: "idle" | "starting" | "running";
	readonly error: string;
	readonly input: string;
	readonly tokenStats: { readonly read: number; readonly write: number; readonly current: number };
	readonly contextUsage: { readonly tokens: number; readonly percent: number };
};
