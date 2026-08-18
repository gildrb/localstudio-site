import { useEffect, useRef, useState } from "react";

const DIM = "···..:";
const BRIGHT = "*+";
const EMBERS = "*+#";
const POOL = 12;
const REVEAL_MS = 3400;
const MARK_W = 435;
const MARK_H = 287;
const MARK_D =
	"M69.631,114.589c1.816,5.392 4.192,10.684 7.147,15.799c19.153,33.145 56.912,48.899 92.488,41.7c-11.566,-34.404 -44.099,-59.215 -82.38,-59.215c-5.907,0 -11.678,0.591 -17.255,1.716c-12.926,-38.382 2.498,-81.865 38.904,-102.902c36.434,-21.054 81.853,-12.676 108.645,17.747c-3.738,4.249 -7.114,8.926 -10.05,14.014c-19.134,33.144 -13.921,73.709 10.075,100.927c23.984,-27.228 29.18,-67.795 10.032,-100.931c-2.939,-5.086 -6.316,-9.763 -10.056,-14.01c26.78,-30.434 72.195,-38.831 108.637,-17.793c36.43,21.031 51.871,64.537 38.93,102.937c-5.561,-1.119 -11.313,-1.706 -17.202,-1.706c-38.275,0 -70.803,24.802 -82.374,59.198c35.574,7.176 73.316,-8.594 92.453,-41.742c2.944,-5.1 5.312,-10.375 7.123,-15.75c39.726,7.992 69.684,43.115 69.684,85.181c0,47.954 -38.932,86.886 -86.886,86.886c-0.376,0 -0.751,-0.002 -1.126,-0.007l-258.401,-0c-0.377,0.005 -0.754,0.007 -1.132,0.007c-47.954,0 -86.886,-38.932 -86.886,-86.886c0,-42.047 29.931,-77.158 69.631,-85.17Z";

type Star = { i: number; glyph: string; dist: number };

type Sky = {
	blank: string[];
	stars: Star[];
	span: number;
};

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
		top: height - markH * 0.56,
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

function starGlyph(heat: number): string {
	if (heat > 0.7 && Math.random() < 0.2) return pick(EMBERS);
	if (Math.random() < 0.1) return pick(BRIGHT);
	return pick(DIM);
}

function buildSky(
	cols: number,
	rows: number,
	col: number,
	row: number,
	width: number,
	height: number,
): Sky {
	const inside = createInside();
	const box = markLayout(width, height);
	const originX = box.left + box.width * 0.5;
	const originY = box.top + box.height * 0.52;
	const blank: string[] = [];
	const stars: Star[] = [];
	let i = 0;
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
				blank.push(" ");
				i += 1;
				continue;
			}
			const heat = mark.y / MARK_H;
			const bowl = 1 - Math.abs(mark.x / MARK_W - 0.5) * 2;
			const chance = 0.11 + heat * 0.16 + bowl * 0.1;
			if (Math.random() > chance) {
				blank.push(" ");
				i += 1;
				continue;
			}
			blank.push(" ");
			stars.push({
				i,
				glyph: starGlyph(heat),
				dist: Math.hypot(cx - originX, cy - originY),
			});
			i += 1;
		}
		blank.push("\n");
		i += 1;
	}
	stars.sort((a, b) => a.dist - b.dist || a.i - b.i);
	return { blank, stars, span: stars.at(-1)?.dist ?? 1 };
}

function paintSky(sky: Sky, progress: number): string {
	const eased = 1 - (1 - Math.min(1, Math.max(0, progress))) ** 3;
	const cutoff = eased * sky.span;
	const chars = sky.blank.slice();
	for (const star of sky.stars) {
		if (star.dist > cutoff) break;
		chars[star.i] = star.glyph;
	}
	return chars.join("");
}

