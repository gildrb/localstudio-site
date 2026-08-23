import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { assets, heroSizes, responsiveSrcSet } from "./images";
import "./styles/global.css";

const heroImageRoutes = new Set(["/product"]);

function syncKeyboardMode(event: Event) {
	if (event.type === "keydown") {
		document.documentElement.dataset.keyboard = "true";
	} else {
		delete document.documentElement.dataset.keyboard;
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

if (heroImageRoutes.has(window.location.pathname)) {
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
