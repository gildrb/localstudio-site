import { useEffect, useState } from "react";

const LIGHT_SCHEME_QUERY = "(prefers-color-scheme: light)";

// The live OS scheme; false during server rendering. Re-renders only when the
// OS scheme changes.
export function useLightScheme() {
	const [light, setLight] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(LIGHT_SCHEME_QUERY).matches;
	});
	useEffect(() => {
		const media = window.matchMedia(LIGHT_SCHEME_QUERY);
		const onChange = () => setLight(media.matches);
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);
	return light;
}
