import { expect, test } from "@playwright/test";
import {
	DEMO_PROMPT,
	DEMO_TOOLS,
	browserDemoClock,
	immediateDemoClock,
	demoReducer,
	finishedDemoState,
	initialDemoState,
} from "../../packages/demo-ui/src/scenario/sequence";

test("finish jumps to the terminal demonstration state", () => {
	expect(demoReducer(initialDemoState, { type: "finish" })).toEqual(
		finishedDemoState,
	);
	expect(finishedDemoState.playing).toBe(false);
	expect(finishedDemoState.phase).toBe("done");
	expect(finishedDemoState.resultVisible).toBe(true);
});

test("advance walks prompt, load, tools, and result without a clock", () => {
	let state = initialDemoState;
	let steps = 0;
	while (state.phase !== "done" && steps < 400) {
		state = demoReducer(state, { type: "advance" });
		steps += 1;
	}
	expect(state.phase).toBe("done");
	expect(state.promptChars).toBe(DEMO_PROMPT.length);
	expect(state.toolsDone).toBe(DEMO_TOOLS.length);
	expect(state.resultVisible).toBe(true);
	expect(state.playing).toBe(false);
});

test("pause and replay are pure", () => {
	const paused = demoReducer(initialDemoState, { type: "pause" });
	expect(paused.playing).toBe(false);
	expect(paused.phase).toBe(initialDemoState.phase);
	const replayed = demoReducer(finishedDemoState, { type: "replay" });
	expect(replayed).toEqual({ ...initialDemoState, playing: true });
});

test("browser demo clock can schedule and clear a timer", () => {
	let fired = false;
	const id = browserDemoClock.timeout(() => {
		fired = true;
	}, 0);
	browserDemoClock.clear(id);
	expect(fired).toBe(false);
	expect(browserDemoClock.now() > 0).toBe(true);
});

test("immediate demo clock ignores delay", () => {
	let fired = false;
	const id = immediateDemoClock.timeout(() => {
		fired = true;
	}, 10_000);
	immediateDemoClock.clear(id);
	expect(fired).toBe(false);
});
