import * as stylex from "@stylexjs/stylex";
import { FeatureDemo } from "@local-studio/demo-ui/story";
import { m } from "motion/react";
import { productFeatures } from "../content/product";
import { baseStyles } from "../styles/base-styles";
import { styles } from "../styles/sections-styles";
import { storySceneAnimation, storySceneStates } from "./product-story-motion";

export function StoryVisual({
	activeIndex,
	reducedMotion,
}: {
	readonly activeIndex: number;
	readonly reducedMotion: boolean;
}) {
	const activeFeature = productFeatures[activeIndex] ?? productFeatures[0];
	const sceneStates = storySceneStates(activeIndex, productFeatures.length);
	return (
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
								styles.storyDemoOrder(sceneStates.length - index),
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
	);
}
