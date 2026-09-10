import { useEffect, useLayoutEffect, useRef, type Dispatch } from "react";
import { demoDelay, type DemoAction, type DemoClock, type DemoState } from "../scenario/sequence";
import type { HeroTaskId } from "./projects-nav";
export function useDemoPlayback(
	active: boolean,
	clock: Readonly<DemoClock>,
	weekendTask: boolean,
	reduceMotion: boolean,
	state: Readonly<DemoState>,
	dispatch: Dispatch<DemoAction>,
) {
	useEffect((): void | (() => void) => {
		if (reduceMotion) {
			if (state.phase !== "done") dispatch({ type: "finish" });
		} else if (active && weekendTask && state.playing && state.phase !== "done") {
			const id = clock.timeout(() => {
				dispatch({ type: "advance" });
			}, demoDelay(state));
			return () => {
				clock.clear(id);
			};
		}
	}, [active, clock, weekendTask, reduceMotion, state, dispatch]);
}
export function useThreadScroll(
	active: boolean,
	activeTask: HeroTaskId,
	output: string,
	reduceMotion: boolean,
	running: boolean,
	state: Readonly<DemoState>,
	submitted: boolean,
	toolCount: number,
	extraCount: number,
) {
	const scrollerRef = useRef<HTMLDivElement>(null);
	useLayoutEffect((): void => {
		const scroller = scrollerRef.current;
		if (!active || !scroller || !submitted) return;
		if (state.resultVisible && extraCount === 0) {
			const toolCalls = scroller.querySelectorAll<HTMLElement>("[data-tool-call]");
			const anchor = toolCalls[Math.max(0, toolCalls.length - 2)];
			if (anchor !== undefined) {
				scroller.scrollTo({ top: Math.max(0, anchor.offsetTop - 12) });
				return;
			}
		}
		const followLive = state.phase === "stream" || state.phase === "tool";
		scroller.scrollTo({
			top: scroller.scrollHeight,
			behavior: reduceMotion || followLive ? "auto" : "smooth",
		});
	}, [
		active,
		activeTask,
		output,
		reduceMotion,
		running,
		state.phase,
		state.resultVisible,
		state.toolsDone,
		submitted,
		toolCount,
		extraCount,
	]);
	return scrollerRef;
}
