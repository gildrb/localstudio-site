import { useEffect, useRef, useState } from "react";
import { m } from "motion/react";
import { usePrefersReducedMotion, useStableCallback } from "phase/react";
import {
	HERO_ENTRANCE_FADE_MS,
	HERO_ENTRANCE_VIDEO_URL,
	HERO_ENTRANCE_WATCHDOG_MS,
	hasHeroEntrancePlayed,
	persistHeroEntrancePlayed,
} from "./hero-entrance-state";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroEntranceVideo({ onComplete }: { onComplete: () => void }) {
	const prefersReducedMotion = usePrefersReducedMotion();
	const videoRef = useRef<HTMLVideoElement>(null);
	const completedRef = useRef(false);
	const [fading, setFading] = useState(false);
	const [mounted, setMounted] = useState(true);

	const complete = useStableCallback(() => {
		if (completedRef.current) return;
		completedRef.current = true;
		onComplete();
	});
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		const watchdog = window.setTimeout(() => {
			complete();
			setMounted(false);
		}, HERO_ENTRANCE_WATCHDOG_MS);
		const play = video.play();
		if (play) {
			void play.catch(() => {
				// Autoplay rejected (e.g. iOS low power mode): reveal the site
				// without persisting, so a later visit can try again.
				complete();
				setMounted(false);
			});
		}
		return () => window.clearTimeout(watchdog);
	}, [complete]);

	if (!mounted || prefersReducedMotion || hasHeroEntrancePlayed()) return null;

	const handleEnded = () => {
		// Hold the frozen final frame while it crossfades into the shader hero.
		setFading(true);
		complete();
		window.setTimeout(() => setMounted(false), HERO_ENTRANCE_FADE_MS);
	};

	const handleError = () => {
		complete();
		setMounted(false);
	};

	return (
		<m.div
			className="hero__backdrop"
			aria-hidden="true"
			initial={{ opacity: 1 }}
			animate={{ opacity: fading ? 0 : 1 }}
			transition={{ duration: HERO_ENTRANCE_FADE_MS / 1000, ease }}
		>
			<video
				ref={videoRef}
				src={HERO_ENTRANCE_VIDEO_URL}
				muted
				playsInline
				autoPlay
				preload="auto"
				disablePictureInPicture
				onPlay={persistHeroEntrancePlayed}
				onEnded={handleEnded}
				onError={handleError}
			/>
		</m.div>
	);
}
