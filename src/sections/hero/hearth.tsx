import { useEffect, useRef, useState } from "react";

const SPARSE = "\u00a0\u00a0\u00a0\u00a0·.:";
const EMBERS = "*+#";
const POOL = 10;

function pick(source: string): string {
	return source[(Math.random() * source.length) | 0] ?? "*";
}

function metrics(root: HTMLElement): { col: number; row: number } {
	const probe = document.createElement("span");
	probe.textContent = "0";
	probe.style.cssText = "position:absolute;visibility:hidden;font:inherit";
	root.append(probe);
	const box = probe.getBoundingClientRect();
	probe.remove();
	return { col: Math.max(6, box.width), row: Math.max(12, box.height) };
}

function fieldFor(cols: number, rows: number): string {
	let out = "";
	for (let y = 0; y < rows; y += 1) {
		const heat = y / Math.max(1, rows - 1);
		for (let x = 0; x < cols; x += 1) {
			const bowl = 1 - Math.abs(x / Math.max(1, cols - 1) - 0.5) * 2;
			const chance = 0.04 + heat * heat * (0.3 + 0.75 * bowl);
			if (Math.random() > chance) out += " ";
			else if (heat > 0.68 && Math.random() < 0.45) out += pick(EMBERS);
			else out += pick(SPARSE);
		}
		out += "\n";
	}
	return out;
}

export function HeroHearth({ reduceMotion }: { reduceMotion: boolean }) {
	const rootRef = useRef<HTMLDivElement>(null);
	const fieldRef = useRef<HTMLDivElement>(null);
	const [field, setField] = useState("");

	useEffect(() => {
		const root = rootRef.current;
		const host = fieldRef.current;
		if (!root || !host) return;
		const fill = () => {
			const { col, row } = metrics(host);
			const cols = Math.ceil(root.clientWidth / col) + 4;
			const rows = Math.ceil(root.clientHeight / row) + 8;
			setField(fieldFor(cols, rows));
		};
		fill();
		const observer = new ResizeObserver(fill);
		observer.observe(root);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (reduceMotion) return;
		const root = rootRef.current;
		if (!root) return;
		const nodes = [...root.querySelectorAll(".hero__ember")].filter(
			(node): node is HTMLElement => node instanceof HTMLElement,
		);
		if (nodes.length === 0) return;

		let timer = 0;
		let cursor = 0;
		const spark = () => {
			const node = nodes[cursor % nodes.length];
			cursor += 1;
			if (!node) return;
			const x = 50 + (Math.random() - 0.5) * (Math.random() < 0.2 ? 48 : 30);
			const y =
				98 - Math.pow(Math.random(), 0.7) * (Math.random() < 0.15 ? 50 : 28);
			node.textContent = pick(EMBERS);
			node.style.left = `${x}%`;
			node.style.top = `${y}%`;
			node.animate(
				[
					{ opacity: 0, color: "#7a2a12" },
					{ opacity: 1, color: "#ffd27a" },
					{ opacity: 0.7, color: "#ff6a00" },
					{ opacity: 0, color: "#4a120c" },
				],
				{ duration: 1100 + Math.random() * 900, easing: "ease-in-out" },
			);
		};
		const tick = () => {
			if (Math.random() < 0.7) spark();
			if (Math.random() < 0.16) spark();
			timer = window.setTimeout(tick, 320 + Math.random() * 520);
		};
		timer = window.setTimeout(tick, 700);
		return () => {
			window.clearTimeout(timer);
			for (const node of nodes) {
				node.getAnimations().forEach((animation) => animation.cancel());
			}
		};
	}, [reduceMotion]);

	return (
		<div className="hero__hearth" ref={rootRef} aria-hidden="true">
			<div className="hero__hearth-field" ref={fieldRef}>
				{field}
			</div>
			<div className="hero__hearth-grain" />
			{Array.from({ length: POOL }, (_, index) => (
				<span className="hero__ember" key={index} />
			))}
		</div>
	);
}
