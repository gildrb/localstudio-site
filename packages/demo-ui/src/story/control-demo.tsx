import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { TokenActivityHeatmap } from "../usage/token-activity-heatmap";
import { styles } from "./control-demo.styles.ts";
import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";

function demoDays(): Array<{
	date: string;
	requests: number;
	total_tokens: number;
}> {
	const days = [];
	const end = new Date(Date.UTC(2026, 7, 18));
	for (let offset = 364; offset >= 0; offset -= 1) {
		const day = new Date(end);
		day.setUTCDate(end.getUTCDate() - offset);
		const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
		const wave = (offset * 17) % 23;
		const active = !weekend && wave > 3;
		days.push({
			date: day.toISOString().slice(0, 10),
			requests: active ? 12 + wave : 0,
			total_tokens: active ? 4200 + wave * 380 : 0,
		});
	}
	return days;
}

const DAYS = demoDays();

export function ControlDemo() {
	return (
		<DemoShell scene="control" label="Usage controller" crop={STORY_CROP}>
			<div {...stylex.props(demoStyles.reset, styles.div32)}>
				<h3 {...stylex.props(demoStyles.reset, styles.h333)}>Usage</h3>
				<p {...stylex.props(demoStyles.reset, styles.p34)}>
					Proxied through this controller
				</p>
				<p {...stylex.props(demoStyles.reset, styles.p37)}>1.28M</p>
				<dl {...stylex.props(demoStyles.reset, styles.dl40)}>
					<Stat label="Requests" value="2.3K" />
					<Stat label="Sessions" value="94" />
					<Stat label="Active days" value="86" />
				</dl>
				<section {...stylex.props(demoStyles.reset, styles.section45)}>
					<h4 {...stylex.props(demoStyles.reset, styles.h446)}>
						Token Activity
					</h4>
					<TokenActivityHeatmap daily={DAYS} period="daily" />
				</section>
			</div>
		</DemoShell>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div {...stylex.props(demoStyles.reset, styles.div58)}>
			<dd {...stylex.props(demoStyles.reset, styles.dd59)}>{value}</dd>
			<dt {...stylex.props(demoStyles.reset, styles.dt62)}>{label}</dt>
		</div>
	);
}
