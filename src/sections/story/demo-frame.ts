import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export const DEMO_WIDTH = 1392;
export const DEMO_HEIGHT = 787;
export const DEMO_MOBILE = 900;

export function useDemoFrame(fit: number): {
	hostRef: RefObject<HTMLElement | null>;
	mobile: boolean;
	scale: number;
} {
	const hostRef = useRef<HTMLElement>(null);
	const [frame, setFrame] = useState({ mobile: false, scale: 1 });

	useLayoutEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const update = () => {
			const mobile = window.matchMedia(`(max-width: ${DEMO_MOBILE}px)`).matches;
			setFrame({
				mobile,
				scale: host.clientWidth / fit,
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
	}, [fit]);

	return { hostRef, mobile: frame.mobile, scale: frame.scale };
}
