// Session state for the hero entrance video. Lives outside the component file
// so the component module only exports components (react-refresh contract).

export const HERO_ENTRANCE_STORAGE_KEY = "hero-entrance-played";
export const HERO_ENTRANCE_VIDEO_URL = "/videos/hero-entrance.mp4";
export const HERO_ENTRANCE_FADE_MS = 700;
// Hard ceiling so a stalled decode or blocked play can never keep the hero
// covered; the entrance is decorative, the page must always become usable.
export const HERO_ENTRANCE_WATCHDOG_MS = 15_000;

export function hasHeroEntrancePlayed(): boolean {
	try {
		return sessionStorage.getItem(HERO_ENTRANCE_STORAGE_KEY) === "1";
	} catch {
		// Storage unavailable (privacy mode): prefer skipping the takeover.
		return true;
	}
}

export function persistHeroEntrancePlayed(): void {
	try {
		sessionStorage.setItem(HERO_ENTRANCE_STORAGE_KEY, "1");
	} catch {
		// Unavailable storage only costs replaying the entrance later.
	}
}
