export const DEMO_MODEL = "Qwen3.8-27B";

export const DEMO_RUNTIME = "MLX";

export const DEMO_PROMPT =
	"The /health probe 500s while Qwen3.8-27B is warm on this Mac. Read notes/standup.md and src/proxy/health.ts, then patch the probe so a loaded local model counts as healthy.";

export const DEMO_STREAM =
	"I'll read the standup notes and the health probe, then patch the check so a warm Qwen3.8-27B counts as ready.";

export const DEMO_RESULT = `The probe 500ed because it required an empty GPU queue. A warm Qwen3.8-27B still had a short decode in flight, so /health lied.

What I changed
- src/proxy/health.ts treats a loaded local model as healthy when the last stream finished in under 2s
- /health stays red only when the runtime process is gone

Verify
- GET /health returns 200 while Qwen3.8-27B is loaded
- The standup proxy check can ship`;

export const DEMO_DIFF = `diff --git a/src/proxy/health.ts b/src/proxy/health.ts
--- a/src/proxy/health.ts
+++ b/src/proxy/health.ts
@@ -1,8 +1,11 @@
 export function isHealthy(runtime) {
-  return runtime.queueLength === 0;
+  if (!runtime.processAlive) return false;
+  return runtime.loaded && runtime.lastStreamMs < 2000;
 }
`;

export type DemoToolSpec = {
	id: string;
	name: string;
	args: Record<string, unknown>;
	resultText: string;
};

export const DEMO_TOOLS: readonly DemoToolSpec[] = [
	{
		id: "read-notes",
		name: "read_file",
		args: { path: "notes/standup.md" },
		resultText: `Standup
- Proxy /health 500s even with Qwen3.8-27B warm
- Do not upload the notes folder
- Ship the health check today`,
	},
	{
		id: "read-health",
		name: "read_file",
		args: { path: "src/proxy/health.ts" },
		resultText: `export function isHealthy(runtime) {
  return runtime.queueLength === 0;
}`,
	},
	{
		id: "patch-health",
		name: "apply_patch",
		args: { path: "src/proxy/health.ts" },
		resultText: `*** Update File: src/proxy/health.ts
-  return runtime.queueLength === 0;
+  if (!runtime.processAlive) return false;
+  return runtime.loaded && runtime.lastStreamMs < 2000;`,
	},
];

export type DemoPhase =
	| "prompt"
	| "select"
	| "load"
	| "stream"
	| "tool"
	| "result"
	| "done";

export interface DemoState {
	playing: boolean;
	phase: DemoPhase;
	promptChars: number;
	modelSelected: boolean;
	load: number;
	streamChars: number;
	toolsStarted: number;
	toolsDone: number;
	cpu: number;
	gpu: number;
	ram: number;
	resultVisible: boolean;
	reviewReady: boolean;
}

export type DemoAction =
	| { type: "play" }
	| { type: "pause" }
	| { type: "replay" }
	| { type: "finish" }
	| { type: "advance" };

export const initialDemoState: DemoState = {
	playing: true,
	phase: "prompt",
	promptChars: 0,
	modelSelected: false,
	load: 0,
	streamChars: 0,
	toolsStarted: 0,
	toolsDone: 0,
	cpu: 8,
	gpu: 0,
	ram: 4.2,
	resultVisible: false,
	reviewReady: false,
};

export const finishedDemoState: DemoState = {
	playing: false,
	phase: "done",
	promptChars: DEMO_PROMPT.length,
	modelSelected: true,
	load: 100,
	streamChars: DEMO_STREAM.length,
	toolsStarted: DEMO_TOOLS.length,
	toolsDone: DEMO_TOOLS.length,
	cpu: 14,
	gpu: 12,
	ram: 19.8,
	resultVisible: true,
	reviewReady: true,
};

