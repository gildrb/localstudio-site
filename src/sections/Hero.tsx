import { lazy, Suspense, useState } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { usePrefersReducedMotion } from "phase/react";
import { CtaPair } from "../components/Links";
import { useMachine } from "../machine";
import { HeroEntranceVideo } from "./HeroEntranceVideo";
import { hasHeroEntrancePlayed } from "./hero-entrance-state";
import { LocalAiLogoShader } from "./localai-logo-shader";

const HeroDemo = lazy(() =>
	import("./HeroDemo").then(({ HeroDemo }) => ({ default: HeroDemo })),
);

const ease = [0.16, 1, 0.3, 1] as const;
const settle = { opacity: 1, y: 0, filter: "blur(0px)" };

export function Hero() {
	const { toggleMachine } = useMachine();
	const reduceMotion = usePrefersReducedMotion();
	// The entrance video covers the hero once per session; every other visit
	// (and reduced motion) goes straight to the settled hero.
	const [entranceDone, setEntranceDone] = useState(
		() => reduceMotion || hasHeroEntrancePlayed(),
	);
	const enter = (delay: number) => ({
		initial: reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(6px)" },
		animate: entranceDone || reduceMotion ? settle : undefined,
		transition: { duration: 0.9, ease, delay },
	});
	return (
		<LazyMotion features={domAnimation} strict>
			<section className="hero" id="top" aria-labelledby="landing-title">
				<HeroEntranceVideo onComplete={() => setEntranceDone(true)} />
				<m.div
					className="hero-logo-gate"
					initial={{ opacity: reduceMotion ? 1 : 0 }}
					animate={{ opacity: entranceDone ? 1 : 0 }}
					transition={{ duration: reduceMotion ? 0 : 0.6, ease }}
				>
					<LocalAiLogoShader />
				</m.div>
				<div className="hero__inner">
					<div className="hero__copy">
						<m.h1 id="landing-title" tabIndex={-1} {...enter(0.12)}>
							Intelligence should be{" "}
							<span className="hero__title-end">
								owned
								<button
									className="hero__mark-button"
									type="button"
									onClick={() => toggleMachine(true)}
									aria-label="Machine-readable page"
								>
									<img
										className="hero__mark"
										src="/images/optimized.svg"
										alt=""
										width="525"
										height="525"
										aria-hidden="true"
										draggable={false}
									/>
								</button>
							</span>
						</m.h1>
						<m.div className="hero__actions" {...enter(0.24)}>
							<CtaPair secondary={{ href: "/setup", label: "Setup prompt" }} />
						</m.div>
					</div>
				</div>
				<m.div
					className="hero__stage section-width"
					id="product"
					{...enter(0.75)}
				>
					{entranceDone ? (
						<Suspense
							fallback={
								<div className="hero__demo-placeholder" aria-hidden="true" />
							}
						>
							<HeroDemo />
						</Suspense>
					) : (
						<div className="hero__demo-placeholder" aria-hidden="true" />
					)}
				</m.div>
			</section>
		</LazyMotion>
	);
}
