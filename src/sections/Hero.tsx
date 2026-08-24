import { assets } from "../domain/asset";
import { lazy, Suspense } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { machinePath, setupPath } from "../domain/route";
import { CtaPair } from "../components/Links";
import { motion } from "../domain/motion";
import { LocalLink } from "../components/LocalLink";
import { LocalAiLogo } from "../logo/LocalAiLogo";
import { site } from "../domain/site";

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
	return new URLSearchParams(window.location.search).has("demoClock")
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
			<section className="hero" id="top" aria-labelledby="landing-title">
				<LocalAiLogo />
				<div className="hero__inner">
					<div className="hero__copy">
						<m.h1 id="landing-title" tabIndex={-1} {...enter(0.12)}>
							Intelligence should be{" "}
							<span className="hero__title-end">
								owned
								<LocalLink
									className="hero__mark-button"
									href={machinePath}
									aria-label="Machine-readable page"
								>
									<img
										className="hero__mark"
										src={assets.mark}
										alt=""
										width="525"
										height="525"
										aria-hidden="true"
										draggable={false}
									/>
								</LocalLink>
							</span>
						</m.h1>
						<m.p className="hero__thesis" {...enter(0.2)}>
							Private AI that works for you, not the cloud.
						</m.p>
						<m.div className="hero__actions" {...enter(0.28)}>
							<CtaPair secondary={{ href: setupPath, label: "Setup prompt" }} />
						</m.div>
					</div>
				</div>
				<m.div
					className="hero__stage section-width"
					id="product"
					{...enter(0.75)}
				>
					<Suspense
						fallback={
							<div className="hero__demo-placeholder" aria-hidden="true" />
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
