import { TextLink } from "../components/Links";

type KittyFeature = {
	readonly title: string;
	readonly text: string;
 readonly image: string;
 readonly image2x: string;
	readonly alt: string;
}

const features = [
	{
		title: "Sessions everywhere",
		text: "Pick up exactly where you left off. Sessions, threads, and context follow you across phone and desktop.",
  image: "/images/kittylitter-feature-sessions-660.webp",
  image2x: "/images/kittylitter-feature-sessions-1320.webp",
		alt: "KittyLitter session history on a studio server, with a live session card.",
	},
	{
		title: "Multi-agent",
		text: "Codex, Claude, OpenCode, Pi, and Droid, all in one app. Switch between them per session, or run several in parallel.",
  image: "/images/kittylitter-feature-multi-agent-660.webp",
  image2x: "/images/kittylitter-feature-multi-agent-1320.webp",
		alt: "KittyLitter conversation with a Codex model picker and an interactive widget.",
	},
	{
		title: "Alleycat",
		text: "Peer-to-peer pairing via QR code. Connect through NATs and corporate firewalls. No VPN, no public IP, no port forwarding.",
  image: "/images/kittylitter-feature-alleycat-660.webp",
  image2x: "/images/kittylitter-feature-alleycat-1320.webp",
		alt: "KittyLitter remote session running over a cat wallpaper.",
	},
] as const satisfies readonly KittyFeature[];

export function KittyLitter() {
	return (
		<section
			id="mobile"
			className="kitty section-width"
			aria-labelledby="kittylitter-title"
		>
			<div className="kitty__intro">
				<h2 id="kittylitter-title">Leave the desk. Keep the session.</h2>
				<div className="kitty__copy">
					<p>
						<span translate="no">KittyLitter</span> is a native iOS + Android
						client for <span translate="no">Codex</span>,{" "}
						<span translate="no">Claude</span>,{" "}
						<span translate="no">OpenCode</span>, <span translate="no">Pi</span>
						, and <span translate="no">Droid</span>. Connect from your local
						network, over SSH, or via <span translate="no">alleycat</span>,
						from anywhere.
					</p>
					<div className="kitty__actions">
						<TextLink href="/mobile">See how mobile works</TextLink>
					</div>
				</div>
			</div>
			<div className="kitty__grid">
				{features.map((feature) => (
					<article className="kitty__feature" key={feature.title}>
						<div className="kitty__feature-media">
							<img
        src={feature.image}
        srcSet={`${feature.image} 660w, ${feature.image2x} 1320w`}
        sizes="(max-width: 620px) calc(100vw - 48px), (max-width: 900px) 50vw, 33vw"
								alt={feature.alt}
								width="1320"
								height="1320"
        loading="lazy"
        decoding="async"
								draggable={false}
							/>
						</div>
						<h3>{feature.title}</h3>
						<p>{feature.text}</p>
					</article>
				))}
			</div>
		</section>
	);
}
