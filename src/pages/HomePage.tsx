import { PageCta } from "../components/PageCta";
import { PageShell } from "../components/PageShell";
import { Hero } from "../sections/Hero";
import { KittyLitter } from "../sections/KittyLitter";
import { ProductStory } from "../sections/ProductStory";
import { Sponsors } from "../sections/Sponsors";

export function HomePage() {
	return (
		<PageShell>
			<Hero />
			<Sponsors />
			<ProductStory />
			<KittyLitter />
			<PageCta id="download-title" variant="home" />
		</PageShell>
	);
}
