import { useEffect, useRef, useState, type RefObject } from "react";

export function useElementActivity<T extends HTMLElement>(): readonly [
	RefObject<T | null>,
	boolean,
] {
	const ref = useRef<T>(null);
	const [active, setActive] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		let intersecting = false;

		const sync = () => setActive(intersecting && !document.hidden);
		const observer = new IntersectionObserver(([entry]) => {
			intersecting = entry?.isIntersecting ?? false;
			sync();
		});

		observer.observe(element);
		document.addEventListener("visibilitychange", sync);
		return () => {
			observer.disconnect();
			document.removeEventListener("visibilitychange", sync);
		};
	}, []);

	return [ref, active];
}
