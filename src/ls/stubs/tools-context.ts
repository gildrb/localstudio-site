import type { ComputerTab } from "@/features/agent/tools/types";

const browser = {
	enabled: false,
	backend: "embedded" as const,
	url: "",
	input: "",
};

const computer = {
	open: true,
	tab: "status" as ComputerTab,
	tabs: ["status"] as ComputerTab[],
	width: 440,
};

const actions = {
	setBrowserEnabled() {},
	setBrowserBackend() {},
	toggleBrowserBackend() {},
	toggleBrowser() {},
	setBrowserUrl() {},
	setBrowserInput() {},
	setComputerOpen() {},
	toggleComputerOpen() {},
	setComputerTab() {},
	selectComputerTabWithoutOpening() {},
	closeComputerTab() {},
	setComputerWidth() {},
	setActiveComputerSession() {},
	requestFileOpen() {},
	requestContextAttach() {},
	setSelection() {},
	hydrateSelections() {},
};

export function useBrowserTools() {
	return browser;
}

export function useToolsActions() {
	return actions;
}

export function useTools() {
	return {
		...actions,
		browser,
		computer,
		fileOpenRequest: null,
		contextAttachRequest: null,
		skillCatalogue: [],
		promptTemplateCatalogue: [],
		selectionFor: () => ({ skills: [], promptTemplates: [] }),
	};
}
