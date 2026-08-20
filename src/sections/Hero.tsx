import { lazy, Suspense } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { CtaPair } from "../components/Links";
import { useMachine } from "../machine";
import { HeroHearth } from "./hero/hearth";

const HeroDemo = lazy(() => import("./HeroDemo").then(({ HeroDemo }) => ({ default: HeroDemo })));

const ease = [0.16, 1, 0.3, 1] as const;
const ENTER = { opacity: 0, y: 8 };
const SETTLE = { opacity: 1, y: 0 };

export function Hero() {
	const reduceMotion = useReducedMotion();
	const { toggleMachine } = useMachine();
	return (
		<LazyMotion features={domAnimation} strict>
			<section className="hero" id="top" aria-labelledby="landing-title">
				<div className="hero__gradient" aria-hidden="true">
					<HeroHearth reduceMotion={Boolean(reduceMotion)} />
				</div>
				<div className="hero__inner">
					<div className="hero__copy">
						<m.h1
							id="landing-title"
							tabIndex={-1}
							initial={reduceMotion ? false : ENTER}
							animate={SETTLE}
							transition={{ duration: 0.5, ease, delay: 0.04 }}
						>
							Intelligence should not be{" "}
							<span className="hero__title-end">
								rented.
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
						<m.p
							className="hero__lede"
							initial={reduceMotion ? false : ENTER}
							animate={SETTLE}
							transition={{ duration: 0.5, ease, delay: 0.08 }}
						>
							Run AI at home, on hardware you own. Keep your models, prompts, files, and agent
							workflows private, secure, and entirely under your control.
						</m.p>
						<m.div
							className="hero__actions"
							initial={reduceMotion ? false : ENTER}
							animate={SETTLE}
							transition={{ duration: 0.5, ease, delay: 0.12 }}
						>
							<CtaPair secondary={{ href: "/prompt", label: "Setup prompt" }} />
						</m.div>
					</div>
				</div>
				<m.div
					className="hero__stage section-width"
					id="product"
					initial={reduceMotion ? false : ENTER}
					animate={SETTLE}
					transition={{ duration: 0.55, ease, delay: 0.2 }}
				>
					<Suspense fallback={<div className="demo hero__demo-placeholder" aria-hidden="true" />}>
						<HeroDemo />
					</Suspense>
				</m.div>
			</section>
		</LazyMotion>
	);
}
