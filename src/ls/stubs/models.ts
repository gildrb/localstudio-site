export type AgentModel = {
	id: string;
	name: string;
	provider: "local-studio";
	providerId?: string;
	rawId?: string;
	controllerUrl?: string;
	controllerName?: string;
	contextWindow: number;
	maxTokens: number;
	reasoning: boolean;
	thinkingLevels?: Array<
		"off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max"
	>;
	vision: boolean;
	active: boolean;
};
