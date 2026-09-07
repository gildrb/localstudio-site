import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { assets } from "../domain/asset";
import { lazy, Suspense, useLayoutEffect, type ReactNode } from "react";
import { animate, LazyMotion, domAnimation, m, useAnimationControls, useReducedMotion } from "motion/react";
import { machinePath, setupPath } from "../domain/route";
import { CtaPair } from "../components/Links";
import { motion } from "../domain/motion";
import { LocalLink } from "../components/LocalLink";
import { LocalAiLogo } from "../logo/LocalAiLogo";
import { site } from "../domain/site";
import { styles } from "../styles/sections-styles";

const HeroDemo = lazy(() =>
	import("@local-studio/demo-ui/hero").then(({ HeroDemo: Workbench }) => ({ default: Workbench })),
);

function HeroEntrance({ delay, children, sx, id }: {
	delay: number; children: ReactNode; sx?: stylex.StyleXStyles; id?: string;
}) {
	const reduced = useReducedMotion();
	const controls = useAnimationControls();
	useLayoutEffect(() => {
		const update = (opacity: number) => controls.set({ opacity, y: 12 * (1 - opacity), filter: `blur(${6 * (1 - opacity)}px)` });
		update(reduced ? 1 : 0);
		if (reduced) return;
		const playback = animate(0, 1, { ...motion.heroEnter, delay, onUpdate: update });
		return () => playback.stop();
	}, [controls, delay, reduced]);
	return <m.div id={id} {...stylex.props(baseStyles.element, sx)} initial={false} animate={controls}>{children}</m.div>;
}

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
						<HeroEntrance delay={0}>
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
						</HeroEntrance>
						<HeroEntrance delay={0.03}>
							<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.heroThesis)}>
								Private AI that works for you, not the cloud.
							</p>
						</HeroEntrance>
						<HeroEntrance delay={0.06} sx={styles.heroActions}>
							<CtaPair secondary={{ href: setupPath, label: "Setup Prompt" }} />
						</HeroEntrance>
					</div>
				</div>
				<HeroEntrance delay={0.09} id="product" sx={[baseStyles.sectionAnchor, styles.sectionWidth, styles.heroStage]}>
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
				</HeroEntrance>
			</section>
		</LazyMotion>
	);
}
