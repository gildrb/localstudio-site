import { DEMO_MODEL, DEMO_PROMPT, DEMO_STREAM, DEMO_RESULT, DEMO_TOOLS } from "./content";
export {
	DEMO_MODEL,
	DEMO_PROMPT,
	DEMO_STREAM,
	DEMO_RESULT,
	DEMO_DIFF,
	DEMO_TOOLS,
} from "./content";
export type { DemoToolArgs, DemoToolSpec } from "./content";

export type DemoPhase = "select" | "prompt" | "load" | "stream" | "tool" | "result" | "done";

export interface DemoState {
	readonly playing: boolean;
	readonly phase: DemoPhase;
	readonly promptChars: number;
	readonly modelSelected: boolean;
	readonly load: number;
	readonly streamChars: number;
	readonly toolsStarted: number;
	readonly toolsDone: number;
	readonly cpu: number;
	readonly gpu: number;
	readonly ram: number;
	readonly resultVisible: boolean;
	readonly reviewReady: boolean;
}

export type DemoAction =
	| { readonly type: "play" }
	| { readonly type: "pause" }
	| { readonly type: "replay" }
	| { readonly type: "finish" }
	| { readonly type: "advance" };

export const initialDemoState: DemoState = {
	playing: true,
	phase: "select",
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
	for (let index = state.toolsStarted - 1; index >= 0; index -= 1) {
		const args = DEMO_TOOLS[index]?.args;
		if (args?.kind === "path") return args.path;
	}
	return null;
}

export function demoStatus(state: DemoState): string {
	switch (state.phase) {
		case "prompt":
			return "Typing the local prompt";
		case "select":
			return `Selecting ${DEMO_MODEL}`;
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
			return "Weekend plan ready for review";
		case "done":
			return "Demonstration complete";
		default:
			throw new Error("Invalid demo phase");
	}
}

export function demoDelay(state: DemoState): number {
	switch (state.phase) {
		case "prompt":
			return 50;
		case "select":
			return 1400;
		case "load":
			return 80;
		case "stream":
			return 50;
		case "tool":
			return state.toolsDone < state.toolsStarted ? 1000 : 320;
		case "result":
			return 500;
		case "done":
			return 0;
		default:
			throw new Error("Invalid demo phase");
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
		default:
			throw new Error("Invalid demo action");
	}
}

function advanceLoad(state: DemoState): DemoState {
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

function advanceStream(state: DemoState): DemoState {
	const streamChars = Math.min(DEMO_STREAM.length, state.streamChars + 9);
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

function advanceTool(state: DemoState): DemoState {
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

function advanceDemo(state: DemoState): DemoState {
	switch (state.phase) {
		case "select":
			return { ...state, modelSelected: true, phase: "prompt" };
		case "prompt": {
			if (state.promptChars < DEMO_PROMPT.length) {
				return {
					...state,
					promptChars: Math.min(DEMO_PROMPT.length, state.promptChars + 6),
				};
			}
			return { ...state, phase: "load" };
		}
		case "load":
			return advanceLoad(state);
		case "stream":
			return advanceStream(state);
		case "tool":
			return advanceTool(state);
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
		default:
			throw new Error("Invalid demo phase");
	}
}

export type DemoTimer = ReturnType<typeof globalThis.setTimeout>;

export type DemoClock = {
	readonly now: () => number;
	readonly timeout: (callback: () => void, delay: number) => DemoTimer;
	readonly clear: (id: DemoTimer) => void;
};

export const browserDemoClock: DemoClock = {
	now: () => Date.now(),
	timeout: (callback, delay) => globalThis.setTimeout(callback, delay),
	clear: (id) => {
		globalThis.clearTimeout(id);
	},
};

export const immediateDemoClock: DemoClock = {
	now: () => Date.now(),
	timeout: (callback, delay) => {
		void delay;
		return globalThis.setTimeout(callback, 0);
	},
	clear: (id) => {
		globalThis.clearTimeout(id);
	},
};
