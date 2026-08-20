import { useLayoutEffect, useRef, useState } from "react";

export const DEMO_WIDTH = 1392;
export const DEMO_HEIGHT = 787;
const DEMO_MOBILE = 900;

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

function mobileStoryQuery(): string {
	return `(max-width: ${DEMO_MOBILE}px)`;
}

export function useDemoFrame(crop: DemoCrop) {
	const hostRef = useRef<HTMLElement>(null);
	const [frame, setFrame] = useState(() => resolveFrame(false, 1, crop));
	const fit = crop.fit;
	const shiftX = crop.shiftX;
	const shiftY = crop.shiftY;
	const cropH = crop.cropH;

	useLayoutEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		let width = 0;
		const query = window.matchMedia(mobileStoryQuery());
		const update = () =>
			setFrame(resolveFrame(query.matches, width, { fit, shiftX, shiftY, cropH }));
		const observer = new ResizeObserver(([entry]) => {
			width = entry?.contentRect.width ?? 0;
			update();
		});
		observer.observe(host);
		query.addEventListener("change", update);
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
