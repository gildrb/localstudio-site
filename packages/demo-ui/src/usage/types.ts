export type UsageStats = {
	readonly daily: readonly {
		readonly date?: string;
		readonly requests: number;
		readonly total_tokens: number;
	}[];
};
