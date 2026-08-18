import { useEffect, useRef, useState } from "react";

const SPARSE = "    ·.:";
const EMBERS = "*+#";
const POOL = 10;
const STAR_POOL = 20;
const STAR_GLYPHS = "*+·";
const MARK_W = 435;
const MARK_H = 287;
const MARK_D =
	"M69.631,114.589c1.816,5.392 4.192,10.684 7.147,15.799c19.153,33.145 56.912,48.899 92.488,41.7c-11.566,-34.404 -44.099,-59.215 -82.38,-59.215c-5.907,0 -11.678,0.591 -17.255,1.716c-12.926,-38.382 2.498,-81.865 38.904,-102.902c36.434,-21.054 81.853,-12.676 108.645,17.747c-3.738,4.249 -7.114,8.926 -10.05,14.014c-19.134,33.144 -13.921,73.709 10.075,100.927c23.984,-27.228 29.18,-67.795 10.032,-100.931c-2.939,-5.086 -6.316,-9.763 -10.056,-14.01c26.78,-30.434 72.195,-38.831 108.637,-17.793c36.43,21.031 51.871,64.537 38.93,102.937c-5.561,-1.119 -11.313,-1.706 -17.202,-1.706c-38.275,0 -70.803,24.802 -82.374,59.198c35.574,7.176 73.316,-8.594 92.453,-41.742c2.944,-5.1 5.312,-10.375 7.123,-15.75c39.726,7.992 69.684,43.115 69.684,85.181c0,47.954 -38.932,86.886 -86.886,86.886c-0.376,0 -0.751,-0.002 -1.126,-0.007l-258.401,-0c-0.377,0.005 -0.754,0.007 -1.132,0.007c-47.954,0 -86.886,-38.932 -86.886,-86.886c0,-42.047 29.931,-77.158 69.631,-85.17Z";

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

function markLayout(width: number, height: number) {
	const markW = width <= 900 ? Math.max(1400, width * 3.6) : width;
	const markH = markW * (MARK_H / MARK_W);
	return {
		left: (width - markW) / 2,
		top: height - markH * (width <= 900 ? 0.56 : 1),
		width: markW,
		height: markH,
	};
}

function toMark(
	x: number,
	y: number,
	box: { left: number; top: number; width: number; height: number },
) {
	return {
		x: ((x - box.left) / box.width) * MARK_W,
		y: ((y - box.top) / box.height) * MARK_H,
	};
}

function createInside(): (x: number, y: number) => boolean {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!(ctx instanceof CanvasRenderingContext2D)) return () => false;
	const path = new Path2D(MARK_D);
	return (x, y) => ctx.isPointInPath(path, x, y, "evenodd");
}

function sampleCell(
	root: HTMLElement,
	inside: (x: number, y: number) => boolean,
	col: number,
	row: number,
	wide: boolean,
): { x: number; y: number } | null {
	const box = markLayout(root.clientWidth, root.clientHeight);
	const cols = Math.floor(root.clientWidth / col);
	const rows = Math.floor(root.clientHeight / row);
	for (let attempt = 0; attempt < 14; attempt += 1) {
		const cx = wide
			? (Math.random() * cols) | 0
			: Math.floor(
					cols / 2 +
						(Math.random() - 0.5) * (Math.random() < 0.2 ? 0.48 : 0.3) * cols,
				);
		const cy = wide
			? (Math.random() * rows) | 0
			: rows -
				1 -
				Math.floor(
					Math.pow(Math.random(), 0.7) *
						(Math.random() < 0.15 ? 0.5 : 0.28) *
						rows,
				);
		if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) continue;
		const px = cx * col + col / 2;
		const py = cy * row + row / 2;
		const mark = toMark(px, py, box);
		if (!inside(mark.x, mark.y)) continue;
		return { x: px, y: py };
	}

	return null;
}

