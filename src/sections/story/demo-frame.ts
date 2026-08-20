import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export const DEMO_WIDTH = 1392;
export const DEMO_HEIGHT = 787;
export const DEMO_MOBILE = 900;

export type DemoCrop = {
	fit: number;
	shiftX?: number;
	shiftY?: number;
	cropH?: number;
};

export const STORY_CROP: DemoCrop = {
	fit: 580,
	shiftX: -224,
	shiftY: 0,
	cropH: 580,
};

export function mobileStoryQuery(): string {
	return `(max-width: ${DEMO_MOBILE}px)`;
}

export function useStoryMobile(): boolean {
	const [mobile, setMobile] = useState(
		() =>
			typeof window !== "undefined" &&
			window.matchMedia(mobileStoryQuery()).matches,
	);

	useLayoutEffect(() => {
		const query = window.matchMedia(mobileStoryQuery());
		const update = () => setMobile(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return mobile;
}

export function useDemoFrame(crop: DemoCrop): {
	hostRef: RefObject<HTMLElement | null>;
	mobile: boolean;
	scale: number;
	shiftX: number;
	shiftY: number;
	cropH: number;
} {
	const hostRef = useRef<HTMLElement>(null);
	const [frame, setFrame] = useState(() => resolveFrame(false, 1, crop));
	const fit = crop.fit;
	const shiftX = crop.shiftX;
	const shiftY = crop.shiftY;
	const cropH = crop.cropH;

	useLayoutEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const update = () => {
			const mobile = window.matchMedia(mobileStoryQuery()).matches;
			setFrame(resolveFrame(mobile, host.clientWidth, { fit, shiftX, shiftY, cropH }));
		};
		update();
		const query = window.matchMedia(mobileStoryQuery());
		query.addEventListener("change", update);
		const observer = new ResizeObserver(update);
		observer.observe(host);
		return () => {
			query.removeEventListener("change", update);
			observer.disconnect();
		};
	}, [fit, shiftX, shiftY, cropH]);

	return { hostRef, ...frame };
}

function resolveFrame(mobile: boolean, hostWidth: number, crop: DemoCrop) {
	const fit = crop.fit;
	return {
		mobile,
		scale: hostWidth > 0 ? hostWidth / fit : 1,
		shiftX: crop.shiftX ?? 0,
		shiftY: crop.shiftY ?? 0,
		cropH: crop.cropH ?? fit,
	};
}
