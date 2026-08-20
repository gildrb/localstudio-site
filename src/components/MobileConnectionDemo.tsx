import { ArrowRight, Laptop, ShieldCheck, Smartphone } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useReducer } from "react";

const phases = [
	"Phone turn signed",
	"Encrypted transit",
	"Agent running on Mac",
	"Response streaming home",
	"Session synchronized",
] as const;

type DemoState = {
	cycle: number;
	phase: number;
};

function demoReducer(state: DemoState): DemoState {
	return state.phase === phases.length - 1
		? { cycle: state.cycle + 1, phase: 0 }
		: { ...state, phase: state.phase + 1 };
}

export function MobileConnectionDemo() {
	const reduceMotion = useReducedMotion() === true;
	const [state, dispatch] = useReducer(demoReducer, { cycle: 0, phase: 0 });
	const visiblePhase = reduceMotion ? phases.length - 1 : state.phase;
	const phase = phases[visiblePhase];
	const turn = String(15 + state.cycle).padStart(3, "0");

	useEffect(() => {
		if (reduceMotion) return;
		const delay = state.phase === phases.length - 1 ? 1800 : 1100;
		const timer = window.setTimeout(dispatch, delay);
		return () => window.clearTimeout(timer);
	}, [reduceMotion, state]);

	return (
		<section
			className="mobile-connection-demo surface-panel-large"
			data-phase={visiblePhase}
			aria-label="Authenticated Local Studio mobile connection demonstration"
		>
			<div className="mobile-connection-demo__figure" aria-hidden="true">
				<svg viewBox="0 0 600 270" preserveAspectRatio="none">
					<path d="M-30 250 Q300 -80 630 250" />
					<path d="M62 270 Q300 8 538 270" />
					<path d="M160 270 Q300 76 440 270" />
					<path d="M0 190 H600" />
					<path d="M0 248 H600" />
					<path d="M300 24 V270" />
				</svg>

				<div className="mobile-connection-demo__endpoint mobile-connection-demo__endpoint--phone">
					<span className="mobile-connection-demo__device">
						<Smartphone size={17} />
					</span>
					<span>
						<small>KittyLitter</small>
						<strong>Phone</strong>
					</span>
				</div>

				<div className="mobile-connection-demo__link">
					<span className="mobile-connection-demo__rail" />
					<span className="mobile-connection-demo__packet" />
					<span className="mobile-connection-demo__lock">
						<ShieldCheck size={16} />
					</span>
				</div>

				<div className="mobile-connection-demo__endpoint mobile-connection-demo__endpoint--mac">
					<span className="mobile-connection-demo__device">
						<Laptop size={18} />
					</span>
					<span>
						<small>Local Studio</small>
						<strong>Mac</strong>
					</span>
				</div>
			</div>

			<div className="mobile-connection-demo__turn">
				<div>
					<span className="mobile-connection-demo__turn-index">
						Turn {turn}
					</span>
					<span className="mobile-connection-demo__turn-copy">
						Continue the deployment review
					</span>
				</div>
				<ArrowRight size={15} aria-hidden="true" />
				<div className="mobile-connection-demo__result">
					<span />
					<span />
					<span />
				</div>
			</div>

			<footer className="mobile-connection-demo__footer">
				<strong>{phase}</strong>
				<small>28 ms</small>
			</footer>
		</section>
	);
}
