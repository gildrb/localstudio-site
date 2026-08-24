import { lazy, Suspense } from "react";
import { PageShell } from "../components/PageShell";
import { Hero } from "../sections/Hero";

const PageCta = lazy(() =>
	import("../components/PageCta").then(({ PageCta }) => ({ default: PageCta })),
);
const KittyLitter = lazy(() =>
	import("../sections/KittyLitter").then(({ KittyLitter }) => ({ default: KittyLitter })),
);
const ProductStory = lazy(() =>
	import("../sections/ProductStory").then(({ ProductStory }) => ({ default: ProductStory })),
);
const Sponsors = lazy(() =>
	import("../sections/Sponsors").then(({ Sponsors }) => ({ default: Sponsors })),
);

export function HomePage() {
	return (
		<PageShell>
			<Hero />
			<Suspense fallback={null}>
				<Sponsors />
				<ProductStory />
				<KittyLitter />
				<PageCta id="download-title" variant="home" />
			</Suspense>
		</PageShell>
	);
}
