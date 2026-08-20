import {
	type KeyboardEvent,
	lazy,
	Suspense,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { productFeatures } from "../content/product-features";
import type { FeatureScene } from "./story/FeatureDemo";
import { useStoryMobile } from "./story/demo-frame";

const FeatureDemo = lazy(() => import("./story/FeatureDemo"));

function optionControls(root: HTMLElement): HTMLElement[] {
	const controls: HTMLElement[] = [];
	for (const element of root.querySelectorAll('.story__option[role="radio"]')) {
		if (element instanceof HTMLElement) controls.push(element);
	}
	return controls;
}

const STORY_MS = 8000;
const DEMO_PLACEHOLDER = <div className="demo story__demo-placeholder" aria-hidden="true" />;

export function ProductStory() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [demoReady, setDemoReady] = useState(false);
	const [paused, setPaused] = useState(false);
	const optionsRef = useRef<HTMLDivElement>(null);
	const visualHomeRef = useRef<HTMLDivElement>(null);
	const visualRef = useRef<HTMLElement>(null);
	const demoSlots = useRef<Array<HTMLDivElement | null>>([]);
	const reduceMotion = useReducedMotion();
	const mobile = useStoryMobile();
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
		const controls = optionsRef.current ? optionControls(optionsRef.current) : [];
		controls[nextIndex]?.focus();
	}

	useEffect(() => {
		if (!optionsRef.current?.contains(document.activeElement)) return;
		optionControls(optionsRef.current)[activeIndex]?.focus();
	}, [activeIndex]);

	useEffect(() => {
		const visual = visualRef.current;
		if (!visual) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries[0]?.isIntersecting) return;
				setDemoReady(true);
				observer.disconnect();
			},
			{ rootMargin: "400px 0px" },
		);
		observer.observe(visual);
		return () => observer.disconnect();
	}, []);

	useLayoutEffect(() => {
		const visual = visualRef.current;
		const home = visualHomeRef.current;
		if (!visual || !home) return;
		const slot = mobile ? demoSlots.current[activeIndex] : null;
		(slot ?? home).appendChild(visual);
	}, [activeIndex, mobile]);

	return (
		<LazyMotion features={domAnimation} strict>
			<section id="media" className="story section-width" aria-labelledby="system-title">
				<div className="story__intro">
					<h2 id="system-title">Local AI is hard. Running it shouldn’t be.</h2>
					<p>
						<span translate="no">Local Studio</span> keeps the model, the runtime, and the hardware
						together. Nothing important disappears behind a provider abstraction.
					</p>
				</div>
				<div className="story__showcase">
					<div
						className="story__options"
						ref={optionsRef}
						role="radiogroup"
						aria-label="Local Studio capabilities"
						onPointerEnter={mobile ? undefined : () => setPaused(true)}
						onPointerLeave={mobile ? undefined : () => setPaused(false)}
					>
						{productFeatures.map((feature, index) => {
							const selected = activeIndex === index;
							return (
								<div
									className={`story__option ${selected ? "is-active" : ""}`}
									key={feature.storyTitle}
									role="radio"
									aria-label={feature.storyTitle}
									aria-checked={selected}
									tabIndex={0}
									onPointerEnter={mobile ? undefined : () => selectFeature(index)}
									onClick={() => selectFeature(index)}
									onFocus={() => selectFeature(index)}
									onKeyDown={handleKeyDown}
								>
									<div className="story__option-control">
										<span className="story__option-title">{feature.storyTitle}</span>
									</div>
									<div hidden={!selected}>
										<p className="story__description">{feature.storyDescription}</p>
									</div>
									{selected && demoReady && !reduceMotion ? (
										<span
											className="story__timer"
											aria-hidden="true"
											style={{
												animationDuration: `${STORY_MS}ms`,
												animationPlayState: paused ? "paused" : "running",
											}}
											onAnimationEnd={() =>
												selectFeature((activeIndex + 1) % productFeatures.length)
											}
										/>
									) : null}
									<div
										className="story__option-demo"
										ref={(node) => {
											demoSlots.current[index] = node;
										}}
									/>
								</div>
							);
						})}
					</div>
					<div className="story__visual-home" ref={visualHomeRef}>
						<figure
							className="story__visual"
							ref={visualRef}
							data-active-feature={activeFeature.storyTitle}
						>
							{demoReady ? (
								<Suspense fallback={DEMO_PLACEHOLDER}>
									<m.div
										key={activeFeature.slug}
										initial={reduceMotion ? false : { opacity: 0, filter: "blur(8px)" }}
										animate={{ opacity: 1, filter: "blur(0px)" }}
										transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
									>
										<FeatureDemo scene={activeFeature.slug as FeatureScene} />
									</m.div>
								</Suspense>
							) : (
								DEMO_PLACEHOLDER
							)}
							<p className="sr-only" role="status">
								{activeFeature.storyTitle}. {activeFeature.storyDescription}
							</p>
						</figure>
					</div>
				</div>
			</section>
		</LazyMotion>
	);
}
