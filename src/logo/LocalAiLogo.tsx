import { lazy, Suspense } from "react";

const Shader = lazy(() => import("./shader"));

export function LocalAiLogo() {
	return (
		<Suspense fallback={null}>
			<Shader />
		</Suspense>
	);
}
