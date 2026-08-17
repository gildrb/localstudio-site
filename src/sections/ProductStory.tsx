import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { productFeatures } from "../content/product-features";
import { responsiveSrcSet, storySizes } from "../images";



function optionControls(root: HTMLElement): HTMLElement[] {
	const controls: HTMLElement[] = [];
	for (const element of root.querySelectorAll(".story__option-control")) {
		if (element instanceof HTMLElement) controls.push(element);
	}
	return controls;
}

export function ProductStory() {
	const [activeIndex, setActiveIndex] = useState(0);
	const optionsRef = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	const activeFeature = productFeatures[activeIndex] ?? productFeatures[0];

	function selectFeature(index: number) {
		if (productFeatures[index] === undefined) return;
		setActiveIndex(index);
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
								</div>
							);
						})}
					</div>
					<figure
						className="story__visual"
						data-active-feature={activeFeature.storyTitle}
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
							initial={
								reduceMotion ? false : { opacity: 0, filter: "blur(8px)" }
							}
							animate={{ opacity: 1, filter: "blur(0px)" }}
							transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
						/>
						<p className="sr-only" role="status">
							{activeFeature.storyTitle}. {activeFeature.storyDescription}
						</p>
					</figure>
				</div>
			</section>
		</LazyMotion>
	);
}
