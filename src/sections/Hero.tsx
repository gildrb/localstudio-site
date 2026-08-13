import { motion, useReducedMotion } from "motion/react";
import { DownloadButton, TextLink } from "../components/Links";

export function Hero() {
	const reduceMotion = useReducedMotion();

	return (
		<section className="hero" id="top" aria-labelledby="landing-title">
			<div className="hero__texture" aria-hidden="true" />
			<div className="hero__inner">
				<motion.div
					className="hero__copy"
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
					variants={{
						hidden: {},
						visible: {
							transition: { staggerChildren: 0.09, delayChildren: 0.05 },
						},
					}}
				>
					<motion.h1
						id="landing-title"
						variants={{
							hidden: { opacity: 0, y: 18 },
							visible: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
							},
						}}
					>
						Run your intelligence
						<br />
						at home.
					</motion.h1>
					<motion.p
						className="hero__lead"
						variants={{
							hidden: { opacity: 0, y: 18 },
							visible: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
							},
						}}
					>
						AI workspace built to help you go local.
					</motion.p>
					<motion.div
						className="hero__actions"
						variants={{
							hidden: { opacity: 0, y: 18 },
							visible: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
							},
						}}
					>
						<DownloadButton iconSize={17} />
						<TextLink href="/prompt">Setup</TextLink>
					</motion.div>
				</motion.div>
				<motion.div
					className="signal"
					aria-hidden="true"
					initial={reduceMotion ? false : { opacity: 0, scale: 0.72 }}
					animate={
						reduceMotion ? undefined : { opacity: 1, scale: 1, y: [0, -10, 0] }
					}
					transition={{
						opacity: { duration: 1.35, delay: 0.36, ease: [0.16, 1, 0.3, 1] },
						scale: { duration: 1.35, delay: 0.36, ease: [0.16, 1, 0.3, 1] },
						y: { duration: 7, delay: 1.7, repeat: Infinity, ease: "easeInOut" },
					}}
				>
					<div className="signal__glow" />
					<div className="signal__ripple" />
					<div className="signal__orbit">
						<span />
						<span />
						<span />
					</div>
					<div className="signal__orbit signal__orbit--inner">
						<span />
						<span />
					</div>
					<div className="signal__axis" />
					<div className="signal__core">
						<span />
					</div>
				</motion.div>
			</div>
			<motion.figure
				id="product"
				className="hero__screenshot"
				initial={
					reduceMotion ? false : { opacity: 0, y: 44, x: "-50%", scale: 0.985 }
				}
				animate={
					reduceMotion ? undefined : { opacity: 1, y: 0, x: "-50%", scale: 1 }
				}
				transition={{ duration: 1.2, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
			>
				<div className="screenshot-bezel">
					<div className="screenshot-viewport">
						<img
							src="/images/workbench-browser.png"
							alt="Local Studio workbench showing a coding agent and a local document in the integrated browser."
							width="5118"
							height="2800"
							fetchPriority="high"
						/>
					</div>
				</div>
			</motion.figure>
		</section>
	);
}
