import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { assets } from "../domain/asset";
import { lazy, Suspense } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { machinePath, setupPath } from "../domain/route";
import { CtaPair } from "../components/Links";
import { motion } from "../domain/motion";
import { LocalLink } from "../components/LocalLink";
import { LocalAiLogo } from "../logo/LocalAiLogo";
import { site } from "../domain/site";
import { styles } from "../styles/sections-styles";

const HeroDemo = lazy(() =>
	import("@local-studio/demo-ui/hero").then(({ HeroDemo }) => ({ default: HeroDemo })),
);

const settle = { opacity: 1, y: 0, filter: "blur(0px)" };

const fastClock = {
	now: () => Date.now(),
	timeout: (callback: () => void, delay: number) => {
		void delay;
		return window.setTimeout(callback, 0);
	},
	clear: (id: ReturnType<typeof setTimeout>) => {
		window.clearTimeout(id);
	},
};

function useHeroClock() {
	const location = globalThis.window?.location;
	if (!location) return undefined;
	return new URLSearchParams(location.search).has("demoClock")
		? fastClock
		: undefined;
}

export function Hero() {
	const clock = useHeroClock();
	const reduceMotion = useReducedMotion();
	const enter = (delay: number) => ({
		initial: reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(6px)" },
		animate: settle,
		transition: { ...motion.heroEnter, delay },
	});
	return (
		<LazyMotion features={domAnimation} strict>
			<section
				{...stylex.props(baseStyles.element, stylex.defaultMarker(), styles.hero)}
				id="top"
				aria-labelledby="landing-title"
			>
				<LocalAiLogo />
				<div {...stylex.props(baseStyles.element, styles.heroInner)}>
					<div data-hero-copy {...stylex.props(baseStyles.element, styles.heroCopy)}>
						<m.div {...stylex.props(baseStyles.element)} {...enter(0.12)}>
							<h1
								id="landing-title"
								tabIndex={-1}
								{...stylex.props(baseStyles.element, baseStyles.heading, baseStyles.focusable, styles.heroHeading)}
							>
								Intelligence Should Be{" "}
								<span {...stylex.props(baseStyles.element, styles.heroTitleEnd)}>
									Owned
									<LocalLink
										sx={styles.heroMarkButton}
										href={machinePath}
										aria-label="Machine-readable page"
									>
										<img
										{...stylex.props(baseStyles.element, baseStyles.image, styles.heroMark)}
										src={assets.mark}
										alt=""
										width="525"
										height="525"
										aria-hidden="true"
										draggable={false}
									/>
									</LocalLink>
								</span>
							</h1>
						</m.div>
						<m.div {...stylex.props(baseStyles.element)} {...enter(0.2)}>
							<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.heroThesis)}>
								Private AI that works for you, not the cloud.
							</p>
						</m.div>
						<m.div {...stylex.props(baseStyles.element, styles.heroActions)} {...enter(0.28)}>
							<CtaPair secondary={{ href: setupPath, label: "Setup Prompt" }} />
						</m.div>
					</div>
				</div>
				<m.div
					{...stylex.props(baseStyles.element, 
					baseStyles.sectionAnchor,
					styles.sectionWidth,
					styles.heroStage,
				)}
					id="product"
					{...enter(0.75)}
				>
					<Suspense
						fallback={
							<div
							{...stylex.props(baseStyles.element, styles.heroDemoPlaceholder)}
							aria-hidden="true"
						/>
						}
					>
						{clock ? (
							<HeroDemo
								clock={clock}
								repositoryUrl={site.products.localStudio.repository}
							/>
						) : (
							<HeroDemo repositoryUrl={site.products.localStudio.repository} />
						)}
					</Suspense>
				</m.div>
			</section>
		</LazyMotion>
	);
}
