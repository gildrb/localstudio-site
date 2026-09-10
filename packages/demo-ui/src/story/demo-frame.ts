import { useLayoutEffect, useRef, useState } from "react";

export const DEMO_WIDTH = 1168;
export const DEMO_HEIGHT = 787;
const DEMO_MOBILE = 900;

export type DemoCrop = {
	fit: number;
	mobileFit?: number | undefined;
	shiftX?: number | undefined;
	mobileShiftX?: number | undefined;
	shiftY?: number | undefined;
	mobileShiftY?: number | undefined;
	cropH?: number | undefined;
	mobileCropH?: number | undefined;
};

export const STORY_CROP: DemoCrop = {
	fit: 820,
	mobileFit: 680,
	cropH: DEMO_HEIGHT,
	mobileCropH: 580,
};

function mobileStoryQuery(): string {
	return `(max-width: ${DEMO_MOBILE}px)`;
}

export function useDemoFrame(crop: DemoCrop) {
	const hostRef = useRef<HTMLElement>(null);
	const [frame, setFrame] = useState(() => resolveFrame(false, 1, crop));
	const fit = crop.fit;
	const mobileFit = crop.mobileFit;
	const shiftX = crop.shiftX;
	const mobileShiftX = crop.mobileShiftX;
	const shiftY = crop.shiftY;
	const mobileShiftY = crop.mobileShiftY;
	const cropH = crop.cropH;
	const mobileCropH = crop.mobileCropH;

	useLayoutEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		let width = 0;
		const query = window.matchMedia(mobileStoryQuery());
		const update = () =>
			setFrame(
				resolveFrame(query.matches, width, {
					fit,
					mobileFit,
					shiftX,
					mobileShiftX,
					shiftY,
					mobileShiftY,
					cropH,
					mobileCropH,
				}),
			);
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
	}, [fit, mobileFit, shiftX, mobileShiftX, shiftY, mobileShiftY, cropH, mobileCropH]);

	return { hostRef, ...frame };
}

function resolveFrame(mobile: boolean, hostWidth: number, crop: DemoCrop) {
	const fit = mobile ? (crop.mobileFit ?? crop.fit) : crop.fit;
	return {
		mobile,
		scale: hostWidth > 0 ? hostWidth / fit : 1,
		shiftX: mobile ? (crop.mobileShiftX ?? crop.shiftX ?? 0) : (crop.shiftX ?? 0),
		shiftY: mobile ? (crop.mobileShiftY ?? crop.shiftY ?? 0) : (crop.shiftY ?? 0),
		cropH: mobile ? (crop.mobileCropH ?? crop.cropH ?? fit) : (crop.cropH ?? fit),
	};
}
