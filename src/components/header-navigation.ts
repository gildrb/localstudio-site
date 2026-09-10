import {
	useCallback,
	useId,
	useRef,
	useState,
	type Dispatch,
	type KeyboardEvent,
	type SetStateAction,
} from "react";
import {
	closedNav,
	desktopMenu,
	isMobileOpen,
	reduceNav,
	type MenuId,
	type NavSurface,
} from "../domain/nav";
import {
	useDesktopDismissal,
	useMobileViewport,
	useMobileIsolation,
	useMobileDialog,
} from "./header-effects";

type SetNav = Dispatch<SetStateAction<NavSurface>>;
export type MenuKeyEvent = Readonly<
	Pick<KeyboardEvent<HTMLButtonElement>, "key" | "preventDefault">
>;

function useDesktopControls(nav: NavSurface, setNav: SetNav) {
	const menusRef = useRef<HTMLElement>(null);
	function activate(menu: MenuId, detail: number) {
		setNav(
			detail === 0 && desktopMenu(nav) === menu
				? closedNav
				: reduceNav(nav, { type: "openDesktop", menu }),
		);
	}
	function enter(menu: MenuId) {
		setNav({ kind: "desktop", menu });
	}
	function keyDown(menu: MenuId, event: MenuKeyEvent) {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
		event.preventDefault();
		setNav({ kind: "desktop", menu });
		window.requestAnimationFrame(() => {
			const items = menusRef.current?.querySelectorAll<HTMLElement>(
				`#nav-menu-${menu} [role="menuitem"]`,
			);
			items?.[event.key === "ArrowDown" ? 0 : items.length - 1]?.focus();
		});
	}
	return { menusRef, controls: { activate, enter, keyDown } as const } as const;
}

function useDesktopNavigation(nav: NavSurface, setNav: SetNav) {
	const openMenu = desktopMenu(nav);
	const { menusRef, controls } = useDesktopControls(nav, setNav);
	const closeTimerRef = useRef<number | null>(null);
	function cancelMenuClose() {
		if (closeTimerRef.current === null) return;
		window.clearTimeout(closeTimerRef.current);
		closeTimerRef.current = null;
	}
	function close() {
		cancelMenuClose();
		setNav(closedNav);
	}
	function scheduleMenuClose() {
		if (openMenu === null) return;
		cancelMenuClose();
		closeTimerRef.current = window.setTimeout(() => {
			setNav(closedNav);
			closeTimerRef.current = null;
		}, 100);
	}
	useDesktopDismissal(openMenu, menusRef, setNav);
	return { openMenu, menusRef, cancelMenuClose, close, scheduleMenuClose, controls } as const;
}

function useMobileNavigation(nav: NavSurface, setNav: SetNav) {
	const mobileOpen = isMobileOpen(nav);
	const toggleRef = useRef<HTMLButtonElement>(null);
	const sheetRef = useRef<HTMLDialogElement>(null);
	const sheetId = useId();
	const setSheetOpen = useCallback(
		(open: boolean) => {
			for (const element of [document.documentElement, document.body]) {
				if (open) element.dataset["navOpen"] = "true";
				else delete element.dataset["navOpen"];
			}
			setNav((current) =>
				reduceNav(current, open ? { type: "openMobile" } : { type: "closeMobile" }),
			);
		},
		[setNav],
	);
	function closeMobile() {
		setSheetOpen(false);
	}
	useMobileViewport(setNav, setSheetOpen);
	useMobileIsolation(mobileOpen, toggleRef, setSheetOpen);
	useMobileDialog(mobileOpen, sheetRef);
	return { mobileOpen, toggleRef, sheetRef, sheetId, closeMobile, setSheetOpen } as const;
}

export function useHeaderNavigation() {
	const [nav, setNav] = useState<NavSurface>(closedNav);
	const desktop = useDesktopNavigation(nav, setNav);
	const mobile = useMobileNavigation(nav, setNav);
	return { desktop, mobile } as const;
}

export type DesktopControls = ReturnType<typeof useDesktopControls>["controls"];
export type HeaderNavigation = ReturnType<typeof useHeaderNavigation>;
