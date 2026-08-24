export const DEMO_MODEL = "Qwen3.8-27B";

export const DEMO_PROMPT =
	"Plan a relaxed Lake District weekend for Maya's birthday. Check our family calendar, the dinner confirmation, saved places, and Friday's forecast. Keep driving under two hours, make an itinerary, and set a Thursday packing reminder. Do not book or message anyone without asking me.";

export const DEMO_STREAM =
	"I'll bring the private details together, resolve the timing and travel constraints, then leave every booking and message for your approval.";

export const DEMO_RESULT = `Your Lake District weekend is laid out without booking or messaging anyone.

Friday
- Leave after school pickup and check in before dinner at 19:30

Saturday
- Easy morning at Rydal Water
- Ambleside lunch, then the saved Grasmere walk if the weather holds
- 1h 42m total driving

Sunday
- Brunch near Keswick and home by 17:00

Ready for you
- Trips/lake-district-weekend.md has the full plan and wet-weather fallback
- Thursday 18:30 packing reminder is on
- Boat hire and the group message still need your approval`;

export const DEMO_DIFF = `diff --git a/Trips/lake-district-weekend.md b/Trips/lake-district-weekend.md
new file mode 100644
--- /dev/null
+++ b/Trips/lake-district-weekend.md
@@ -0,0 +1,12 @@
+# Maya's birthday weekend
+
+## Friday
+- Check in before the 19:30 dinner reservation
+
+## Saturday
+- Rydal Water, Ambleside, then Grasmere if dry
+- Total driving: 1h 42m
+
+## Sunday
+- Keswick brunch and home by 17:00
+
+No bookings or messages sent without approval
`;

export type DemoToolArgs =
	| { readonly kind: "path"; readonly path: string; readonly range?: string }
	| { readonly kind: "query"; readonly query: string }
	| { readonly kind: "stops"; readonly stops: readonly string[] }
	| { readonly kind: "schedule"; readonly schedule: string; readonly name: string };

export type DemoToolSpec = {
	id: string;
	name: string;
	args: DemoToolArgs;
	resultText: string;
};

export const DEMO_TOOLS: readonly DemoToolSpec[] = [
	{
		id: "calendar",
		name: "read_calendar",
		args: { kind: "path", path: "Family/calendar.ics", range: "Fri-Sun" },
		resultText: `Friday
15:20 School pickup
19:30 Birthday dinner at The Old Stamp House

Sunday
17:00 Be home for Alex's call`,
	},
	{
		id: "reservation",
		name: "read_email",
		args: { kind: "path", path: "Family/dinner-confirmation.eml" },
		resultText: `The Old Stamp House
Friday · 19:30 · 6 guests
Reservation confirmed · no prepayment due`,
	},
	{
		id: "saved-places",
		name: "read_file",
		args: { kind: "path", path: "Family/saved-places.md" },
		resultText: `Rydal Water
Grasmere gingerbread
Lingholm Kitchen
Keswick market`,
	},
	{
		id: "forecast",
		name: "search_web",
		args: { kind: "query", query: "Lake District Friday to Sunday forecast" },
		resultText: `Friday: light rain, clearing 18:00
Saturday: dry morning, showers after 16:00
Sunday: clear, 12°C`,
	},
	{
		id: "route",
		name: "plan_route",
		args: { kind: "stops", stops: ["Rydal Water", "Ambleside", "Grasmere"] },
		resultText: `Optimized Saturday route
Total driving: 1h 42m
Walking options stay under 90 minutes`,
	},
	{
		id: "itinerary",
		name: "write_file",
		args: { kind: "path", path: "Trips/lake-district-weekend.md" },
		resultText: `Created Trips/lake-district-weekend.md
3-day itinerary
Wet-weather fallback included
No booking actions taken`,
	},
	{
		id: "packing",
		name: "create_automation",
		args: { kind: "schedule", schedule: "Thursday 18:30", name: "Lake District packing reminder"},
		resultText: `Automation created
Thursday at 18:30
Rechecks the forecast before building the packing list
Messaging disabled`,
	},
];

export type DemoPhase =
	| "select"
	| "prompt"
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
