export type ToolBlock = {
	kind: "tool";
	id: string;
	name: string;
	status: "running" | "done" | "error";
	argsText?: string;
	args?: Record<string, unknown>;
	resultText?: string;
	text: string;
};

export type TextBlock = { kind: "text"; id: string; text: string };
export type ThinkingBlock = { kind: "thinking"; id: string; text: string };
export type EventBlock = { kind: "event"; id: string; text: string };
export type AssistantBlock = TextBlock | ThinkingBlock | ToolBlock | EventBlock;

export type ChatMessageAttachment = {
	id: string;
	name: string;
	type: string;
	size: number;
	path?: string;
	mode: "text" | "data-url" | "metadata";
	content: string;
	previewKind?: "image" | "video" | "audio" | "pdf" | "file";
	previewUrl?: string;
};

export type ChatMessage = {
	id: string;
	role: "user" | "assistant" | "system";
	text: string;
	attachments?: ChatMessageAttachment[];
	skills?: Array<{ id: string; name: string; path?: string; source?: string }>;
	blocks?: AssistantBlock[];
	pending?: boolean;
	timestamp?: string;
};

export type QueuedMessage = {
	id: string;
	mode: "steer" | "follow_up";
	text: string;
	sent?: boolean;
};

export function formatTokenCount(tokens: number): string {
	if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
	if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
	return String(Math.max(0, Math.round(tokens)));
}
