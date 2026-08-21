import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";

const PRIMARY_METRICS = [
	["Decode", "41.8", "tok/s", "session max 46.2"],
	["TTFT", "94", "ms", "p95 128"],
	["Prefill", "286", "t/s", "session max 312"],
	["Requests", "2", "live", "peak 7"],
	["VRAM", "18.6", "GB", "of 64 GB"],
	["Power", "124", "W", "peak 136"],
] as const;
const SECONDARY_METRICS = [
	["KV cache", "8.4", "GB", "peak 10.1"],
	["Queue", "0", "waiting", "nothing waiting"],
	["Uptime", "6h 42m", "", "current serve"],
	["Tokens", "1.28M", "", "lifetime"],
	["Served", "2.3K", "", "since first launch"],
	["Energy", "0.84", "kWh", "current serve"],
] as const;

export function WorkDemo() {
	return (
		<DemoShell scene="work" label="Local Studio status" crop={STORY_CROP}>
			<div className="min-h-0 w-[820px] overflow-hidden px-6 py-5 max-md:w-[680px] max-md:px-4 max-md:py-4">
				<header className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2 text-[length:var(--fs-sm)]">
							<span className="inline-flex h-1.5 w-1.5 rounded-full bg-(--ui-accent)" />
							<span className="font-medium text-(--ui-accent)">Ready</span>
						</div>
						<h3 className="mt-1.5 truncate text-[length:var(--fs-3xl)] font-semibold leading-tight tracking-[-0.01em]">
							Qwen3.8-27B · MLX
						</h3>
					</div>
					<div className="flex items-center gap-1.5">
						<button
							type="button"
							className="h-7 rounded-full bg-(--fg)/5 px-3 text-[length:var(--fs-sm)]"
						>
							Models⌄
						</button>
						<button
							type="button"
							className="h-7 rounded-full bg-(--fg)/5 px-3 text-[length:var(--fs-sm)]"
						>
							Logs
						</button>
					<button type="button" className="h-7 rounded-full bg-(--fg)/5 px-3 text-[length:var(--fs-sm)]">
						Bench
					</button>
					</div>
				</header>
				<div className="mt-5 border-b border-(--separator) pb-5">
					<dl className="grid grid-cols-6 gap-x-6 gap-y-4">
						{PRIMARY_METRICS.map(([label, value, unit, detail]) => (
							<StatusMetric
								key={label}
								label={label}
								value={value}
								unit={unit}
								detail={detail}
							/>
						))}
					</dl>
					<dl className="mt-4 grid grid-cols-6 gap-x-6 border-t border-(--separator)/55 pt-4">
						{SECONDARY_METRICS.map(([label, value, unit, detail]) => (
							<StatusMetric
								key={label}
								label={label}
								value={value}
								unit={unit}
								detail={detail}
								quiet
							/>
						))}
					</dl>
				</div>
				<div className="mt-6 grid grid-cols-3 gap-5 border-t border-(--separator) pt-4">
					<TrendPanel label="Throughput" unit="tok/s" values="prefill 286   decode 41.8" points="2,29 13,25 24,27 35,17 46,20 57,11 68,14 79,6 90,10 100,4" />
					<TrendPanel label="TTFT" unit="ms" values="p50 94" points="2,8 13,14 24,11 35,19 46,13 57,21 68,17 79,24 90,18 100,20" />
					<TrendPanel label="Requests" unit="live" values="running 2" points="2,28 13,28 24,19 35,19 46,9 57,19 68,19 79,10 90,19 100,19" />
				</div>
				<section className="mt-5 border-t border-(--separator) px-2 py-4">
					<div className="flex items-center gap-4 text-[length:var(--fs-sm)]">
						<span className="font-medium text-(--hl2)">GPUs <span className="font-mono text-[length:var(--fs-xs)] text-(--dim)/65">2</span></span>
						<span className="h-[3px] min-w-20 flex-1 overflow-hidden bg-(--dim)/15"><span className="block h-full w-[62%] bg-(--ui-accent)" /></span>
						<span className="font-mono">48 / 64 GB</span>
						<span className="ml-auto font-mono text-[length:var(--fs-xs)] text-(--dim)">util 72% · temp 61° · pwr 124 W</span>
					</div>
				</section>
				<section className="border-t border-(--separator) px-2 pt-4">
					<div className="flex items-center justify-between gap-4">
						<h4 className="text-[length:var(--fs-sm)] font-medium text-(--hl2)">
							Controller logs
						</h4>
						<div className="flex items-center gap-3 text-[length:var(--fs-xs)] text-(--dim)">
							<span className="rounded-full bg-(--fg)/5 px-5 py-1.5 font-mono">Filter</span>
							<span>24 lines</span>
							<span className="text-(--accent)">Open</span>
						</div>
					</div>
					<div className="mt-3 h-24 border border-(--separator) p-3 font-mono text-[length:var(--fs-xs)] leading-5 text-(--dim)">
						<p><span className="text-(--ui-accent)">08:42:16</span> model ready on 2 GPUs</p>
						<p><span className="text-(--ui-accent)">08:42:21</span> POST /v1/chat/completions 200 · 94 ms TTFT</p>
						<p><span className="text-(--ui-accent)">08:42:24</span> 1,486 tokens · 41.8 tok/s</p>
					</div>
				</section>
			</div>
		</DemoShell>
	);
}

function StatusMetric({
	label,
	value,
	unit,
	detail,
	quiet = false,
}: {
	label: string;
	value: string;
	unit: string;
	detail: string;
	quiet?: boolean;
}) {
	return (
		<div className="min-w-0 overflow-hidden">
			<dt className="truncate text-[length:var(--fs-xs)] text-(--dim)">
				{label}
			</dt>
			<dd
				className={`mt-1 flex items-baseline gap-1 font-semibold leading-none tabular-nums ${quiet ? "text-[length:var(--fs-lg)]" : "text-[length:var(--fs-2xl)]"}`}
			>
				<span>{value}</span>
				{unit ? (
					<span className="text-[length:var(--fs-xs)] font-normal text-(--dim)">
						{unit}
					</span>
				) : null}
			</dd>
			{detail ? (
				<dd className="mt-1 truncate text-[length:var(--fs-xs)] text-(--dim)/75">
					{detail}
				</dd>
			) : null}
		</div>
	);
}

function TrendPanel({ label, unit, values, points }: { label: string; unit: string; values: string; points: string }) {
	return (
		<section className="min-w-0">
			<div className="flex items-baseline justify-between gap-2">
				<span className="text-[length:var(--fs-sm)] font-medium text-(--hl2)">{label} <span className="text-[length:var(--fs-xs)] font-normal text-(--dim)/50">{unit}</span></span>
				<span className="font-mono text-[length:var(--fs-xs)] text-(--dim)">{values}</span>
			</div>
			<div className="relative mt-2 grid h-24 grid-rows-3 border-b border-(--fg)/75">
				<span className="border-t border-(--border)/40" /><span className="border-t border-(--border)/40" /><span className="border-t border-(--border)/40" />
				<svg aria-hidden="true" viewBox="0 0 100 36" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible text-(--ui-accent)"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>
			</div>
			<p className="mt-1 text-[length:var(--fs-2xs)] text-(--dim)/55">last 5 minutes</p>
		</section>
	);
}
