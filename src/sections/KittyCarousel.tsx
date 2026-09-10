import type { KeyboardEvent } from "react";
import type { CarouselMeasurementTarget } from "./kitty-carousel-metrics";
import * as stylex from "@stylexjs/stylex";
import { baseStyles } from "../styles/base-styles";
import { styles } from "../styles/sections-styles";
import { FeatureCard } from "./KittyFeatureCard";
import { features } from "./kitty-features";
import { useKittyCarousel } from "./use-kitty-carousel";

function KittyFeatures({
	active,
	highlightCard,
	animateToIndex,
}: {
	readonly active: number | null;
	readonly highlightCard: (index: number | null) => void;
	readonly animateToIndex: (index: number, center?: boolean) => void;
}) {
	return (
		<div {...stylex.props(baseStyles.element, styles.kittyItems)} data-kitty-items="">
			{features.map((feature, index) => (
				<FeatureCard
					feature={feature}
					index={index}
					active={active === index}
					onActivate={highlightCard}
					onRequestVisible={animateToIndex}
					key={feature.title}
				/>
			))}
		</div>
	);
}

export function KittyCarousel() {
	const {
		active,
		dragging,
		carouselRef,
		carouselIndex,
		syncFromScroll,
		highlightCard,
		animateToIndex,
		jumpToCarousel,
		handlers,
	} = useKittyCarousel();
	return (
		<div
			ref={carouselRef}
			{...stylex.props(
				baseStyles.element,
				baseStyles.focusable,
				styles.kittyCarousel,
				dragging && styles.kittyCarouselDragging,
			)}
			data-carousel-index={carouselIndex}
			role="region"
			aria-label="KittyLitter features"
			tabIndex={0}
			onKeyDown={(event: Readonly<Pick<KeyboardEvent, "key" | "preventDefault">>) => {
				if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
				event.preventDefault();
				jumpToCarousel(carouselIndex + (event.key === "ArrowRight" ? 1 : -1));
			}}
			onScroll={(event: { readonly currentTarget: CarouselMeasurementTarget }) => {
				syncFromScroll(event.currentTarget);
			}}
			onClickCapture={handlers.onClickCapture}
			onPointerDown={handlers.onPointerDown}
			onPointerMove={handlers.onPointerMove}
			onPointerUp={handlers.onPointerUp}
			onPointerCancel={handlers.onPointerCancel}
			onLostPointerCapture={handlers.onLostPointerCapture}
		>
			<KittyFeatures
				active={active}
				highlightCard={highlightCard}
				animateToIndex={animateToIndex}
			/>
		</div>
	);
}
