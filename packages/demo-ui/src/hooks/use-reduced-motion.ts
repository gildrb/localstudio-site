import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// The live OS preference; false during server rendering. Re-renders only when
// the OS setting changes.
export function useReducedMotion() {
	const [reduced, setReduced] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(REDUCED_MOTION_QUERY).matches;
	});
	useEffect(() => {
		const media = window.matchMedia(REDUCED_MOTION_QUERY);
		const onChange = () => setReduced(media.matches);
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);
	return reduced;
}
