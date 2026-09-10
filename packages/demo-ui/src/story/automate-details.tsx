import { styles as formStyles } from "./automate-form.styles.ts";
import { styles as detailStyles } from "./automate-details.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./automate-demo.styles.ts";
import { Check, Clock, Pause, Play } from "../ui/icon-registry";
import type { DemoAutomation } from "./automate-data";

export function AutomationDetails({ selected }: { readonly selected: DemoAutomation }) {
	return (
		<section {...stylex.props(demoStyles.reset, formStyles.section152)}>
			<AutomationDetailsHeader selected={selected} />

			<div {...stylex.props(demoStyles.reset, formStyles.div178)}>
				<div {...stylex.props(demoStyles.reset, formStyles.div179)}>
					<AutomationFields selected={selected} />
					<AutomationSchedule schedule={selected.schedule} />
					<AutomationModel />
					<AutomationRecentRuns />
				</div>
			</div>
		</section>
	);
}

function AutomationDetailsHeader({ selected }: { readonly selected: DemoAutomation }) {
	return (
		<header {...stylex.props(demoStyles.reset, formStyles.header153)}>
			<div {...stylex.props(demoStyles.reset, styles.div74)}>
				<h3 {...stylex.props(demoStyles.reset, formStyles.h2155)}>{selected.name}</h3>
				<p {...stylex.props(demoStyles.reset, styles.p78)}>
					{selected.status === "active" ? selected.schedule : "Paused"}
				</p>
			</div>
			<div {...stylex.props(demoStyles.reset, formStyles.div162)}>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, formStyles.button165)}
				>
					<Pause {...stylex.props(demoStyles.reset, styles.plus86, styles.lucideScale)} /> Pause
				</button>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, formStyles.button171)}
				>
					<Play {...stylex.props(demoStyles.reset, styles.plus86, styles.lucideScale)} /> Run Now
				</button>
			</div>
		</header>
	);
}

function AutomationSchedule({ schedule }: { readonly schedule: string }) {
	return (
		<section {...stylex.props(demoStyles.reset, detailStyles.section201)}>
			<div {...stylex.props(demoStyles.reset, styles.div202)}>
				<Clock {...stylex.props(demoStyles.reset, detailStyles.clock203, styles.lucideScale)} />
				<div {...stylex.props(demoStyles.reset)}>
					<h4 {...stylex.props(demoStyles.reset, styles.h3205)}>Schedule</h4>
					<p {...stylex.props(demoStyles.reset, styles.p78)}>{schedule}</p>
				</div>
			</div>
			<div {...stylex.props(demoStyles.reset, detailStyles.div213)}>
				<span {...stylex.props(demoStyles.reset, detailStyles.span214)}>Daily</span>
				<span {...stylex.props(demoStyles.reset, detailStyles.span217)}>08:00</span>
				<span {...stylex.props(demoStyles.reset, detailStyles.span217)}>Weekdays only</span>
			</div>
		</section>
	);
}

function AutomationModel() {
	return (
		<div {...stylex.props(demoStyles.reset, detailStyles.div225)}>
			<div {...stylex.props(demoStyles.reset)}>
				<p {...stylex.props(demoStyles.reset, detailStyles.p227)}>Model</p>
				<p {...stylex.props(demoStyles.reset, detailStyles.p228)}>Qwen3.8-27B</p>
			</div>
			<div {...stylex.props(demoStyles.reset)}>
				<p {...stylex.props(demoStyles.reset, detailStyles.p227)}>Working directory</p>
				<p {...stylex.props(demoStyles.reset, detailStyles.p234)}>~/Projects/local-studio</p>
			</div>
		</div>
	);
}

function AutomationRecentRuns() {
	return (
		<section {...stylex.props(demoStyles.reset, detailStyles.section239)}>
			<h4 {...stylex.props(demoStyles.reset, styles.h3205)}>Recent Runs</h4>
			<div {...stylex.props(demoStyles.reset, detailStyles.div243)}>
				<span {...stylex.props(demoStyles.reset, styles.div202)}>
					<Check {...stylex.props(demoStyles.reset, detailStyles.check245, styles.lucideScale)} />
					<span {...stylex.props(demoStyles.reset)}>
						<strong {...stylex.props(demoStyles.reset, detailStyles.strong247)}>Completed</strong>
						<span {...stylex.props(demoStyles.reset, detailStyles.span248)}>
							Today at 08:00 · 42 seconds
						</span>
					</span>
				</span>
				<span {...stylex.props(demoStyles.reset, detailStyles.span253)}>8.4K tokens</span>
			</div>
		</section>
	);
}

function AutomationFields({ selected }: { readonly selected: DemoAutomation }) {
	return (
		<>
			<label {...stylex.props(demoStyles.reset, formStyles.label180)}>
				Name
				<input
					readOnly
					value={selected.name}
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, formStyles.input185)}
				/>
			</label>
			<label {...stylex.props(demoStyles.reset, formStyles.label180)}>
				Task
				<textarea
					readOnly
					value={selected.prompt}
					rows={3}
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, formStyles.textarea194)}
				/>
				<span {...stylex.props(demoStyles.reset, formStyles.span196)}>
					Local Studio sends this instruction to the selected model on every run.
				</span>
			</label>
		</>
	);
}
