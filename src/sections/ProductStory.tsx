import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { productFeatures } from "../content/product-features";
import { FeatureDemo, type FeatureScene } from "./story/FeatureDemo";



function optionControls(root: HTMLElement): HTMLElement[] {
	const controls: HTMLElement[] = [];
	for (const element of root.querySelectorAll(".story__option-control")) {
		if (element instanceof HTMLElement) controls.push(element);
	}
	return controls;
}

const STORY_MS = 8000;

export function ProductStory() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [progress, setProgress] = useState(0);
	const [paused, setPaused] = useState(false);
	const optionsRef = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	const activeFeature = productFeatures[activeIndex] ?? productFeatures[0];

	function selectFeature(index: number) {
		if (productFeatures[index] === undefined) return;
		setActiveIndex(index);
		setProgress(0);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		let nextIndex: number | undefined;
		if (event.key === "ArrowDown" || event.key === "ArrowRight") {
			nextIndex = (activeIndex + 1) % productFeatures.length;
		} else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
			nextIndex = (activeIndex - 1 + productFeatures.length) % productFeatures.length;
		} else if (event.key === "Home") {
			nextIndex = 0;
		} else if (event.key === "End") {
			nextIndex = productFeatures.length - 1;
		}
		if (nextIndex === undefined) return;
		event.preventDefault();
		selectFeature(nextIndex);
		const controls = optionsRef.current
			? optionControls(optionsRef.current)
			: [];
		controls[nextIndex]?.focus();
	}

	useEffect(() => {
		if (!optionsRef.current?.contains(document.activeElement)) return;
		optionControls(optionsRef.current)[activeIndex]?.focus();
	}, [activeIndex]);

	useEffect(() => {
		if (reduceMotion || paused) return;
		const started = Date.now();
		const id = window.setInterval(() => {
			const next = (Date.now() - started) / STORY_MS;
			if (next >= 1) {
				selectFeature((activeIndex + 1) % productFeatures.length);
				return;
			}
			setProgress(next);
		}, 50);
		return () => window.clearInterval(id);
	}, [activeIndex, paused, reduceMotion]);
	return (
		<LazyMotion features={domAnimation} strict>
			<section
				id="media"
				className="story section-width"
				aria-labelledby="system-title"
			>
				<div className="story__intro">
					<h2 id="system-title">Local AI is hard. Running it shouldn’t be.</h2>
					<p>
						<span translate="no">Local Studio</span> keeps the model, the
						runtime, and the hardware together. Nothing important disappears
						behind a provider abstraction.
					</p>
				</div>
				<div
					className="story__showcase"
					onPointerEnter={() => setPaused(true)}
					onPointerLeave={() => setPaused(false)}
				>
					<div
						className="story__options"
						ref={optionsRef}
						role="radiogroup"
						aria-label="Local Studio capabilities"
						onKeyDown={handleKeyDown}
					>
						{productFeatures.map((feature, index) => {
							const selected = activeIndex === index;
							return (
								<div
									className={`story__option ${selected ? "is-active" : ""}`}
									key={feature.storyTitle}
									style={
										selected
											? ({ "--story-progress": String(progress) } as CSSProperties)
											: undefined
									}
								>
									<div
										className="story__option-control"
										role="radio"
										aria-checked={selected}
										tabIndex={0}
										onPointerEnter={() => selectFeature(index)}
										onFocus={() => selectFeature(index)}
									>
										<span className="story__option-title">{feature.storyTitle}</span>
									</div>
									<div hidden={!selected}>
										<p className="story__description">{feature.storyDescription}</p>
									</div>
									{selected ? <span className="story__timer" aria-hidden="true" /> : null}
								</div>
							);
						})}
					</div>
					<figure
						className="story__visual"
						data-active-feature={activeFeature.storyTitle}
					>
						<m.div
							key={activeFeature.slug}
							initial={
								reduceMotion ? false : { opacity: 0, filter: "blur(8px)" }
							}
							animate={{ opacity: 1, filter: "blur(0px)" }}
							transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
						>
							<FeatureDemo scene={activeFeature.slug as FeatureScene} />
						</m.div>
						<p className="sr-only" role="status">
							{activeFeature.storyTitle}. {activeFeature.storyDescription}
						</p>
					</figure>
				</div>
			</section>
		</LazyMotion>
	);
}
