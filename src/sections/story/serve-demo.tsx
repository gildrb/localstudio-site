import { useEffect, useReducer } from "react";
import { Plus, Search, Square } from "@/ui/icon-registry";
import { ModelLogo } from "@/ui/model-logo";
import {
	ModelActiveSummary,
	ModelRow,
	ModelSection,
	ModelStatus,
} from "@/features/recipes/recipes-content/model-page";
import { ModelButton, ModelInput } from "@/ui";
import { DemoShell } from "./demo-shell";

const SERVES = [
	{
		id: "qwen",
		name: "Qwen3.8-27B",
		path: "Qwen/Qwen3.8-27B",
		runtime: "MLX",
		context: "128k ctx",
	},
	{
		id: "llama",
		name: "Llama 3.3 70B",
		path: "meta-llama/Llama-3.3-70B",
		runtime: "vLLM",
		context: "32k ctx",
	},
	{
		id: "gemma",
		name: "Gemma 3 27B",
		path: "google/gemma-3-27b",
		runtime: "SGLang",
		context: "128k ctx",
	},
] as const;

type ServePhase = "idle" | "filter" | "launch" | "live";

function serveReducer(
	state: {
		phase: ServePhase;
		filter: string;
		active: string | null;
		auto: boolean;
	},
	action:
		| { type: "type" }
		| { type: "query"; value: string }
		| { type: "pick"; id: string }
		| { type: "live" }
		| { type: "stop" },
) {
	if (action.type === "type") {
		if (!state.auto) return state;
		return {
			...state,
			filter: "qwen".slice(0, state.filter.length + 1),
			phase: "filter" as const,
		};
	}
	if (action.type === "query") {
		return {
			...state,
			filter: action.value,
			auto: false,
			phase: "filter" as const,
		};
	}
	if (action.type === "pick")
		return { ...state, active: action.id, phase: "launch" as const };
	if (action.type === "live") return { ...state, phase: "live" as const };
	return {
		...state,
		active: null,
		phase: "idle" as const,
		filter: "",
		auto: false,
	};
}

export function ServeDemo() {
	const [state, dispatch] = useReducer(serveReducer, {
		phase: "idle",
		filter: "",
		active: null,
		auto: true,
	});

	useEffect(() => {
		if (!state.auto) return;
		if (state.phase === "idle") {
			const id = window.setTimeout(() => dispatch({ type: "type" }), 400);
			return () => window.clearTimeout(id);
		}
		if (state.phase === "filter" && state.filter.length < 4) {
			const id = window.setTimeout(() => dispatch({ type: "type" }), 160);
			return () => window.clearTimeout(id);
		}
		if (state.phase === "filter") {
			const id = window.setTimeout(
				() => dispatch({ type: "pick", id: "qwen" }),
				280,
			);
			return () => window.clearTimeout(id);
		}
		if (state.phase === "launch") {
			const id = window.setTimeout(() => dispatch({ type: "live" }), 900);
			return () => window.clearTimeout(id);
		}
	}, [state]);

	const visible = SERVES.filter((item) =>
		item.name.toLowerCase().includes(state.filter.toLowerCase()),
	);
	const active = SERVES.find((item) => item.id === state.active) ?? null;

	return (
		<DemoShell
			scene="serve"
			pathname="/models"
			label="Serve configuration"
			fit={580}
			shiftX={-224}
		>
			<div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
				<ModelSection
					title="Serves"
					description="Each Serve binds model weights, a real runtime, and launch configuration."
					actions={
						<ModelStatus tone={state.phase === "live" ? "good" : "info"}>
							{state.phase === "live"
								? "running"
								: state.phase === "launch"
									? "launching"
									: "ready"}
						</ModelStatus>
					}
				>
					<ModelRow
						label="Search Serves"
						description="Name, model path, runtime, or API model name."
						control={
							<div className="relative">
								<Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--dim)" />
								<ModelInput
									value={state.filter}
									onChange={(value) => dispatch({ type: "query", value })}
									placeholder="Search Serves, weights, runtimes"
									className="pl-7"
								/>
							</div>
						}
						status={<ModelStatus>{visible.length}</ModelStatus>}
						actions={
							<ModelButton tone="primary">
								<Plus className="h-3 w-3" />
								New Serve
							</ModelButton>
						}
					/>
					<ModelActiveSummary
						title={active?.name ?? "No active Serve"}
						subtitle={active?.path ?? "This controller is ready for a Serve."}
						leading={active ? <ModelLogo modelId={active.path} /> : null}
						status={
							<ModelStatus tone={state.phase === "live" ? "good" : "default"}>
								{state.phase === "live"
									? "live"
									: state.phase === "launch"
										? "launching"
										: "idle"}
							</ModelStatus>
						}
						details={
							active
								? [
										{ label: "backend", value: active.runtime },
										{ label: "context", value: active.context },
										{ label: "fit", value: "fits 64 GB" },
									]
								: [
										{ label: "state", value: "idle" },
										{ label: "serves", value: String(SERVES.length) },
									]
						}
						progress={
							state.phase === "launch" ? "Loading weights onto MLX…" : undefined
						}
						actions={
							state.phase === "live" ? (
								<ModelButton
									onClick={() => dispatch({ type: "stop" })}
									tone="danger"
								>
									<Square className="h-3 w-3" />
									Stop
								</ModelButton>
							) : null
						}
					/>
				</ModelSection>
				<div className="mt-6 divide-y divide-(--ui-border)/55">
					{visible.map((item) => (
						<button
							key={item.id}
							type="button"
							className="flex w-full items-center justify-between gap-4 py-3 text-left"
							onClick={() => dispatch({ type: "pick", id: item.id })}
						>
							<span className="flex min-w-0 items-center gap-3">
								<ModelLogo modelId={item.path} />
								<span>
									<span className="block text-[length:var(--fs-md)] font-medium">
										{item.name}
									</span>
									<span className="block text-[length:var(--fs-sm)] text-(--dim)">
										{item.path}
									</span>
								</span>
							</span>
							<ModelStatus
								tone={
									state.active === item.id && state.phase === "live"
										? "good"
										: "default"
								}
							>
								{item.runtime}
							</ModelStatus>
						</button>
					))}
				</div>
			</div>
		</DemoShell>
	);
}
