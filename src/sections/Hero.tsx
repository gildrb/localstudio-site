import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { CtaPair } from "../components/Links";
import { useMachine } from "../machine";
import { HeroDemo } from "./HeroDemo";
import { HeroHearth } from "./hero/hearth";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
	const reduceMotion = useReducedMotion();
	const { toggleMachine } = useMachine();
	const settle = { opacity: 1, y: 0, filter: "blur(0px)" };

	return (
		<LazyMotion features={domAnimation} strict>
			<section className="hero" id="top" aria-labelledby="landing-title">
				<m.div
					className="hero__gradient"
					aria-hidden="true"
					initial={reduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1.2, ease, delay: 0.6 }}
				>
					<HeroHearth reduceMotion={Boolean(reduceMotion)} />
				</m.div>
				<div className="hero__texture" aria-hidden="true" />
				<div className="hero__inner">
					<div className="hero__copy">
						<m.h1
							id="landing-title"
							tabIndex={-1}
							initial={
								reduceMotion
									? false
									: { opacity: 0, y: 12, filter: "blur(6px)" }
							}
							animate={settle}
							transition={{ duration: 0.9, ease, delay: 0.12 }}
						>
							Intelligence should not be rented.
						</m.h1>
						<m.p
							className="hero__lede"
							initial={
								reduceMotion
									? false
									: { opacity: 0, y: 12, filter: "blur(6px)" }
							}
							animate={settle}
							transition={{ duration: 0.9, ease, delay: 0.18 }}
						>
							Run AI at home, on hardware you own. Keep your models,
							prompts, files, and agent workflows private, secure, and
							entirely under your control.
						</m.p>
						<m.div
							className="hero__actions"
							initial={
								reduceMotion
									? false
									: { opacity: 0, y: 12, filter: "blur(6px)" }
							}
							animate={settle}
							transition={{ duration: 0.9, ease, delay: 0.24 }}
						>
						<CtaPair secondary={{ href: "/prompt", label: "Setup prompt" }} />
						</m.div>
				</div>
				<m.button
					className="hero__mark-button"
					type="button"
					onClick={() => toggleMachine(true)}
					aria-label="Machine-readable page"
					initial={
						reduceMotion
							? false
							: { opacity: 0, y: 12, filter: "blur(6px)" }
					}
					animate={settle}
					transition={{ duration: 0.9, ease, delay: 0.05 }}
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
				</m.button>
				</div>
				<m.div
					className="hero__stage section-width"
					id="product"
					initial={
						reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(6px)" }
					}
					animate={settle}
					transition={{ duration: 0.9, ease, delay: 0.75 }}
				>
					<HeroDemo />
				</m.div>
			</section>
		</LazyMotion>
	);
}
