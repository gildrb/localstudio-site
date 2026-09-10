import { useEffect, useState, type RefObject } from "react";

const MIN_VISIBLE_RATIO = 0.1;

export function useElementActive<T extends HTMLElement>(
	ref: Readonly<RefObject<T | null>>,
): boolean {
	const [active, setActive] = useState(false);

	useEffect(() => {
		const element = ref.current;
		let cleanup: (() => void) | undefined;
		if (element !== null) {
			let intersecting = false;

			const sync = () => {
				setActive(intersecting && !document.hidden);
			};
			const observer = new IntersectionObserver(
				([entry]: readonly Readonly<
					Pick<IntersectionObserverEntry, "isIntersecting" | "intersectionRatio">
				>[]) => {
					intersecting =
						entry?.isIntersecting === true && entry.intersectionRatio >= MIN_VISIBLE_RATIO;
					sync();
				},
				{ threshold: [0, MIN_VISIBLE_RATIO] },
			);

			observer.observe(element);
			document.addEventListener("visibilitychange", sync);
			cleanup = () => {
				observer.disconnect();
				document.removeEventListener("visibilitychange", sync);
			};
		}
		return cleanup;
	}, [ref]);

	return active;
}
