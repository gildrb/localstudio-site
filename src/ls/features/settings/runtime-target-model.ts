import type { EngineBackend, EngineJob, RuntimeTarget } from "../../lib/types";

export const ENGINE_META: Record<
	string,
	{ label: string; description: string }
> = {
	vllm: {
		label: "vLLM",
		description: "High-throughput LLM serving with CUDA-oriented scheduling.",
	},
	sglang: {
		label: "SGLang",
		description: "Fast structured generation and multi-turn serving.",
	},
	llamacpp: {
		label: "llama.cpp",
		description: "GGUF inference through CPU, Metal, or CUDA builds.",
	},
	mlx: { label: "MLX", description: "Apple Silicon inference through mlx-lm." },
};

export type ManagedRuntimeInstallBackend = Extract<
	EngineBackend,
	"vllm" | "sglang" | "mlx"
>;

export const MANAGED_RUNTIME_BACKENDS: readonly ManagedRuntimeInstallBackend[] =
	["vllm", "sglang", "mlx"];

const MANAGED_RUNTIME_BACKEND_SET: ReadonlySet<EngineBackend> = new Set(
	MANAGED_RUNTIME_BACKENDS,
);
const ENGINE_JOB_OUTPUT_TAIL_CHARS = 500;

export const isRunningEngineJob = (job: EngineJob | undefined): boolean =>
	job?.status === "queued" || job?.status === "running";

export const isTerminalEngineJob = (job: EngineJob): boolean =>
	job.status === "success" ||
	job.status === "error" ||
	job.status === "cancelled";

function clipEngineJobOutputTail(
	outputTail: string | undefined,
): string | null {
	const tail = outputTail?.trim();
	if (!tail) return null;
	return tail.length > ENGINE_JOB_OUTPUT_TAIL_CHARS
		? `…${tail.slice(-ENGINE_JOB_OUTPUT_TAIL_CHARS)}`
		: tail;
}

export function describeFailedEngineJob(job: EngineJob): string {
	const headline = job.message?.trim() || `${job.backend} ${job.type} failed`;
	const lines = [headline];
	const reason = job.error?.trim();
	if (reason && reason !== headline) lines.push(reason);
	const tail = clipEngineJobOutputTail(job.outputTail);
	if (tail) lines.push(tail);
	return lines.join("\n");
}

export function jobForRuntimeTarget(
	jobs: EngineJob[],
	target: RuntimeTarget,
): EngineJob | undefined {
	return (
		jobs.find((job) => job.targetId === target.id && isRunningEngineJob(job)) ??
		jobs.find((job) => job.targetId === target.id)
	);
}

export function managedInstallJob(
	jobs: EngineJob[],
	backend: ManagedRuntimeInstallBackend,
): EngineJob | undefined {
	return (
		jobs.find(
			(job) =>
				job.backend === backend &&
				job.type === "install" &&
				!job.targetId &&
				isRunningEngineJob(job),
		) ??
		jobs.find(
			(job) =>
				job.backend === backend && job.type === "install" && !job.targetId,
		)
	);
}

export function isManagedRuntimeTarget(target: RuntimeTarget): boolean {
	if (!MANAGED_RUNTIME_BACKEND_SET.has(target.backend)) return false;
	const normalizedPythonPath = target.pythonPath?.replace(/\\/g, "/") ?? "";
	return normalizedPythonPath.endsWith(
		`/runtime/venvs/${target.backend}-latest/bin/python`,
	);
}

export function managedTargetForBackend(
	targets: RuntimeTarget[],
	backend: ManagedRuntimeInstallBackend,
): RuntimeTarget | undefined {
	return targets.find(
		(target) => target.backend === backend && isManagedRuntimeTarget(target),
	);
}
