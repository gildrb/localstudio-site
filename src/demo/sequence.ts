export const DEMO_PROMPT = "Summarize notes/standup.md and list open tasks.";

export const DEMO_MODEL = "Qwen3.8-27B";

export const DEMO_RUNTIME = "MLX";

export const DEMO_STREAM =
	"I'll read the standup notes on this machine, then extract open tasks.";

export const DEMO_TOOL = "read_file";

export const DEMO_TOOL_PATH = "notes/standup.md";

export const DEMO_RESULT = `Open tasks
- Ship the local proxy health check
- Keep Qwen3.8-27B warm on the studio Mac
- Do not upload the notes folder`;

export type DemoPhase =
	| "prompt"
	| "select"
	| "load"
	| "stream"
	| "tool"
	| "meters"
	| "result"
	| "done";

export interface DemoState {
	playing: boolean;
	phase: DemoPhase;
	promptChars: number;
	modelSelected: boolean;
	load: number;
	streamChars: number;
	toolStarted: boolean;
	toolDone: boolean;
	cpu: number;
	gpu: number;
	ram: number;
	resultVisible: boolean;
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
	toolStarted: false,
	toolDone: false,
	cpu: 8,
	gpu: 0,
	ram: 4.2,
	resultVisible: false,
};

export const finishedDemoState: DemoState = {
	playing: false,
	phase: "done",
	promptChars: DEMO_PROMPT.length,
	modelSelected: true,
	load: 100,
	streamChars: DEMO_STREAM.length,
	toolStarted: true,
	toolDone: true,
	cpu: 14,
	gpu: 12,
	ram: 19.8,
	resultVisible: true,
};

export function demoOutput(state: DemoState): string {
	const stream = DEMO_STREAM.slice(0, state.streamChars);
	if (!state.resultVisible) return stream;
	if (stream.length === 0) return DEMO_RESULT;
	return `${stream}\n\n${DEMO_RESULT}`;
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
		case "tool":
			return state.toolDone ? `${DEMO_TOOL} finished` : `Running ${DEMO_TOOL}`;
		case "meters":
			return "Updating CPU, GPU, and RAM";
		case "result":
			return "Private result ready";
		case "done":
			return "Demonstration complete";
	}
}

export function demoDelay(state: DemoState): number {
	switch (state.phase) {
		case "prompt":
			return 22;
		case "select":
			return 480;
		case "load":
			return 64;
		case "stream":
			return 16;
		case "tool":
			return state.toolStarted && !state.toolDone ? 640 : 360;
		case "meters":
			return 420;
		case "result":
			return 280;
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
			const streamChars = Math.min(DEMO_STREAM.length, state.streamChars + 3);
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
			if (!state.toolStarted) {
				return { ...state, toolStarted: true, cpu: 28, gpu: 64, ram: 21.4 };
			}
			if (!state.toolDone) {
				return { ...state, toolDone: true };
			}
			return { ...state, phase: "meters" };
		}
		case "meters":
			return {
				...state,
				cpu: 14,
				gpu: 12,
				ram: 19.8,
				phase: "result",
			};
		case "result":
			return {
				...state,
				resultVisible: true,
				phase: "done",
				playing: false,
			};
		case "done":
			return { ...state, playing: false };
	}
}
