export type RuntimePlatformKind = "metal" | "cuda" | "rocm" | "cpu" | null;

export type GPU = {
	id?: string;
	index?: number;
	name: string;
	memory_used_mb: number;
	memory_total_mb: number;
	memory_free_mb?: number;
	memory_usage_available?: boolean;
	memory_shared?: boolean;
	utilization_pct: number;
	utilization_available?: boolean;
	temp_c: number;
	temperature_available?: boolean;
	power_draw?: number;
	power_limit?: number;
	power_available?: boolean;
};

export type Metrics = null;
export type ProcessInfo = { backend?: string } | null;
