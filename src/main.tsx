import * as stylex from "@stylexjs/stylex";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./app/App";
import { assets } from "./domain/asset";
import "./styles/stylex-entry.css";
import { baseStyles } from "./styles/base-styles";

document.documentElement.className =
	stylex.props(baseStyles.element, baseStyles.html).className ?? "";
document.body.className = stylex.props(baseStyles.element, baseStyles.body).className ?? "";

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

function syncKeyboardMode(event: Readonly<Pick<Event, "type">>) {
	if (event.type === "keydown") {
		document.documentElement.dataset["keyboard"] = "true";
	} else {
		delete document.documentElement.dataset["keyboard"];
	}
}

type ImageActionEvent = Readonly<Pick<Event, "preventDefault">> & {
	readonly target: Readonly<EventTarget> | null;
};

function preventImageAction(event: ImageActionEvent) {
	const target = event.target;
	if (target instanceof Element && target.closest("img, picture") !== null) {
		event.preventDefault();
	}
}

document.addEventListener("keydown", syncKeyboardMode);
document.addEventListener("pointerdown", syncKeyboardMode);
document.addEventListener("contextmenu", preventImageAction);
document.addEventListener("dragstart", preventImageAction);
document.addEventListener("selectstart", preventImageAction);

const root = document.querySelector<HTMLElement>("#root");
if (root === null) {
	throw new Error("root");
}
root.className = stylex.props(baseStyles.element, baseStyles.root).className ?? "";
const app = (
	<StrictMode>
		<App />
	</StrictMode>
);
if (window.location.pathname === "/" && root.hasChildNodes()) {
	hydrateRoot(root, app);
} else {
	root.replaceChildren();
	createRoot(root).render(app);
}
