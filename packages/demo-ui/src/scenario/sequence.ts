export const DEMO_MODEL = "Qwen3.8-27B";

export const DEMO_RUNTIME = "MLX";

export const DEMO_PROMPT =
	"Using the sample data on this Mac, plan Maya's birthday weekend. Read the family calendar, dinner email, and saved places. Look up the Lake District forecast without sending private details. Keep driving under two hours, save the itinerary locally, and add a Thursday 18:30 packing reminder to my phone. Do not book or message anyone.";

export const DEMO_STREAM =
	"I'll combine the calendar, email, and files on this Mac. For weather, I'll send only a public destination-and-date query. Then I'll save the plan locally and use the already-approved phone reminder action.";

export const DEMO_RESULT = `Done on this Mac. The calendar, email, and saved places stayed local. The weather lookup sent only “Lake District Friday to Sunday forecast.”

Friday
- Leave after school pickup and check in before dinner at 19:30

Saturday
- Easy morning at Rydal Water
- Ambleside lunch, then the saved Grasmere walk if the weather holds
- 1h 42m total driving

Sunday
- Brunch near Keswick and home by 17:00

Saved and synced
- Trips/lake-district-weekend.md was saved locally
- Thursday 18:30 packing reminder was added to the paired phone
- No booking or message was sent
- Boat hire and the group message still require approval`;

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
+Private inputs stayed on this Mac
+No booking or message sent
`;

type DemoToolArgs =
	| { path: string; range?: string }
	| { query: string; path?: never }
	| { stops: string[]; path?: never }
	| { device: string; schedule: string; name: string; path?: never };

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
		args: { path: "Family/calendar.ics", range: "Fri-Sun" },
		resultText: `Friday
15:20 School pickup
19:30 Birthday dinner at The Old Stamp House

Sunday
17:00 Be home for Alex's call`,
	},
	{
		id: "reservation",
		name: "read_email",
		args: { path: "Family/dinner-confirmation.eml" },
		resultText: `The Old Stamp House
Friday · 19:30 · 6 guests
Reservation confirmed · no prepayment due`,
	},
	{
		id: "saved-places",
		name: "read_file",
		args: { path: "Family/saved-places.md" },
		resultText: `Rydal Water
Grasmere gingerbread
Lingholm Kitchen
Keswick market`,
	},
	{
		id: "forecast",
		name: "search_web",
		args: { query: "Lake District Friday to Sunday forecast" },
		resultText: `Public query only · no private context sent
Friday: light rain, clearing 18:00
Saturday: dry morning, showers after 16:00
Sunday: clear, 12°C`,
	},
	{
		id: "route",
		name: "plan_route",
		args: { stops: ["Rydal Water", "Ambleside", "Grasmere"] },
		resultText: `Optimized Saturday route
Total driving: 1h 42m
Walking options stay under 90 minutes`,
	},
	{
		id: "itinerary",
		name: "write_file",
		args: { path: "Trips/lake-district-weekend.md" },
		resultText: `Created Trips/lake-district-weekend.md locally
3-day itinerary
Wet-weather fallback included
No booking actions taken`,
	},
	{
		id: "phone-reminder",
		name: "create_device_reminder",
		args: {
			device: "Paired phone",
			schedule: "Thursday 18:30",
			name: "Lake District packing reminder",
		},
		resultText: `Reminder added to paired phone
Thursday at 18:30
Direct device connection
No message sent`,
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
		const path = DEMO_TOOLS[index]?.args.path;
		if (path !== undefined) return path;
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
			return 18;
		case "select":
			return 700;
		case "load":
			return 45;
		case "stream":
			return 18;
		case "tool":
			return state.toolsDone < state.toolsStarted ? 450 : 130;
		case "result":
			return 300;
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
					promptChars: Math.min(DEMO_PROMPT.length, state.promptChars + 8),
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
			const streamChars = Math.min(DEMO_STREAM.length, state.streamChars + 10);
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
