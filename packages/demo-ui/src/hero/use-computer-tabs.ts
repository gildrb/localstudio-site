import { useState } from "react";
import type { ComputerTab } from "./computer-header";
import type { HeroTaskId } from "./projects-nav";
import { demoActivePath, type DemoState } from "../scenario/sequence";
const COMPUTER_TAB_ORDER: readonly ComputerTab[] = [
	"status",
	"files",
	"diff",
	"tools",
	"browser",
	"terminal",
	"side-chat",
];
export function useComputerTabs(state: Readonly<DemoState>, activeTask: HeroTaskId) {
	const [pickedTab, setPickedTab] = useState<ComputerTab | null>(null);
	const [extraTabs, setExtraTabs] = useState<readonly ComputerTab[]>([]);
	const [panelOpen, setPanelOpen] = useState(true);
	const [userFile, setUserFile] = useState<string | null>(null);
	const weekendTask = activeTask === "weekend";
	const openFile = userFile ?? demoActivePath(state);
	const tab =
		pickedTab ??
		(state.reviewReady && weekendTask
			? "diff"
			: state.toolsStarted > 0 && weekendTask
				? "files"
				: "status");
	const openTabs: readonly ComputerTab[] = COMPUTER_TAB_ORDER.filter(
		(item) =>
			item === "status" ||
			(item === "files" && (state.toolsStarted > 0 || extraTabs.includes("files"))) ||
			(item === "diff" && (state.reviewReady || extraTabs.includes("diff"))) ||
			extraTabs.includes(item),
	);
	function selectTab(next: ComputerTab): void {
		setPanelOpen(true);
		setPickedTab(next);
		setExtraTabs((current) => (current.includes(next) ? current : [...current, next]));
	}
	function closeTab(closing: ComputerTab): void {
		if (closing === "status") return;
		setExtraTabs((current) => current.filter((item) => item !== closing));
		setPickedTab((current) => (current === closing ? "status" : current));
	}
	return {
		setPickedTab,
		panelOpen,
		setPanelOpen,
		setUserFile,
		openFile,
		tab,
		openTabs,
		selectTab,
		closeTab,
	};
}
