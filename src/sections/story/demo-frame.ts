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

export function useDemoFrame(
	crop: DemoCrop,
	mobileCrop: DemoCrop = crop,
): {
	hostRef: RefObject<HTMLElement | null>;
	mobile: boolean;
	scale: number;
	shiftX: number;
	shiftY: number;
	cropH: number;
} {
	const hostRef = useRef<HTMLElement>(null);
	const [frame, setFrame] = useState(() =>
		resolveFrame(false, 1, crop, mobileCrop),
	);

	useLayoutEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const update = () => {
			const mobile = window.matchMedia(mobileStoryQuery()).matches;
			setFrame(resolveFrame(mobile, host.clientWidth, crop, mobileCrop));
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
	}, [
		crop.fit,
		crop.shiftX,
		crop.shiftY,
		crop.cropH,
		mobileCrop.fit,
		mobileCrop.shiftX,
		mobileCrop.shiftY,
		mobileCrop.cropH,
	]);

	return { hostRef, ...frame };
}

function resolveFrame(
	mobile: boolean,
	hostWidth: number,
	crop: DemoCrop,
	mobileCrop: DemoCrop,
) {
	const used = mobile ? mobileCrop : crop;
	const fit = used.fit;
	return {
		mobile,
		scale: hostWidth > 0 ? hostWidth / fit : 1,
		shiftX: used.shiftX ?? 0,
		shiftY: used.shiftY ?? 0,
		cropH: used.cropH ?? fit,
	};
}
