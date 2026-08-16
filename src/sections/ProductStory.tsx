import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import {
	LazyMotion,
	domAnimation,
	m,
	useReducedMotion,
} from "motion/react";
import { responsiveSrcSet, storySizes } from "../images";

const features = [
	{
		title: "Control",
		slug: "control",
		description:
			"Local and remote controllers, live status, launch state, logs, and metrics.",
		image: "/images/usage-proxy.png",
		alt: "Local Studio usage screen showing proxied tokens, requests, sessions, active days, and token activity.",
	},
	{
		title: "Serve",
		slug: "serve",
		description: (
			<>
				<span translate="no">vLLM</span>, <span translate="no">SGLang</span>,{" "}
				<span translate="no">MLX</span>, and <span translate="no">llama.cpp</span>{" "}
				behind one OpenAI-compatible surface.
			</>
		),
		image: "/images/configure-models.png",
		alt: "Local Studio model configuration screen showing searchable Hugging Face models, hardware fit, and downloads.",
	},
	{
		title: "Work",
		slug: "work",
		description:
			"Models, providers, browser, files, terminal, and agents in the same session.",
		image: "/images/workbench-terminal.png",
		alt: "Local Studio workbench with agent reasoning, terminal output, repository changes, and tool activity.",
	},
] as const;

function featureIndexFromHash(hash: string) {
	const slug = /^#media=([a-z-]+)$/.exec(hash)?.[1];
	const index = features.findIndex((feature) => feature.slug === slug);
	return index === -1 ? 0 : index;
}

export function ProductStory() {
	const [activeIndex, setActiveIndex] = useState(() =>
		featureIndexFromHash(window.location.hash),
	);
	const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
	const reduceMotion = useReducedMotion();
	const activeFeature = features[activeIndex];

	useEffect(() => {
		function syncFromHash() {
			setActiveIndex(featureIndexFromHash(window.location.hash));
		}
		window.addEventListener("hashchange", syncFromHash);
		return () => window.removeEventListener("hashchange", syncFromHash);
	}, []);

	function selectFeature(index: number) {
		setActiveIndex(index);
		const hash = `#media=${features[index].slug}`;
		if (window.location.hash !== hash) {
			window.history.replaceState({}, "", hash);
		}
	}

	function handleKeyDown(
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) {
		let nextIndex: number | undefined;
		if (event.key === "ArrowDown" || event.key === "ArrowRight") {
			nextIndex = (index + 1) % features.length;
		} else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
			nextIndex = (index - 1 + features.length) % features.length;
		} else if (event.key === "Home") {
			nextIndex = 0;
		} else if (event.key === "End") {
			nextIndex = features.length - 1;
		}
		if (nextIndex === undefined) return;
		event.preventDefault();
		selectFeature(nextIndex);
		buttonsRef.current[nextIndex]?.focus();
	}

	return (
		<LazyMotion features={domAnimation} strict>
			<section
				id="media"
				className="story section-width"
				aria-labelledby="system-title"
			>
				<div className="story__intro">
					<h2 id="system-title">Local AI is hard, this will make it easier.</h2>
					<p>
						<span translate="no">Local Studio</span> keeps the model, the
						runtime, and the hardware together. Nothing important disappears
						behind a provider abstraction.
					</p>
				</div>
				<div className="story__showcase">
					<ul
						className="story__options"
						role="tablist"
						aria-label="Local Studio capabilities"
					>
						{features.map((feature, index) => {
							const selected = activeIndex === index;
							const descriptionId = `feature-description-${index + 1}`;
							const tabId = `feature-tab-${index + 1}`;
							return (
								<li
									className={selected ? "is-active" : undefined}
									key={feature.title}
									role="none"
								>
									<button
										ref={(button) => {
											buttonsRef.current[index] = button;
										}}
										type="button"
										role="tab"
										id={tabId}
										aria-selected={selected}
										onClick={() => selectFeature(index)}
												onPointerEnter={(event) => {
													if (event.pointerType === "mouse") {
														selectFeature(index);
													}
												}}
										onKeyDown={(event) => handleKeyDown(event, index)}
									>
										<span className="story__option-title">{feature.title}</span>
									</button>
									<div
										id={descriptionId}
										role="tabpanel"
										aria-labelledby={tabId}
										hidden={!selected}
									>
										<p className="story__description">{feature.description}</p>
									</div>
								</li>
							);
						})}
					</ul>
					<figure
						className="story__visual"
						data-active-feature={activeFeature.title}
					>
					<m.img
						key={activeFeature.image}
						srcSet={responsiveSrcSet(activeFeature.image)}
						sizes={storySizes}
						src={activeFeature.image}
						alt={activeFeature.alt}
						width="5118"
						height="2800"
						loading="lazy"
						decoding="async"
						initial={reduceMotion ? false : { opacity: 0, filter: "blur(8px)" }}
						animate={{ opacity: 1, filter: "blur(0px)" }}
						transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
					/>
						<p className="sr-only" role="status">
							{activeFeature.title}. {activeFeature.description}
						</p>
					</figure>
				</div>
			</section>
		</LazyMotion>
	);
}
