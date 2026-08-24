import { useEffect } from "react";

const sky = [
	"var(--selection-sky-bright)",
	"var(--selection-sky-day)",
	"var(--selection-sky-blue)",
	"var(--selection-sky-dusk)",
	"var(--selection-sky-night)",
] as const;
const ownerClass = "sky-selection-owner";

function selectionColor(position: number) {
	const scaled = Math.min(1, Math.max(0, position)) * (sky.length - 1);
	const start = Math.floor(scaled);
	const end = Math.min(start + 1, sky.length - 1);
	const progress = Math.round((scaled - start) * 1000) / 10;
	const startColor = sky[start] ?? sky[0];
	const endColor = sky[end] ?? startColor;
	if (start === end) return startColor;
	return `color-mix(in srgb, ${startColor}, ${endColor} ${progress}%)`;
}

function selectionInk(position: number) {
	return position < 0.58 ? "var(--button-ink)" : "var(--foreground)";
}

function selectedTextOwners(selection: Selection) {
	const owners = new Set<HTMLElement>();
	const include = (node: Node, range: Range) => {
		if (
			!(node instanceof Text) ||
			!node.data.trim() ||
			!range.intersectsNode(node)
		)
			return;
		const parent = node.parentElement;
		if (parent && !parent.closest('[aria-hidden="true"], [inert]'))
			owners.add(parent);
	};

	for (let index = 0; index < selection.rangeCount; index += 1) {
		const range = selection.getRangeAt(index);
		if (range.commonAncestorContainer instanceof Text) {
			include(range.commonAncestorContainer, range);
			continue;
		}
		const walker = document.createTreeWalker(
			range.commonAncestorContainer,
			NodeFilter.SHOW_TEXT,
		);
		for (let node = walker.nextNode(); node; node = walker.nextNode())
			include(node, range);
	}
	return owners;
}

export function useSkySelection() {
	useEffect(() => {
		let owners = new Set<HTMLElement>();
		let frame = 0;

		const clear = () => {
			for (const owner of owners) {
				owner.classList.remove(ownerClass);
				owner.style.removeProperty("--selection");
				owner.style.removeProperty("--selection-ink");
			}
			owners.clear();
		};
		const update = () => {
			frame = 0;
			clear();
			const selection = document.getSelection();
			if (!selection || selection.isCollapsed || selection.rangeCount === 0)
				return;
			owners = selectedTextOwners(selection);
			for (const owner of owners) {
				const bounds = owner.getBoundingClientRect();
				const position = (bounds.top + bounds.height / 2) / window.innerHeight;
				owner.classList.add(ownerClass);
				owner.style.setProperty("--selection", selectionColor(position));
				owner.style.setProperty("--selection-ink", selectionInk(position));
			}
		};
		const schedule = () => {
			if (!frame) frame = window.requestAnimationFrame(update);
		};

		document.addEventListener("selectionchange", schedule);
		window.addEventListener("resize", schedule);
		window.addEventListener("scroll", schedule, { passive: true });
		return () => {
			document.removeEventListener("selectionchange", schedule);
			window.removeEventListener("resize", schedule);
			window.removeEventListener("scroll", schedule);
			window.cancelAnimationFrame(frame);
			clear();
		};
	}, []);
}