function fieldFor(
	cols: number,
	rows: number,
	col: number,
	row: number,
	width: number,
	height: number,
): string {
	const inside = createInside();
	const box = markLayout(width, height);
	let out = "";
	for (let y = 0; y < rows; y += 1) {
		const top = y * row;
		const cy = top + row / 2;
		for (let x = 0; x < cols; x += 1) {
			const left = x * col;
			const cx = left + col / 2;
			const mark = toMark(cx, cy, box);
			const fits =
				left >= 0 && top >= 0 && left + col <= width && top + row <= height;
			if (!fits || !inside(mark.x, mark.y)) {
				out += " ";
				continue;
			}
			const heat = mark.y / MARK_H;
			const bowl = 1 - Math.abs(mark.x / MARK_W - 0.5) * 2;
			const chance = 0.08 + heat * heat * (0.28 + 0.7 * bowl);
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
	const cellRef = useRef({ col: 8, row: 18 });
	const [field, setField] = useState("");

	useEffect(() => {
		const root = rootRef.current;
		const host = fieldRef.current;
		if (!root || !host) return;
		const fill = () => {
			const { col, row } = metrics(host);
			cellRef.current = { col, row };
			const cols = Math.ceil(root.clientWidth / col) + 2;
			const rows = Math.ceil(root.clientHeight / row) + 2;
			setField(
				fieldFor(cols, rows, col, row, root.clientWidth, root.clientHeight),
			);
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
		const inside = createInside();

		let timer = 0;
		let cursor = 0;
		const spark = () => {
			const node = nodes[cursor % nodes.length];
			cursor += 1;
			if (!node) return;
			const { col, row } = cellRef.current;
			const point = sampleCell(root, inside, col, row, false);
			if (!point) return;
			node.textContent = pick(EMBERS);
			node.style.left = `${point.x}px`;
			node.style.top = `${point.y}px`;
			node.animate(
				[
					{ opacity: 0, color: "rgba(255, 255, 255, 0.22)" },
					{ opacity: 1, color: "#8f8f8f" },
					{ opacity: 0.65, color: "#6a6a6a" },
					{ opacity: 0, color: "rgba(255, 255, 255, 0.22)" },
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

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		const stars = [...root.querySelectorAll(".hero__star")].filter(
			(node): node is HTMLElement => node instanceof HTMLElement,
		);
		if (stars.length === 0) return;
		const inside = createInside();

		const place = (node: HTMLElement) => {
			const { col, row } = cellRef.current;
			const point = sampleCell(root, inside, col, row, true);
			if (!point) return;
			node.textContent = pick(STAR_GLYPHS);
			node.style.left = `${point.x}px`;
			node.style.top = `${point.y}px`;
		};
		const placeAll = () => {
			for (const star of stars) place(star);
		};
		placeAll();
		const observer = new ResizeObserver(placeAll);
		observer.observe(root);

		if (reduceMotion) {
			return () => observer.disconnect();
		}

		let timer = 0;
		let cursor = 0;
		const twinkle = () => {
			const node = stars[cursor % stars.length];
			cursor += 1;
			if (!node) return;
			place(node);
			node.animate(
				[
					{ opacity: 0.42, transform: "translate(-50%, -50%) scale(0.9)" },
					{
						opacity: 1,
						transform: "translate(-50%, -50%) scale(1.2)",
						offset: 0.4,
					},
					{ opacity: 0.42, transform: "translate(-50%, -50%) scale(0.9)" },
				],
				{ duration: 1500 + Math.random() * 1700, easing: "ease-in-out" },
			);
		};
		const tick = () => {
			twinkle();
			if (Math.random() < 0.45) twinkle();
			timer = window.setTimeout(tick, 340 + Math.random() * 620);
		};
		timer = window.setTimeout(tick, 900);
		return () => {
			observer.disconnect();
			window.clearTimeout(timer);
			for (const node of stars) {
				node.getAnimations().forEach((animation) => animation.cancel());
			}
		};
	}, [reduceMotion]);

	return (
		<div className="hero__hearth" ref={rootRef} aria-hidden="true">
			<div className="hero__hearth-field" ref={fieldRef}>
				{field}
			</div>
			{Array.from({ length: POOL }, (_, index) => (
				<span className="hero__ember" key={index} />
			))}
			{Array.from({ length: STAR_POOL }, (_, index) => (
				<span className="hero__star" key={index} />
			))}
		</div>
	);
}
