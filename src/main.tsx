import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { assets, heroSizes, responsiveSrcSet } from "./domain/asset";
import { isHeroImageRoute } from "./domain/route";
import "./styles/global.css";

function setFavicon(href: string, media: string) {
	const link = document.createElement("link");
	link.rel = "icon";
	link.type = "image/svg+xml";
	link.href = href;
	link.media = media;
	document.head.append(link);
}

setFavicon(assets.favicon, "(prefers-color-scheme: light)");
setFavicon(assets.faviconDark, "(prefers-color-scheme: dark)");

function syncKeyboardMode(event: Event) {
	if (event.type === "keydown") {
		document.documentElement.dataset["keyboard"] = "true";
	} else {
		delete document.documentElement.dataset["keyboard"];
	}
}

function isSiteImage(target: EventTarget | null) {
	return target instanceof Element && target.closest("img, picture") !== null;
}

function preventImageAction(event: Event) {
	if (isSiteImage(event.target)) {
		event.preventDefault();
	}
}

document.addEventListener("keydown", syncKeyboardMode);
document.addEventListener("pointerdown", syncKeyboardMode);
document.addEventListener("contextmenu", preventImageAction);
document.addEventListener("dragstart", preventImageAction);
document.addEventListener("selectstart", preventImageAction);

if (isHeroImageRoute(window.location.pathname)) {
	const preload = document.createElement("link");
	preload.rel = "preload";
	preload.as = "image";
	preload.setAttribute("fetchpriority", "high");
	preload.href = assets.workbenchBrowserHero;
	preload.setAttribute(
		"imagesrcset",
		responsiveSrcSet(assets.workbenchBrowser),
	);
	preload.setAttribute("imagesizes", heroSizes);
	document.head.append(preload);
}

const root = document.getElementById("root");
if (root === null) {
	throw new Error("root");
}
createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
