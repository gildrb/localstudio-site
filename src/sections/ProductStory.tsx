import * as stylex from "@stylexjs/stylex";
import { FeatureDemo } from "@local-studio/demo-ui/story";
import { LazyMotion, domAnimation, m } from "motion/react";
import { productFeatures } from "../content/product";
import { site } from "../domain/site";
import { motion } from "../domain/motion";
import { baseStyles } from "../styles/base-styles";
import { styles } from "../styles/sections-styles";
import { renderInlineReact } from "../ui/prose";
import { storySceneAnimation, storySceneStates } from "./product-story-motion";
import { useProductStoryMotion } from "./use-product-story-motion";

export function ProductStory() {
	const { activeIndex, mobile, optionsRef, reducedMotion, showcaseRef } = useProductStoryMotion(
		productFeatures.length,
	);
	const activeFeature = productFeatures[activeIndex] ?? productFeatures[0];
	const optionsOffset = `${(1 - activeIndex) * 20}%`;
	const sceneStates = storySceneStates(activeIndex, productFeatures.length);
	const transition = {
		...motion.featureSwap,
		duration: reducedMotion ? 0 : motion.featureSwap.duration,
	};

	return (
		<LazyMotion features={domAnimation} strict>
			<section
				id="media"
				{...stylex.props(
					baseStyles.element,
					baseStyles.sectionAnchor,
					styles.sectionWidth,
					styles.story,
				)}
				aria-label={`${site.products.localStudio.name} product story`}
			>
				<div {...stylex.props(baseStyles.element, styles.storyShowcase)} ref={showcaseRef}>
					<div {...stylex.props(baseStyles.element, styles.storySticky)} data-story-sticky="">
						<div {...stylex.props(baseStyles.element, styles.storyOptionsWindow)}>
							<ol
								{...stylex.props(
									baseStyles.list,
									baseStyles.element,
									styles.storyOptions,
									styles.storyOptionsOffset(optionsOffset),
								)}
								ref={optionsRef}
								aria-label={`${site.products.localStudio.name} capabilities`}
								data-active-index={activeIndex}
							>
								{sceneStates.map(({ index, selected }) => {
									const feature = productFeatures[index];
									if (!feature) return null;
									return (
										<m.li
											initial={false}
											animate={mobile === null ? false : {
												opacity: !mobile || selected ? 1 : 0,
												y: !mobile || selected || reducedMotion ? 0 : index < activeIndex ? -10 : 10,
											}}
											transition={transition}
											{...stylex.props(
												baseStyles.element,
												styles.storyOption,
												styles.storyOptionPosition(index < activeIndex ? "-10px" : "10px"),
												index === 0 && styles.storyFirstOption,
												selected && styles.storySelectedOption,
											)}
											key={feature.storyTitle}
											aria-current={selected ? "step" : undefined}
										>
											<div {...stylex.props(baseStyles.element, styles.storyOptionControl)}>
												<m.span
													initial={false}
													animate={{ opacity: selected ? 1 : 0.8 }}
													transition={transition}
													{...stylex.props(
														baseStyles.element,
														styles.storyOptionTitle,
														selected && styles.storySelectedOptionTitle,
													)}
												>
													{feature.storyTitle}
												</m.span>
											</div>
											<m.div
												initial={false}
												animate={{ opacity: selected ? 1 : 0, y: selected || reducedMotion ? 0 : 6 }}
												transition={transition}
												{...stylex.props(
													baseStyles.element,
													styles.storyDescriptionMotion,
													selected && styles.storySelectedDescription,
												)}
											>
												<p
													{...stylex.props(
														baseStyles.element,
														baseStyles.paragraph,
														styles.storyDescription,
													)}
												>
													{renderInlineReact(feature.storyDescription)}
												</p>
											</m.div>
										</m.li>
									);
								})}
							</ol>
						</div>
						<div {...stylex.props(baseStyles.element, styles.storyVisualHome)}>
							<figure
								{...stylex.props(baseStyles.element, styles.storyVisual)}
								data-active-feature={activeFeature.storyTitle}
							>
								{sceneStates.map(({ index, selected }) => {
									const feature = productFeatures[index];
									if (!feature) return null;
									return (
										<m.div
											{...storySceneAnimation(index, activeIndex, reducedMotion)}
											{...stylex.props(
												baseStyles.element,
												styles.storyDemoTransition,
												styles.storyLayerOffset(index < activeIndex ? "-12px" : "12px"),
												selected && styles.storySelectedDemo,
											)}
											key={feature.slug}
											data-story-scene={feature.slug}
											data-story-scene-index={index}
											aria-hidden={!selected}
											inert={!selected}
										>
											<FeatureDemo scene={feature.demoScene} />
										</m.div>
									);
								})}
							</figure>
						</div>
					</div>
					<div
						{...stylex.props(
							baseStyles.element,
							styles.storyScrollTrack(
								`calc(${productFeatures.length + 1} * clamp(300px, 42svh, 420px))`,
							),
						)}
						aria-hidden="true"
					/>
				</div>
			</section>
		</LazyMotion>
	);
}
