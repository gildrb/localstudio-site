import { memo, type KeyboardEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { baseStyles } from "../styles/base-styles";
import { styles } from "../styles/sections-styles";
import type { KittyFeature } from "./kitty-features";

function FeatureDescription({ feature }: { readonly feature: KittyFeature }) {
	return (
		<div
			{...stylex.props(baseStyles.element, styles.kittyFeatureBody)}
			data-kitty-drag-interactive=""
		>
			<span
				data-kitty-feature-trigger
				{...stylex.props(baseStyles.element, styles.kittyFeatureTrigger)}
			>
				{feature.title}
			</span>
			<div
				data-kitty-feature-description
				{...stylex.props(baseStyles.element, styles.kittyFeatureDescription)}
			>
				<p
					{...stylex.props(
						baseStyles.element,
						baseStyles.paragraph,
						styles.kittyFeatureDescriptionText,
					)}
				>
					{feature.text}
				</p>
			</div>
		</div>
	);
}

interface FeatureCardProps {
	readonly feature: KittyFeature;
	readonly index: number;
	readonly active: boolean;
	readonly onActivate: (index: number | null) => void;
	readonly onRequestVisible: (index: number, center?: boolean) => void;
}

function FeatureMedia({
	feature,
	index,
	onRequestVisible,
}: Pick<FeatureCardProps, "feature" | "index" | "onRequestVisible">) {
	return (
		<div
			{...stylex.props(baseStyles.element, baseStyles.focusable, styles.kittyFeatureMedia)}
			data-kitty-feature-media=""
			data-kitty-drag-interactive=""
			role="region"
			tabIndex={0}
			aria-label={`Show ${feature.title}`}
			onKeyDown={(event: Readonly<Pick<KeyboardEvent, "key" | "preventDefault">>) => {
				if (event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				onRequestVisible(index, true);
			}}
			onClick={() => {
				onRequestVisible(index, true);
			}}
		>
			<img
				{...stylex.props(baseStyles.element, baseStyles.image, styles.kittyFeatureImage)}
				src={feature.image}
				srcSet={`${feature.image} 660w, ${feature.image2x} 1320w`}
				sizes="(max-width: 620px) min(78vw, 320px), (max-width: 900px) min(620px, calc(100vw - 48px)), 620px"
				alt={feature.alt}
				width="1320"
				height="1320"
				loading="lazy"
				fetchPriority="low"
				decoding="async"
				draggable={false}
			/>
		</div>
	);
}

export const FeatureCard = memo(function FeatureCard({
	feature,
	index,
	active,
	onActivate,
	onRequestVisible,
}: FeatureCardProps) {
	return (
		<article
			{...stylex.props(baseStyles.element, styles.kittyFeature)}
			data-kitty-feature=""
			data-active={active ? "true" : "false"}
			onMouseEnter={() => {
				onActivate(index);
			}}
			onMouseLeave={() => {
				onActivate(null);
			}}
		>
			<FeatureMedia feature={feature} index={index} onRequestVisible={onRequestVisible} />
			<FeatureDescription feature={feature} />
		</article>
	);
});
