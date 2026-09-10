import { styles as metricStyles } from "./work-metrics.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";
import { styles } from "./work-demo.styles.ts";
import { ChevronDown } from "../ui/icon-registry";

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
			<div {...stylex.props(demoStyles.reset, styles.div24)}>
				<WorkHeader />
				<WorkMetrics />
				<WorkTrends />
				<WorkGpu />
				<WorkLogs />
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
	readonly label: string;
	readonly value: string;
	readonly unit: string;
	readonly detail: string;
	readonly quiet?: boolean;
}) {
	return (
		<div {...stylex.props(demoStyles.reset, metricStyles.div127)}>
			<dt {...stylex.props(demoStyles.reset, metricStyles.dt128)}>{label}</dt>
			<dd
				{...stylex.props(
					demoStyles.reset,
					metricStyles.metric,
					quiet ? metricStyles.metricQuiet : metricStyles.metricLoud,
				)}
			>
				<span {...stylex.props(demoStyles.reset)}>{value}</span>
				{unit ? (
					<span {...stylex.props(demoStyles.reset, metricStyles.span136)}>{unit}</span>
				) : null}
			</dd>
			{detail ? <dd {...stylex.props(demoStyles.reset, metricStyles.dd142)}>{detail}</dd> : null}
		</div>
	);
}

function TrendPanel({
	label,
	unit,
	values,
	points,
}: {
	readonly label: string;
	readonly unit: string;
	readonly values: string;
	readonly points: string;
}) {
	return (
		<section {...stylex.props(demoStyles.reset, metricStyles.section152)}>
			<div {...stylex.props(demoStyles.reset, metricStyles.div153)}>
				<span {...stylex.props(demoStyles.reset, styles.h493)}>
					{label} <span {...stylex.props(demoStyles.reset, metricStyles.span154)}>{unit}</span>
				</span>
				<span {...stylex.props(demoStyles.reset, metricStyles.span155)}>{values}</span>
			</div>
			<div {...stylex.props(demoStyles.reset, metricStyles.div157)}>
				<span {...stylex.props(demoStyles.reset, metricStyles.span158)} />
				<span {...stylex.props(demoStyles.reset, metricStyles.span158)} />
				<span {...stylex.props(demoStyles.reset, metricStyles.span158)} />
				<svg
					aria-hidden="true"
					viewBox="0 0 100 36"
					preserveAspectRatio="none"
					{...stylex.props(demoStyles.reset, metricStyles.svg159)}
				>
					<polyline
						points={points}
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
			</div>
			<p {...stylex.props(demoStyles.reset, metricStyles.p161)}>last 5 minutes</p>
		</section>
	);
}

function WorkHeader() {
	return (
		<header {...stylex.props(demoStyles.reset, styles.header25)}>
			<div {...stylex.props(demoStyles.reset, styles.div26)}>
				<div {...stylex.props(demoStyles.reset, styles.div27)}>
					<span {...stylex.props(demoStyles.reset, styles.span28)} />
					<span {...stylex.props(demoStyles.reset, styles.span29)}>Ready</span>
				</div>
				<h3 {...stylex.props(demoStyles.reset, styles.h331)}>Qwen3.8-27B · MLX</h3>
			</div>
			<div {...stylex.props(demoStyles.reset, styles.div35)}>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button38)}
				>
					Models
					<ChevronDown {...stylex.props(demoStyles.reset, styles.modelChevron)} />
				</button>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button38)}
				>
					Logs
				</button>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button38)}
				>
					Bench
				</button>
			</div>
		</header>
	);
}

function WorkMetrics() {
	return (
		<div {...stylex.props(demoStyles.reset, styles.div53)}>
			<dl {...stylex.props(demoStyles.reset, styles.dl54)}>
				{PRIMARY_METRICS.map(([label, value, unit, detail]) => (
					<StatusMetric key={label} label={label} value={value} unit={unit} detail={detail} />
				))}
			</dl>
			<dl {...stylex.props(demoStyles.reset, styles.dl65)}>
				{SECONDARY_METRICS.map(([label, value, unit, detail]) => (
					<StatusMetric key={label} label={label} value={value} unit={unit} detail={detail} quiet />
				))}
			</dl>
		</div>
	);
}

function WorkTrends() {
	return (
		<div {...stylex.props(demoStyles.reset, styles.div78)}>
			<TrendPanel
				label="Throughput"
				unit="tok/s"
				values="prefill 286   decode 41.8"
				points="2,29 13,25 24,27 35,17 46,20 57,11 68,14 79,6 90,10 100,4"
			/>
			<TrendPanel
				label="TTFT"
				unit="ms"
				values="p50 94"
				points="2,8 13,14 24,11 35,19 46,13 57,21 68,17 79,24 90,18 100,20"
			/>
			<TrendPanel
				label="Requests"
				unit="live"
				values="running 2"
				points="2,28 13,28 24,19 35,19 46,9 57,19 68,19 79,10 90,19 100,19"
			/>
		</div>
	);
}

function WorkGpu() {
	return (
		<section {...stylex.props(demoStyles.reset, styles.section83)}>
			<div {...stylex.props(demoStyles.reset, styles.div84)}>
				<span {...stylex.props(demoStyles.reset, styles.span85)}>
					GPUs <span {...stylex.props(demoStyles.reset, styles.span852)}>2</span>
				</span>
				<span {...stylex.props(demoStyles.reset, styles.span86)}>
					<span {...stylex.props(demoStyles.reset, styles.span862)} />
				</span>
				<span {...stylex.props(demoStyles.reset, styles.span87)}>48 / 64 GB</span>
				<span {...stylex.props(demoStyles.reset, styles.span88)}>
					util 72% · temp 61° · pwr 124 W
				</span>
			</div>
		</section>
	);
}

function WorkLogs() {
	return (
		<section {...stylex.props(demoStyles.reset, styles.section91)}>
			<div {...stylex.props(demoStyles.reset, styles.div92)}>
				<h4 {...stylex.props(demoStyles.reset, styles.h493)}>Controller Logs</h4>
				<div {...stylex.props(demoStyles.reset, styles.div96)}>
					<span {...stylex.props(demoStyles.reset, styles.span97)}>Filter</span>
					<span {...stylex.props(demoStyles.reset)}>24 lines</span>
					<span {...stylex.props(demoStyles.reset, styles.span99)}>Open</span>
				</div>
			</div>
			<div {...stylex.props(demoStyles.reset, styles.div102)}>
				<p {...stylex.props(demoStyles.reset)}>
					<span {...stylex.props(demoStyles.reset, styles.span103)}>08:42:16</span> model ready on 2
					GPUs
				</p>
				<p {...stylex.props(demoStyles.reset)}>
					<span {...stylex.props(demoStyles.reset, styles.span103)}>08:42:21</span> POST
					/v1/chat/completions 200 · 94 ms TTFT
				</p>
				<p {...stylex.props(demoStyles.reset)}>
					<span {...stylex.props(demoStyles.reset, styles.span103)}>08:42:24</span> 1,486 tokens ·
					41.8 tok/s
				</p>
			</div>
		</section>
	);
}
