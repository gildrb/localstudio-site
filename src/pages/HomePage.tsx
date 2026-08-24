import { lazy, Suspense, useEffect, useState } from "react";
import { PageCta } from "../components/PageCta";
import { PageShell } from "../components/PageShell";
import { Hero } from "../sections/Hero";

const KittyLitter = lazy(() =>
	import("../sections/KittyLitter").then(({ KittyLitter }) => ({ default: KittyLitter })),
);
const ProductStory = lazy(() =>
	import("../sections/ProductStory").then(({ ProductStory }) => ({ default: ProductStory })),
);
const Sponsors = lazy(() =>
	import("../sections/Sponsors").then(({ Sponsors }) => ({ default: Sponsors })),
);

function HomeSections() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(frame);
	}, []);
	if (!mounted) return null;
	return (
		<Suspense fallback={null}>
			<Sponsors />
			<ProductStory />
			<KittyLitter />
			<PageCta id="download-title" variant="home" />
		</Suspense>
	);
}

export function HomePage() {
	return (
		<PageShell>
			<Hero />
			<HomeSections />
		</PageShell>
	);
}
