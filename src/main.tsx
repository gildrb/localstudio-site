import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { heroSizes, responsiveSrcSet } from "./images";
import "./styles/global.css";

const heroImageRoutes = new Set(["/", "/product"]);

function syncKeyboardMode(event: Event) {
	if (event.type === "keydown") {
		document.documentElement.dataset.keyboard = "true";
	} else {
		delete document.documentElement.dataset.keyboard;
	}
}

document.addEventListener("keydown", syncKeyboardMode);
document.addEventListener("pointerdown", syncKeyboardMode);

if (heroImageRoutes.has(window.location.pathname)) {
	const preload = document.createElement("link");
	preload.rel = "preload";
	preload.as = "image";
	preload.setAttribute("fetchpriority", "high");
	preload.href = "/images/workbench-browser-1300.png";
	preload.setAttribute(
		"imagesrcset",
		responsiveSrcSet("/images/workbench-browser.png"),
	);
	preload.setAttribute("imagesizes", heroSizes);
	document.head.append(preload);
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
