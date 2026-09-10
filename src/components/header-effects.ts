import {
	useEffect,
	type EffectCallback,
	type Dispatch,
	type RefObject,
	type SetStateAction,
} from "react";
import { closedNav, type MenuId, type NavSurface } from "../domain/nav";

type SetNav = Dispatch<SetStateAction<NavSurface>>;
type MenuRef = Readonly<
	RefObject<Readonly<Pick<HTMLElement, "contains" | "querySelector">> | null>
>;
type ToggleRef = Readonly<RefObject<Readonly<Pick<HTMLButtonElement, "focus">> | null>>;
type SheetRef = Readonly<
	RefObject<Readonly<Pick<HTMLDialogElement, "open" | "show" | "close">> | null>
>;

export function useDesktopDismissal(openMenu: MenuId | null, menusRef: MenuRef, setNav: SetNav) {
	useEffect((): ReturnType<EffectCallback> => {
		if (openMenu === null) return;
		function onPointerDown(event: { readonly target: Readonly<PointerEvent["target"]> }) {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (menusRef.current?.contains(target) !== true) setNav(closedNav);
		}
		function onKeyDown(event: Readonly<Pick<KeyboardEvent, "key">>) {
			if (event.key === "Escape") {
				const trigger = menusRef.current?.querySelector<HTMLButtonElement>(
					`[aria-controls="nav-menu-${openMenu}"]`,
				);
				setNav(closedNav);
				trigger?.focus();
			}
		}
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [openMenu, menusRef, setNav]);
}

export function useMobileViewport(setNav: SetNav, setSheetOpen: (open: boolean) => void) {
	useEffect((): ReturnType<EffectCallback> => {
		const media = window.matchMedia("(max-width: 900px)");
		function onChange() {
			if (media.matches) setNav(closedNav);
			if (!media.matches) setSheetOpen(false);
		}
		media.addEventListener("change", onChange);
		return () => {
			media.removeEventListener("change", onChange);
		};
	}, [setNav, setSheetOpen]);
}

export function useMobileIsolation(
	mobileOpen: boolean,
	toggleRef: ToggleRef,
	setSheetOpen: (open: boolean) => void,
) {
	useEffect((): ReturnType<EffectCallback> => {
		const main = document.querySelector("#content");
		const footer = document.querySelector("footer");
		main?.toggleAttribute("inert", mobileOpen);
		footer?.toggleAttribute("inert", mobileOpen);
		if (!mobileOpen) return;
		function onKeyDown(event: Readonly<Pick<KeyboardEvent, "key">>) {
			if (event.key === "Escape") {
				setSheetOpen(false);
				toggleRef.current?.focus();
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => {
			main?.removeAttribute("inert");
			footer?.removeAttribute("inert");
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [mobileOpen, toggleRef, setSheetOpen]);
}

export function useMobileDialog(mobileOpen: boolean, sheetRef: SheetRef) {
	useEffect((): ReturnType<EffectCallback> => {
		const sheet = sheetRef.current;
		if (!sheet) return;
		if (mobileOpen && !sheet.open) sheet.show();
		if (!mobileOpen && sheet.open) sheet.close();
	}, [mobileOpen, sheetRef]);
}
