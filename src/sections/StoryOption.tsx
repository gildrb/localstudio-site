import * as stylex from "@stylexjs/stylex";
import { m } from "motion/react";
import { productFeatures, type Prose } from "../content/product";
import { motion } from "../domain/motion";
import { baseStyles } from "../styles/base-styles";
import { styles } from "../styles/sections-styles";
import { renderInlineReact } from "../ui/prose";
import { storyOptionAnimation } from "./product-story-motion";

interface StoryOptionProps {
	readonly activeIndex: number;
	readonly mobile: boolean | null;
	readonly reducedMotion: boolean;
	readonly index: number;
	readonly selected: boolean;
}

function StoryDescription({
	description,
	selected,
	reducedMotion,
}: {
	readonly description: Prose;
	readonly selected: boolean;
	readonly reducedMotion: boolean;
}) {
	return (
		<m.div
			initial={false}
			animate={{
				opacity: selected ? 1 : 0,
				y: selected || reducedMotion ? 0 : 6,
				filter: selected || reducedMotion ? "blur(0px)" : "blur(8px)",
			}}
			transition={{
				...motion.featureSwap,
				duration: reducedMotion ? 0 : motion.featureSwap.duration,
			}}
			{...stylex.props(
				baseStyles.element,
				styles.storyDescriptionMotion,
				selected && styles.storySelectedDescription,
			)}
		>
			<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.storyDescription)}>
				{renderInlineReact(description)}
			</p>
		</m.div>
	);
}

export function StoryOption({
	activeIndex,
	mobile,
	reducedMotion,
	index,
	selected,
}: StoryOptionProps) {
	const feature = productFeatures[index];
	if (!feature) return null;
	const transition = {
		...motion.featureEntry,
		duration: reducedMotion ? 0 : motion.featureEntry.duration,
	};
	return (
		<m.li
			initial={false}
			animate={storyOptionAnimation(index, activeIndex, mobile, reducedMotion)}
			transition={transition}
			{...stylex.props(
				baseStyles.element,
				styles.storyOption,
				styles.storyOptionPosition(index < activeIndex ? "-10px" : "10px"),
				index === 0 && styles.storyFirstOption,
				selected && styles.storySelectedOption,
			)}
			aria-current={selected ? "step" : undefined}
		>
			<div {...stylex.props(baseStyles.element, styles.storyOptionControl)}>
				<m.span
					initial={false}
					animate={{ opacity: selected ? 1 : 0.55 }}
					transition={transition}
					{...stylex.props(baseStyles.element, styles.storyOptionTitle)}
				>
					{feature.storyTitle}
				</m.span>
			</div>
			<StoryDescription
				description={feature.storyDescription}
				selected={selected}
				reducedMotion={reducedMotion}
			/>
		</m.li>
	);
}
