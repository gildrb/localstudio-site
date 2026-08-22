import { PageShell } from "../components/PageShell";
import { FinalCallout } from "../sections/FinalCallout";
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
			<FinalCallout />
		</PageShell>
	);
}
