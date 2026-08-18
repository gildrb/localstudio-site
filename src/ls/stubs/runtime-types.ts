export type SessionId = string;
export type SessionStatus =
	| "idle"
	| "starting"
	| "running"
	| "stopping"
	| "loading";

export type Session = {
	id: SessionId;
	piSessionId: string | null;
	projectId?: string;
	cwd?: string;
	modelId?: string;
	title: string;
	messages: Array<{
		id: string;
		role: "user" | "assistant" | "system";
		text: string;
		skills?: Array<{
			id: string;
			name: string;
			path?: string;
			source?: string;
		}>;
	}>;
	status: SessionStatus;
	error: string;
	startedAt?: string;
	input: string;
	tokenStats?: { read: number; write: number; current: number };
	usedSkills?: Array<{
		id: string;
		name: string;
		path?: string;
		source?: string;
	}>;
	contextUsage?: {
		tokens: number;
		percent?: number;
		shouldCompact?: boolean;
	} | null;
	queue?: Array<{ id: string; mode: "steer" | "follow_up"; text: string }>;
	usageTotals?: {
		total: number;
		input: number;
		output: number;
		cacheRead: number;
		cacheWrite: number;
		reasoning: number;
		calls: number;
		compactions: number;
		cost: number;
	} | null;
};
