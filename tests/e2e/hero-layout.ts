export function readMobileHeroLayout() {
	const region = document.querySelector('[aria-label="Local Studio workbench"]');
	const viewport = document.querySelector("[data-demo-viewport]");
	const app = document.querySelector("[data-demo-app]");
	const sidebar = document.querySelector("[data-demo-app] > aside");
	const computer = document.querySelector("[data-computer-panel]");
	const copy = document.querySelector("[data-hero-copy]");
	if (
		!(region instanceof HTMLElement) ||
		!(viewport instanceof HTMLElement) ||
		!(app instanceof HTMLElement) ||
		!(sidebar instanceof HTMLElement) ||
		!(computer instanceof HTMLElement) ||
		!(copy instanceof HTMLElement)
	) {
		throw new Error("demo chrome");
	}
	const demoBox = region.getBoundingClientRect();
	const thread = document.querySelector("[data-timeline-list]");
	const threadBox = thread instanceof HTMLElement ? thread.getBoundingClientRect() : null;
	const scale = region.clientWidth / 950;
	const menu = region.querySelector('[aria-label="Open navigation menu"]');
	return {
		sidebar: sidebar.offsetWidth,
		computer: computer.offsetWidth,
		layoutWidth: Math.round(Number.parseFloat(getComputedStyle(app).width)),
		layoutHeight: Math.round(Number.parseFloat(getComputedStyle(app).height)),
		composer: getComputedStyle(region).getPropertyValue("--composer-w").trim(),
		visualWidth: Math.round(app.getBoundingClientRect().width),
		demoWidth: region.clientWidth,
		demoLeft: Math.round(demoBox.left),
		demoRight: Math.round(demoBox.right),
		copyLeft: Math.round(copy.getBoundingClientRect().left),
		frameHeight: Math.round(viewport.getBoundingClientRect().height),
		scaledHeight: Math.round(787 * scale),
		rightRadius: getComputedStyle(region).borderTopRightRadius,
		menu: menu instanceof HTMLElement ? getComputedStyle(menu).display : "none",
		chatVisible: Boolean(
			threadBox && threadBox.left < demoBox.right && threadBox.right > demoBox.left,
		),
		pointer: getComputedStyle(region).pointerEvents,
		mobile: region.dataset["mobile"] ?? null,
	};
}
