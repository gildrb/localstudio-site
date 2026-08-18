import { useCallback, useSyncExternalStore } from "react";

export const DEFAULT_SIDEBAR_WIDTH = 224;

let mobileNavOpen = false;
const listeners = new Set<() => void>();

function emit(): void {
	for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function getSnapshot(): boolean {
	return mobileNavOpen;
}

export function useMobileNavOpen(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useSetMobileNavOpen(): (open: boolean) => void {
	return useCallback((open: boolean) => {
		if (mobileNavOpen === open) return;
		mobileNavOpen = open;
		emit();
	}, []);
}

type AppStore = {
	desktopSidebarPinnedOpen: boolean;
	setDesktopSidebarPinnedOpen: (open: boolean) => void;
	sidebarWidth: number;
	setSidebarWidth: (width: number) => void;
	mobileNavOpen: boolean;
	setMobileNavOpen: (open: boolean) => void;
};

export function useAppStore<T>(selector: (state: AppStore) => T): T {
	const setMobileNavOpen = useSetMobileNavOpen();
	const navOpen = useMobileNavOpen();
	return selector({
		desktopSidebarPinnedOpen: true,
		setDesktopSidebarPinnedOpen() {},
		sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
		setSidebarWidth() {},
		mobileNavOpen: navOpen,
		setMobileNavOpen,
	});
}
