import { useEffect, useState, type RefObject } from "react";

const MIN_VISIBLE_RATIO = 0.1;

export function useElementActive<T extends HTMLElement>(
	ref: RefObject<T | null>,
): boolean {
	const [active, setActive] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		let intersecting = false;

		const sync = () => setActive(intersecting && !document.hidden);
		const observer = new IntersectionObserver(
			([entry]) => {
				intersecting = Boolean(
					entry?.isIntersecting && entry.intersectionRatio >= MIN_VISIBLE_RATIO,
				);
				sync();
			},
			{ threshold: [0, MIN_VISIBLE_RATIO] },
		);

		observer.observe(element);
		document.addEventListener("visibilitychange", sync);
		return () => {
			observer.disconnect();
			document.removeEventListener("visibilitychange", sync);
		};
	}, [ref]);

	return active;
}
