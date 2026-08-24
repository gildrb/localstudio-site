import { assets } from "../domain/asset";
import { site } from "../domain/site";
import { useState } from "react";
import {
	AnimatePresence,
	LazyMotion,
	domAnimation,
	m,
	useReducedMotion,
} from "motion/react";
import { motion } from "../domain/motion";
import { LocalLink } from "../components/LocalLink";

type KittyFeature = {
	readonly title: string;
	readonly text: string;
	readonly image: string;
	readonly image2x: string;
	readonly alt: string;
};

const features = [
	{
		title: "Sessions everywhere",
		text: "Pick up exactly where you left off. Sessions, threads, and context follow you across phone and desktop.",
		image: assets.kittySessions,
		image2x: assets.kittySessions2x,
		alt: "KittyLitter session history on a studio server, with a live session card.",
	},
	{
		title: "Multi-agent",
		text: "Codex, Claude, OpenCode, Pi, and Droid, all in one app. Switch between them per session, or run several in parallel.",
		image: assets.kittyMultiAgent,
		image2x: assets.kittyMultiAgent2x,
		alt: "KittyLitter conversation with a Codex model picker and an interactive widget.",
	},
	{
		title: "Alleycat",
		text: "Peer-to-peer pairing via QR code. Connect through NATs and corporate firewalls. No VPN, no public IP, no port forwarding.",
		image: assets.kittyAlleycat,
		image2x: assets.kittyAlleycat2x,
		alt: "KittyLitter remote session running over a cat wallpaper.",
	},
] as const satisfies readonly KittyFeature[];

function FeatureIndexItem({
	feature,
	index,
	active,
	reducedMotion,
	onActivate,
}: {
	feature: KittyFeature;
	index: number;
	active: boolean;
	reducedMotion: boolean;
	onActivate: (index: number | null) => void;
}) {
	const show = () => onActivate(index);
	const hide = () => onActivate(null);
	return (
		<li className="kitty__index-item" onMouseEnter={show} onMouseLeave={hide}>
			<button
				type="button"
				className="kitty__index-trigger"
				aria-expanded={active}
				onFocus={show}
				onBlur={hide}
				onClick={() => onActivate(active ? null : index)}
			>
				{feature.title}
			</button>
			<AnimatePresence initial={false}>
				{active ? (
					<m.div
						className="kitty__index-description"
						initial={reducedMotion ? false : { height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={
							reducedMotion
								? { height: 0, opacity: 0, transition: { duration: 0 } }
								: { height: 0, opacity: 0 }
						}
						transition={motion.quickFade}
					>
						<p>{feature.text}</p>
					</m.div>
				) : null}
			</AnimatePresence>
		</li>
	);
}

export function KittyLitter() {
	const [active, setActive] = useState<number | null>(null);
	const reducedMotion = useReducedMotion();
	return (
		<LazyMotion features={domAnimation} strict>
			<section
				id="mobile"
				className="kitty section-width"
				aria-labelledby="kittylitter-title"
			>
				<div className="kitty__intro">
					<h2 id="kittylitter-title">
						Keep the session when you leave your desk
					</h2>
					<ul className="kitty__index">
						{features.map((feature, index) => (
							<FeatureIndexItem
								feature={feature}
								index={index}
								active={active === index}
								reducedMotion={reducedMotion ?? false}
								onActivate={setActive}
								key={feature.title}
							/>
						))}
					</ul>
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
						</article>
					))}
				</div>
				<div className="button-group kitty__actions">
					<LocalLink
						className="text-link"
						href={site.products.kittyLitter.url}
						target="_blank"
						rel="noreferrer"
					>
						Visit KittyLitter
					</LocalLink>
				</div>
			</section>
		</LazyMotion>
	);
}
