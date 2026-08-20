import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { productFeatures } from "../content/product-features";

const FeatureDemo = lazy(() => import("./story/FeatureDemo"));

const DEMO_PLACEHOLDER = <div className="demo story__demo-placeholder" aria-hidden="true" />;

function useStoryProgress() {
	const [activeIndex, setActiveIndex] = useState(0);
	const showcaseRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const showcase = showcaseRef.current;
		const sticky = showcase?.querySelector<HTMLElement>(".story__sticky");
		if (!showcase || !sticky) return;
		let frame = 0;

		const update = () => {
			frame = 0;
			const navHeight =
				Number.parseFloat(
					getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
				) || 72;
			const stageHeight = Math.max(1, sticky.offsetHeight);
			const scrollRange = Math.max(1, showcase.offsetHeight - stageHeight);
			const traveled = Math.min(
				Math.max(navHeight - showcase.getBoundingClientRect().top, 0),
				scrollRange,
			);
			const scenePosition = (traveled / scrollRange) * productFeatures.length;
			const nextIndex = Math.min(productFeatures.length - 1, Math.floor(scenePosition));
			showcase.style.setProperty(
				"--story-progress",
				String(Math.min(1, scenePosition - nextIndex)),
			);
			setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
		};

		const scheduleUpdate = () => {
			if (frame === 0) frame = window.requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		window.addEventListener("resize", scheduleUpdate);
		return () => {
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleUpdate);
			if (frame !== 0) window.cancelAnimationFrame(frame);
		};
	}, []);

	return { activeIndex, showcaseRef };
}

export function ProductStory() {
	const { activeIndex, showcaseRef } = useStoryProgress();
	const [demoReady, setDemoReady] = useState(false);
	const visualRef = useRef<HTMLElement>(null);
	const reduceMotion = useReducedMotion();
	const activeFeature = productFeatures[activeIndex] ?? productFeatures[0];

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
				<div className="story__showcase" ref={showcaseRef}>
					<div className="story__sticky">
						<div className="story__options-window">
							<ol
								className="story__options"
								aria-label="Local Studio capabilities"
								data-active-index={activeIndex}
							>
							{productFeatures.map((feature, index) => {
								const selected = activeIndex === index;
								return (
									<li
										className={`story__option ${selected ? "is-active" : ""}`}
										key={feature.storyTitle}
										aria-current={selected ? "step" : undefined}
									>
										<div className="story__option-control">
											<span className="story__option-title">{feature.storyTitle}</span>
										</div>
										<div hidden={!selected}>
											<p className="story__description">{feature.storyDescription}</p>
										</div>
										{selected ? <span className="story__timer" aria-hidden="true" /> : null}
									</li>
								);
							})}
							</ol>
						</div>
						<div className="story__visual-home">
							<figure
								className="story__visual"
								ref={visualRef}
								data-active-feature={activeFeature.storyTitle}
							>
								{demoReady ? (
									<Suspense fallback={DEMO_PLACEHOLDER}>
										<m.div
											key={activeFeature.slug}
											initial={reduceMotion ? false : { opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
										>
											<FeatureDemo scene={activeFeature.slug} />
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
					<div className="story__scroll-track" aria-hidden="true">
						{productFeatures.map((feature) => (
							<div className="story__scroll-step" key={feature.slug} />
						))}
						<div className="story__scroll-step" />
					</div>
				</div>
			</section>
		</LazyMotion>
	);
}
