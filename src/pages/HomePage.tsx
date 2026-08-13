import { LazyMotion, domAnimation } from "motion/react";
import { PageShell } from "../components/PageShell";
import { FinalCallout } from "../sections/FinalCallout";
import { Hero } from "../sections/Hero";
import { KittyLitter } from "../sections/KittyLitter";
import { ProductStory } from "../sections/ProductStory";

export function HomePage() {
	return (
		<PageShell>
			<LazyMotion features={domAnimation} strict>
				<Hero />
			</LazyMotion>
			<ProductStory />
			<KittyLitter />
			<FinalCallout />
		</PageShell>
	);
}
