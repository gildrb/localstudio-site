import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { LazyMotion, domMax, m, useReducedMotion } from "motion/react";
import { motion } from "../domain/motion";
import { productFeatures } from "../content/product";
import { renderInlineReact } from "../ui/prose";
import { site } from "../domain/site";
const FeatureDemo = lazy(() => import("@local-studio/demo-ui/story"));

const DEMO_PLACEHOLDER = <div className="story__demo-placeholder" aria-hidden="true" />;

function useStoryProgress() {
	const [activeIndex, setActiveIndex] = useState(0);
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
			const scenePosition = (traveled / scrollRange) * productFeatures.length;
			const nextIndex = Math.min(productFeatures.length - 1, Math.floor(scenePosition));
			setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
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

	return { activeIndex, showcaseRef };
}

export function ProductStory() {
	const { activeIndex, showcaseRef } = useStoryProgress();
	const [demoInRange, setDemoInRange] = useState(false);
	const visualRef = useRef<HTMLElement>(null);
	const reduceMotion = useReducedMotion();
	const activeFeature = productFeatures[activeIndex] ?? productFeatures[0];
	const optionsOffset = `${(1 - activeIndex) * 20}%`;

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
			<section id="media" className="story section-width" aria-label={`${site.products.localStudio.name} product story`}>
				<div className="story__showcase" ref={showcaseRef}>
					<div className="story__sticky">
						<div className="story__options-window">
							<m.ol
								className="story__options"
								aria-label={`${site.products.localStudio.name} capabilities`}
								data-active-index={activeIndex}
								initial={false}
								animate={{ y: optionsOffset }}
								transition={{
									...motion.featureSwap,
									duration: reduceMotion ? 0 : motion.featureSwap.duration,
								}}
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
												<m.span
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
												</m.span>
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
													...motion.featureSwap,
													duration: reduceMotion ? 0 : motion.featureSwap.duration,
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
												key={activeFeature.slug}
												initial={reduceMotion ? false : { opacity: 0, filter: "blur(8px)" }}
												animate={{ opacity: 1, filter: "blur(0px)" }}
												transition={motion.featureSwap}
											>
												<FeatureDemo scene={activeFeature.demoScene} />
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
					<div
						className="story__scroll-track"
						style={{
							height: `calc(${productFeatures.length + 1} * clamp(300px, 42svh, 420px))`,
						}}
						aria-hidden="true"
					/>
				</div>
			</section>
		</LazyMotion>
	);
}
