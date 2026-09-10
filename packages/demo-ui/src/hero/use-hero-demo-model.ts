import { useReducer, type Dispatch } from "react";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { useDemoTabBoundary } from "../hooks/demo-tab-boundary";
import {
	demoOutput,
	demoReducer,
	finishedDemoState,
	initialDemoState,
	type DemoClock,
	type DemoState,
	type DemoAction,
} from "../scenario/sequence";
import type { HeroTaskId } from "./projects-nav";
import { toolBlocksFor, demoGitSummary } from "./hero-data";
import { useDemoFrame } from "./use-demo-frame";
import { useComputerTabs } from "./use-computer-tabs";
import { useHeroTasks } from "./use-hero-tasks";
import { useDemoPlayback, useThreadScroll } from "./use-hero-playback";
export function useHeroDemoModel(clock: Readonly<DemoClock>) {
	const frame = useDemoFrame();
	useDemoTabBoundary(frame.hostRef);
	const reduceMotion = useReducedMotion();
	const [state, dispatch] = useReducer(
		demoReducer,
		reduceMotion ? finishedDemoState : initialDemoState,
	);
	const tasks = useHeroTasks(state, dispatch);
	const computer = useComputerTabs(state, tasks.activeTask);
	const output = demoOutput(state);
	const running =
		tasks.weekendTask && tasks.submitted && !state.resultVisible && state.phase !== "done";
	const tools = toolBlocksFor(state);
	useDemoPlayback(frame.active, clock, tasks.weekendTask, reduceMotion, state, dispatch);
	const scrollerRef = useThreadScroll(
		frame.active,
		tasks.activeTask,
		output,
		reduceMotion,
		running,
		state,
		tasks.submitted,
		tools.length,
		tasks.extras.length,
	);
	const { selectModel, selectTask } = heroActions(
		state,
		dispatch,
		tasks.setActiveTask,
		computer.setPickedTab,
		computer.setPanelOpen,
	);

	return {
		...frame,
		...tasks,
		...computer,
		state,
		scrollerRef,
		output,
		running,
		tools,
		selectModel,
		selectTask,
		gitSummary: demoGitSummary(state.reviewReady),
	};
}
export type HeroDemoViewModel = Readonly<ReturnType<typeof useHeroDemoModel>> & {
	readonly repositoryUrl: string;
};

function heroActions(
	state: Readonly<DemoState>,
	dispatch: Dispatch<DemoAction>,
	setActiveTask: ReturnType<typeof useHeroTasks>["setActiveTask"],
	setPickedTab: ReturnType<typeof useComputerTabs>["setPickedTab"],
	setPanelOpen: ReturnType<typeof useComputerTabs>["setPanelOpen"],
) {
	function selectModel(): void {
		if (state.phase === "select") dispatch({ type: "advance" });
	}
	function selectTask(task: HeroTaskId): void {
		setActiveTask(task);
		setPickedTab(task === "inbox" ? "status" : null);
		setPanelOpen(true);
		if (task === "inbox") {
			dispatch({ type: "pause" });
			return;
		}
		if (state.phase !== "done") dispatch({ type: "play" });
	}
	return { selectModel, selectTask };
}
