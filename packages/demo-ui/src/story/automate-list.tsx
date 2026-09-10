import { styles as listStyles } from "./automate-list.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./automate-demo.styles.ts";
import { Clock, Plus, Search } from "../ui/icon-registry";
import { AUTOMATION_FILTERS, type AutomationFilter, type DemoAutomation } from "./automate-data";

export function AutomationListHeader() {
	return (
		<header {...stylex.props(demoStyles.reset, styles.header73)}>
			<div {...stylex.props(demoStyles.reset, styles.div74)}>
				<h2 {...stylex.props(demoStyles.reset, listStyles.h175)}>Automations</h2>
				<p {...stylex.props(demoStyles.reset, styles.p78)}>3 scheduled tasks</p>
			</div>
			<button
				type="button"
				{...stylex.props(demoStyles.reset, demoStyles.controlReset, listStyles.button84)}
			>
				<Plus {...stylex.props(demoStyles.reset, styles.plus86, styles.lucideScale)} /> New
			</button>
		</header>
	);
}

export function AutomationControls({
	query,
	filter,
	setQuery,
	setFilter,
}: {
	readonly query: string;
	readonly filter: AutomationFilter;
	readonly setQuery: (value: string) => void;
	readonly setFilter: (value: AutomationFilter) => void;
}) {
	return (
		<div {...stylex.props(demoStyles.reset, listStyles.div90)}>
			<label {...stylex.props(demoStyles.reset, listStyles.label91)}>
				<span {...stylex.props(demoStyles.reset, listStyles.span92)}>Search automations</span>
				<Search {...stylex.props(demoStyles.reset, listStyles.search93, styles.lucideScale)} />
				<input
					type="search"
					name="automation-search"
					autoComplete="off"
					value={query}
					onChange={(event: { readonly target: { readonly value: string } }) => {
						setQuery(event.target.value);
					}}
					placeholder="Search automations, e.g. health checks…"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, listStyles.element98)}
				/>
			</label>
			<AutomationFilters filter={filter} setFilter={setFilter} />
		</div>
	);
}

function AutomationFilters({
	filter,
	setFilter,
}: {
	readonly filter: AutomationFilter;
	readonly setFilter: (value: AutomationFilter) => void;
}) {
	return (
		<div {...stylex.props(demoStyles.reset, listStyles.div101)}>
			{AUTOMATION_FILTERS.map((item) => (
				<button
					key={item.id}
					type="button"
					onClick={() => {
						setFilter(item.id);
					}}
					aria-pressed={filter === item.id}
					{...stylex.props(
						demoStyles.reset,
						demoStyles.controlReset,
						listStyles.filter,
						filter === item.id ? listStyles.filterActive : listStyles.filterIdle,
					)}
				>
					{item.label}
				</button>
			))}
		</div>
	);
}

export function AutomationList({
	visible,
	selectedId,
	setSelectedId,
}: {
	readonly visible: readonly DemoAutomation[];
	readonly selectedId: string;
	readonly setSelectedId: (value: string) => void;
}) {
	return (
		<ul {...stylex.props(demoStyles.reset, styles.ul116)}>
			{visible.map((automation, index) => {
				const active = automation.id === selectedId;
				return (
					<li
						key={automation.id}
						{...stylex.props(
							demoStyles.reset,
							index < visible.length - 1 && listStyles.automationDivider,
						)}
					>
						<button
							type="button"
							onClick={() => {
								setSelectedId(automation.id);
							}}
							{...stylex.props(
								demoStyles.reset,
								demoStyles.controlReset,
								listStyles.automationRow,
								active ? listStyles.automationActive : listStyles.automationIdle,
							)}
						>
							<AutomationSummary automation={automation} />
						</button>
					</li>
				);
			})}
		</ul>
	);
}

function AutomationSummary({ automation }: { readonly automation: DemoAutomation }) {
	return (
		<span {...stylex.props(demoStyles.reset, listStyles.span126)}>
			<span
				{...stylex.props(
					demoStyles.reset,
					listStyles.statusDot,
					automation.status === "active" ? listStyles.statusDotActive : listStyles.statusDotIdle,
				)}
			/>
			<span {...stylex.props(demoStyles.reset, listStyles.span130)}>
				<span {...stylex.props(demoStyles.reset, listStyles.span131)}>{automation.name}</span>
				<span {...stylex.props(demoStyles.reset, listStyles.span134)}>
					<Clock {...stylex.props(demoStyles.reset, listStyles.clock135, styles.lucideScale)} />
					{automation.schedule}
				</span>
				<span {...stylex.props(demoStyles.reset, listStyles.span138)}>
					{automation.status === "paused" ? "Paused" : `Next run ${automation.nextRun}`}
				</span>
			</span>
		</span>
	);
}
