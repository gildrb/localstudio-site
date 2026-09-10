import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useElementActive } from "../hooks/use-element-activity";
import { DEMO_WIDTH, DEMO_HEIGHT } from "./hero-data";
const DEMO_FIT = 950;
const DEMO_MOBILE = 900;
type Host = Readonly<RefObject<HTMLElement | null>>;

function useFrameSizing() {
	const hostRef = useRef<HTMLElement>(null);
	const [frame, setFrame] = useState({
		mobile: false,
		scale: 1,
		clipRight: false,
		clipBottom: false,
	});
	useLayoutEffect((): void | (() => void) => {
		const host = hostRef.current;
		if (host !== null) {
			const update = () => {
				const mobile = window.matchMedia(`(max-width: ${DEMO_MOBILE}px)`).matches;
				const scale = mobile ? host.clientWidth / DEMO_FIT : 1;
				const tokens = getComputedStyle(document.documentElement);
				const pageWidth = Number.parseFloat(tokens.getPropertyValue("--page-width"));
				const gutter = Number.parseFloat(tokens.getPropertyValue("--page-gutter"));
				const centered = Math.min(pageWidth, window.innerWidth - gutter);
				setFrame({
					mobile,
					scale,
					clipRight: centered < DEMO_WIDTH * scale - 1,
					clipBottom: host.clientHeight < DEMO_HEIGHT * scale - 1,
				});
			};
			update();
			const query = window.matchMedia(`(max-width: ${DEMO_MOBILE}px)`);
			query.addEventListener("change", update);
			const observer = new ResizeObserver(update);
			observer.observe(host);
			return () => {
				query.removeEventListener("change", update);
				observer.disconnect();
			};
		}
	}, []);
	return { hostRef, ...frame };
}
function useFrameVisibility(hostRef: Host) {
	const [renderContents, setRenderContents] = useState(true);
	useEffect((): void | (() => void) => {
		const host = hostRef.current;
		if (host !== null) {
			const observer = new IntersectionObserver(
				(entries: readonly Readonly<Pick<IntersectionObserverEntry, "isIntersecting">>[]) => {
					setRenderContents(entries[0]?.isIntersecting ?? false);
				},
				{ rootMargin: "300px 0px" },
			);
			observer.observe(host);
			return () => {
				observer.disconnect();
			};
		}
	}, [hostRef]);
	return renderContents;
}
function scrollPage(
	event: Readonly<
		Pick<
			WheelEvent,
			"ctrlKey" | "cancelable" | "preventDefault" | "deltaMode" | "deltaY" | "deltaX"
		>
	>,
) {
	if (event.ctrlKey || !event.cancelable) return;
	event.preventDefault();
	const unit =
		event.deltaMode === WheelEvent.DOM_DELTA_PAGE
			? window.innerHeight
			: event.deltaMode === WheelEvent.DOM_DELTA_LINE
				? 16
				: 1;
	window.scrollBy({ top: event.deltaY * unit, left: event.deltaX * unit, behavior: "instant" });
}
function usePageWheel(hostRef: Host) {
	useEffect((): void | (() => void) => {
		const host = hostRef.current;
		if (host !== null) {
			host.addEventListener("wheel", scrollPage, { passive: false });
			return () => {
				host.removeEventListener("wheel", scrollPage);
			};
		}
	}, [hostRef]);
}
export function useDemoFrame() {
	const frame = useFrameSizing();
	const active = useElementActive(frame.hostRef);
	const renderContents = useFrameVisibility(frame.hostRef);
	usePageWheel(frame.hostRef);
	return { ...frame, active, renderContents };
}