export function HeroHearth({ reduceMotion }: { reduceMotion: boolean }) {
	const rootRef = useRef<HTMLDivElement>(null);
	const fieldRef = useRef<HTMLDivElement>(null);
	const skyRef = useRef<Sky | null>(null);
	const progressRef = useRef(reduceMotion ? 1 : 0);
	const [field, setField] = useState("");

	useEffect(() => {
		const root = rootRef.current;
		const host = fieldRef.current;
		if (!root || !host) return;
		const fill = () => {
			const { col, row } = metrics(host);
			const cols = Math.ceil(root.clientWidth / col) + 2;
			const rows = Math.ceil(root.clientHeight / row) + 2;
			const sky = buildSky(
				cols,
				rows,
				col,
				row,
				root.clientWidth,
				root.clientHeight,
			);
			skyRef.current = sky;
			if (reduceMotion) progressRef.current = 1;
			setField(paintSky(sky, progressRef.current));
		};
		fill();
		const observer = new ResizeObserver(fill);
		observer.observe(root);
		return () => observer.disconnect();
	}, [reduceMotion]);

	useEffect(() => {
		if (reduceMotion) return;
		const root = rootRef.current;
		if (!root) return;
		const nodes = [...root.querySelectorAll(".hero__ember")].filter(
			(node): node is HTMLElement => node instanceof HTMLElement,
		);
		if (nodes.length === 0) return;
		const inside = createInside();
		const born = performance.now();
		let frame = 0;
		let twinkle = 0;
		let sparkTimer = 0;
		let cursor = 0;

		const draw = (progress: number) => {
			const sky = skyRef.current;
			if (!sky) return;
			progressRef.current = progress;
			setField(paintSky(sky, progress));
		};

		const reveal = (now: number) => {
			const progress = Math.min(1, (now - born) / REVEAL_MS);
			draw(progress);
			if (progress < 1) frame = window.requestAnimationFrame(reveal);
		};

		const twinkleSky = () => {
			const sky = skyRef.current;
			if (!sky || progressRef.current <= 0) {
				twinkle = window.setTimeout(twinkleSky, 180);
				return;
			}
			const visible = Math.max(
				1,
				Math.floor(sky.stars.length * progressRef.current),
			);
			setField((current) => {
				if (!current) return current;
				const next = [...current];
				const flips = 3 + ((Math.random() * 4) | 0);
				for (let n = 0; n < flips; n += 1) {
					const star = sky.stars[(Math.random() * visible) | 0];
					if (!star) continue;
					next[star.i] = Math.random() < 0.14 ? pick(BRIGHT) : pick(DIM);
				}
				return next.join("");
			});
			twinkle = window.setTimeout(twinkleSky, 90 + Math.random() * 120);
		};

		const spark = () => {
			const node = nodes[cursor % nodes.length];
			cursor += 1;
			if (!node) return;
			const box = markLayout(root.clientWidth, root.clientHeight);
			let left = ((box.left + box.width * 0.5) / root.clientWidth) * 100;
			let top = ((box.top + box.height * 0.55) / root.clientHeight) * 100;
			for (let attempt = 0; attempt < 18; attempt += 1) {
				const x = 50 + (Math.random() - 0.5) * (Math.random() < 0.3 ? 56 : 36);
				const y =
					90 - Math.pow(Math.random(), 0.6) * (Math.random() < 0.25 ? 58 : 34);
				const px = (x / 100) * root.clientWidth;
				const py = (y / 100) * root.clientHeight;
				if (
					px < 8 ||
					py < 8 ||
					px > root.clientWidth - 8 ||
					py > root.clientHeight - 8
				) {
					continue;
				}
				const mark = toMark(px, py, box);
				if (!inside(mark.x, mark.y)) continue;
				left = x;
				top = y;
				break;
			}
			node.textContent = pick(EMBERS);
			node.style.left = `${left}%`;
			node.style.top = `${top}%`;
			node.animate(
				[
					{ opacity: 0, color: "rgba(255, 255, 255, 0.2)" },
					{ opacity: 1, color: "#d0d0d0" },
					{ opacity: 0.55, color: "#8f8f8f" },
					{ opacity: 0, color: "rgba(255, 255, 255, 0.2)" },
				],
				{ duration: 1400 + Math.random() * 1000, easing: "ease-in-out" },
			);
		};

		const tick = () => {
			if (progressRef.current > 0.12 && Math.random() < 0.75) spark();
			if (progressRef.current > 0.28 && Math.random() < 0.22) spark();
			sparkTimer = window.setTimeout(tick, 280 + Math.random() * 460);
		};

		frame = window.requestAnimationFrame(reveal);
		twinkle = window.setTimeout(twinkleSky, 240);
		sparkTimer = window.setTimeout(tick, 900);
		return () => {
			window.cancelAnimationFrame(frame);
			window.clearTimeout(twinkle);
			window.clearTimeout(sparkTimer);
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
			{Array.from({ length: POOL }, (_, index) => (
				<span className="hero__ember" key={index} />
			))}
		</div>
	);
}
