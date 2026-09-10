import * as stylex from "@stylexjs/stylex";
import { useEffect } from "react";
import { selectionStyles } from "../styles/base-styles";

const segmentClassNames = [
	stylex.props(selectionStyles.brightToDay).className ?? "",
	stylex.props(selectionStyles.dayToBlue).className ?? "",
	stylex.props(selectionStyles.blueToDusk).className ?? "",
	stylex.props(selectionStyles.duskToNight).className ?? "",
	stylex.props(selectionStyles.night).className ?? "",
];

function selectionPosition(position: number) {
	const normalized = Math.min(1, Math.max(0, position));
	const scaled = normalized * (segmentClassNames.length - 1);
	const start = Math.floor(scaled);
	const end = Math.min(start + 1, segmentClassNames.length - 1);
	return {
		segment: start,
		mix: Math.round((scaled - start) * 1000) / 10,
		terminal: start === end,
	};
}

const darkInkClassName = stylex.props(selectionStyles.darkInk).className ?? "";
const selectionClasses = new Set(
	[...segmentClassNames, darkInkClassName].flatMap((className) => className.split(" ")),
);

function nonSelectionClassName(className: string) {
	return className
		.split(" ")
		.filter((name) => name.length > 0 && !selectionClasses.has(name))
		.join(" ");
}

function selectedTextOwners(selection: Readonly<Pick<Selection, "rangeCount" | "getRangeAt">>) {
	const owners = new Set<HTMLElement>();
	for (let index = 0; index < selection.rangeCount; index += 1) {
		const range = selection.getRangeAt(index);
		const root = range.commonAncestorContainer;
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		for (
			let node = root instanceof Text ? root : walker.nextNode();
			node;
			node = walker.nextNode()
		) {
			if (!(node instanceof Text) || !node.data.trim() || !range.intersectsNode(node)) continue;
			const parent = node.parentElement;
			if (parent && !parent.closest('[aria-hidden="true"], [inert]')) owners.add(parent);
		}
	}
	return owners;
}

class SelectionHighlights {
	#owners = new Set<HTMLElement>();

	get size() {
		return this.#owners.size;
	}

	clear() {
		for (const owner of this.#owners) {
			const className = nonSelectionClassName(owner.getAttribute("class") ?? "");
			delete owner.dataset["selectionMix"];
			if (className) owner.setAttribute("class", className);
			else owner.removeAttribute("class");
		}
		this.#owners.clear();
	}

	update() {
		this.clear();
		const selection = document.getSelection();
		if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
		this.#owners = selectedTextOwners(selection);
		for (const owner of this.#owners) {
			const bounds = owner.getBoundingClientRect();
			const position = (bounds.top + bounds.height / 2) / window.innerHeight;
			const retainedClassName = nonSelectionClassName(owner.getAttribute("class") ?? "");
			delete owner.dataset["selectionMix"];
			if (retainedClassName) owner.setAttribute("class", retainedClassName);
			else owner.removeAttribute("class");
			const { segment, mix, terminal } = selectionPosition(position);
			const current = owner.getAttribute("class");
			const segmentClassName = segmentClassNames[segment] ?? segmentClassNames[0];
			const className = `${segmentClassName} ${darkInkClassName}`;
			if (!terminal) owner.dataset["selectionMix"] = `${mix}%`;
			owner.setAttribute(
				"class",
				current !== null && current.length > 0 ? `${current} ${className}` : className,
			);
		}
	}
}

export function useSkySelection() {
	useEffect(() => {
		const highlights = new SelectionHighlights();
		let frame = 0;
		const update = () => {
			frame = 0;
			highlights.update();
		};
		const schedule = () => {
			if (!frame) frame = window.requestAnimationFrame(update);
		};
		const scheduleSelected = () => {
			if (highlights.size > 0) schedule();
		};

		document.addEventListener("selectionchange", schedule);
		window.addEventListener("resize", scheduleSelected);
		window.addEventListener("scroll", scheduleSelected, { passive: true });
		return () => {
			document.removeEventListener("selectionchange", schedule);
			window.removeEventListener("resize", scheduleSelected);
			window.removeEventListener("scroll", scheduleSelected);
			window.cancelAnimationFrame(frame);
			highlights.clear();
		};
	}, []);
}
