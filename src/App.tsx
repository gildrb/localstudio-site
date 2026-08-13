import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

import { FinalCallout } from "./sections/FinalCallout.tsx";
import { Hero } from "./sections/Hero.tsx";
import { KittyLitter } from "./sections/KittyLitter.tsx";
import { ProductStory } from "./sections/ProductStory.tsx";

export default function App() {
	return (
		<main className="site-shell">
			<Header />
			<Hero />
			<ProductStory />
			<KittyLitter />
			<FinalCallout />
			<Footer />
		</main>
	);
}
