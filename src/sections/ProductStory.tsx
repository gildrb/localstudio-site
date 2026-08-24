import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { LazyMotion, domMax, m, useReducedMotion } from "motion/react";
import { motion } from "../domain/motion";
import { productFeatures } from "../content/product";
import { renderInlineReact } from "../ui/prose";
import { site } from "../domain/site";
const FeatureDemo = lazy(() => import("@local-studio/demo-ui/story"));

const DEMO_PLACEHOLDER = <div className="story__demo-placeholder" aria-hidden="true" />;
const STORY_EASE = [0.16, 1, 0.3, 1] as const;
const STORY_DURATION = 0.45;
const storySteps = productFeatures.flatMap((feature, featureIndex) =>
	feature.demoScenes.map((scene) => ({ featureIndex, scene })),
);

function useStoryProgress() {
	const [activeStepIndex, setActiveStepIndex] = useState(0);
	const showcaseRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const showcase = showcaseRef.current;
		const sticky = showcase?.querySelector<HTMLElement>(".story__sticky");
		if (!showcase || !sticky) return;
		let updateFrame = 0;
		let measureFrame = 0;
		let showcaseTop = 0;
		let navHeight = 72;
		let scrollRange = 1;
		let disposed = false;

		const update = () => {
			updateFrame = 0;
			const traveled = Math.min(
				Math.max(window.scrollY + navHeight - showcaseTop, 0),
				scrollRange,
			);
			const scenePosition = (traveled / scrollRange) * storySteps.length;
			const nextIndex = Math.min(storySteps.length - 1, Math.floor(scenePosition));
			setActiveStepIndex((current) => (current === nextIndex ? current : nextIndex));
		};

		const measure = () => {
			measureFrame = 0;
			navHeight =
				Number.parseFloat(
					getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
				) || 72;
			const stageHeight = Math.max(1, sticky.offsetHeight);
			scrollRange = Math.max(1, showcase.offsetHeight - stageHeight);
			showcaseTop = window.scrollY + showcase.getBoundingClientRect().top;
			if (updateFrame !== 0) window.cancelAnimationFrame(updateFrame);
			update();
		};

		const scheduleUpdate = () => {
			if (updateFrame === 0) updateFrame = window.requestAnimationFrame(update);
		};
		const scheduleMeasure = () => {
			if (measureFrame === 0) measureFrame = window.requestAnimationFrame(measure);
		};

		const observer = new ResizeObserver(scheduleMeasure);
		observer.observe(showcase);
		observer.observe(sticky);
		scheduleMeasure();
		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		window.addEventListener("resize", scheduleMeasure);
		void document.fonts.ready.then(() => {
			if (!disposed) scheduleMeasure();
		});
		return () => {
			disposed = true;
			observer.disconnect();
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleMeasure);
			if (updateFrame !== 0) window.cancelAnimationFrame(updateFrame);
			if (measureFrame !== 0) window.cancelAnimationFrame(measureFrame);
		};
	}, []);

	return { activeStepIndex, showcaseRef };
}

export function ProductStory() {
	const { activeStepIndex, showcaseRef } = useStoryProgress();
	const [demoInRange, setDemoInRange] = useState(false);
	const visualRef = useRef<HTMLElement>(null);
	const reduceMotion = useReducedMotion();
	const activeStep = storySteps[activeStepIndex] ?? storySteps[0];
	const activeFeatureIndex = activeStep?.featureIndex ?? 0;
	const activeFeature = productFeatures[activeFeatureIndex] ?? productFeatures[0];
	const activeScene = activeStep?.scene ?? productFeatures[0].demoScenes[0];
	const optionsOffset = `${(0.5 - activeFeatureIndex) * (100 / productFeatures.length)}%`;

	useEffect(() => {
		const visual = visualRef.current;
		if (!visual) return;
		const observer = new IntersectionObserver(
			(entries) => setDemoInRange(entries.at(-1)?.isIntersecting ?? false),
			{ rootMargin: "500px 0px" },
		);
		observer.observe(visual);
		return () => observer.disconnect();
	}, []);

	return (
		<LazyMotion features={domMax} strict>
			<section id="media" className="story section-width" aria-labelledby="story-title">
				<header className="story__intro">
					<h2 id="story-title">Run it. Work in it. Own it.</h2>
					<p>
						From the model runtime to the agent session to the data and access around it, Local Studio keeps the whole system under your control.
					</p>
				</header>
				<div className="story__showcase" ref={showcaseRef}>
					<div className="story__sticky">
						<div className="story__options-window">
							<m.ol
								className="story__options"
								aria-label={`${site.products.localStudio.name} capabilities`}
								data-active-index={activeFeatureIndex}
								initial={false}
								animate={{ y: optionsOffset }}
								transition={{
									duration: reduceMotion ? 0 : STORY_DURATION,
									ease: STORY_EASE,
								}}
							>
								{productFeatures.map((feature, index) => {
									const selected = activeFeatureIndex === index;
									return (
										<li
											className={`story__option ${selected ? "is-active" : ""}`}
											key={feature.storyTitle}
											aria-current={selected ? "step" : undefined}
										>
											<div className="story__option-control">
												<m.h3
													className="story__option-title"
													initial={false}
													animate={{
														color: selected
															? "var(--foreground)"
															: "var(--quiet)",
													}}
													transition={{
														duration: reduceMotion ? 0 : 0.13,
														ease: "easeOut",
													}}
												>
													{feature.storyTitle}
												</m.h3>
											</div>
											<m.p
												className="story__description"
												aria-hidden={!selected}
												initial={
													reduceMotion
														? false
														: { opacity: 0, y: 6, filter: "blur(8px)" }
												}
												animate={{
													opacity: selected ? 1 : 0,
													y: selected ? 0 : 6,
													filter: selected ? "blur(0px)" : "blur(8px)",
												}}
												transition={{
													duration: reduceMotion ? 0 : STORY_DURATION,
													ease: STORY_EASE,
												}}
											>
												{renderInlineReact(feature.storyDescription)}
											</m.p>
										</li>
									);
								})}
							</m.ol>
						</div>
						<div className="story__visual-home">
							<figure
								className="story__visual"
								ref={visualRef}
								data-active-feature={activeFeature.storyTitle}
							>
									{demoInRange ? (
										<Suspense fallback={DEMO_PLACEHOLDER}>
											<m.div
												key={activeScene}
												initial={reduceMotion ? false : { opacity: 0, filter: "blur(8px)" }}
												animate={{ opacity: 1, filter: "blur(0px)" }}
												transition={motion.featureSwap}
											>
												<FeatureDemo scene={activeScene} repositoryUrl={site.products.localStudio.repository} />
											</m.div>
										</Suspense>
								) : (
									DEMO_PLACEHOLDER
								)}
								<p className="sr-only" role="status">
									{activeFeature.storyTitle}. {renderInlineReact(activeFeature.storyDescription)}
								</p>
							</figure>
						</div>
					</div>
					<div className="story__scroll-track" aria-hidden="true">
						{storySteps.map((step) => (
							<div className="story__scroll-step" key={`${step.featureIndex}-${step.scene}`} />
						))}
						<div className="story__scroll-step" />
					</div>
				</div>
			</section>
		</LazyMotion>
	);
}