export function demoOutput(state: DemoState): string {
	const stream = DEMO_STREAM.slice(0, state.streamChars);
	if (!state.resultVisible) return stream;
	if (stream.length === 0) return DEMO_RESULT;
	return `${stream}\n\n${DEMO_RESULT}`;
}

export function demoActivePath(state: DemoState): string | null {
	const tool = DEMO_TOOLS[Math.max(0, state.toolsStarted - 1)];
	const path = tool?.args.path;
	return typeof path === "string" ? path : null;
}

export function demoStatus(state: DemoState): string {
	switch (state.phase) {
		case "prompt":
			return "Typing the local prompt";
		case "select":
			return `Selected ${DEMO_MODEL}`;
		case "load":
			return `Loading ${DEMO_MODEL} ${state.load}%`;
		case "stream":
			return "Streaming tokens";
		case "tool": {
			const tool = DEMO_TOOLS[state.toolsStarted - 1];
			if (!tool) return "Running tools";
			return state.toolsDone >= state.toolsStarted
				? `${tool.name} finished`
				: `Running ${tool.name}`;
		}
		case "result":
			return "Local patch ready for review";
		case "done":
			return "Demonstration complete";
	}
}

export function demoDelay(state: DemoState): number {
	switch (state.phase) {
		case "prompt":
			return 14;
		case "select":
			return 420;
		case "load":
			return 56;
		case "stream":
			return 14;
		case "tool":
			return state.toolsDone < state.toolsStarted ? 720 : 280;
		case "result":
			return 360;
		case "done":
			return 0;
	}
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
	switch (action.type) {
		case "pause":
			return { ...state, playing: false };
		case "play":
			if (state.phase === "done") return { ...initialDemoState, playing: true };
			return { ...state, playing: true };
		case "replay":
			return { ...initialDemoState, playing: true };
		case "finish":
			return finishedDemoState;
		case "advance":
			return advanceDemo(state);
	}
}

function advanceDemo(state: DemoState): DemoState {
	switch (state.phase) {
		case "prompt": {
			if (state.promptChars < DEMO_PROMPT.length) {
				return { ...state, promptChars: state.promptChars + 1 };
			}
			return { ...state, phase: "select" };
		}
		case "select":
			return { ...state, modelSelected: true, phase: "load" };
		case "load": {
			const load = Math.min(100, state.load + 10);
			const t = load / 100;
			return {
				...state,
				load,
				cpu: Math.round(8 + t * 14),
				gpu: Math.round(t * 41),
				ram: Number((4.2 + t * 14.4).toFixed(1)),
				phase: load === 100 ? "stream" : "load",
			};
		}
		case "stream": {
			const streamChars = Math.min(DEMO_STREAM.length, state.streamChars + 4);
			const t = streamChars / DEMO_STREAM.length;
			return {
				...state,
				streamChars,
				cpu: Math.round(22 + t * 9),
				gpu: Math.round(41 + t * 27),
				ram: Number((18.6 + t * 2.5).toFixed(1)),
				phase: streamChars === DEMO_STREAM.length ? "tool" : "stream",
			};
		}
		case "tool": {
			if (state.toolsStarted === state.toolsDone) {
				if (state.toolsDone === DEMO_TOOLS.length) {
					return { ...state, phase: "result", reviewReady: true };
				}
				return {
					...state,
					toolsStarted: state.toolsStarted + 1,
					cpu: 28,
					gpu: 64,
					ram: 21.4,
				};
			}
			const toolsDone = state.toolsDone + 1;
			return {
				...state,
				toolsDone,
				reviewReady: toolsDone === DEMO_TOOLS.length,
				phase: toolsDone === DEMO_TOOLS.length ? "result" : "tool",
			};
		}
		case "result":
			return {
				...state,
				resultVisible: true,
				reviewReady: true,
				cpu: 14,
				gpu: 12,
				ram: 19.8,
				phase: "done",
				playing: false,
			};
		case "done":
			return { ...state, playing: false };
	}
}
