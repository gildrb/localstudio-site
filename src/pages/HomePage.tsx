import { PageCta } from "../components/PageCta";
import { PageShell } from "../components/PageShell";
import { Hero } from "../sections/Hero";
import { Sponsors } from "../sections/Sponsors";
import { ProductStory } from "../sections/ProductStory";
import { KittyLitter } from "../sections/KittyLitter";

// Eager sections: the prerender contains them inline, so first paint is final.
function HomeSections() {
	return (
		<>
			<Sponsors />
			<ProductStory />
			<KittyLitter />
			<PageCta id="download-title" variant="home" />
		</>
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
