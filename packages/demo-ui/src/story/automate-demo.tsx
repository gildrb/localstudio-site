import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./automate-demo.styles.ts";
import { useMemo, useState } from "react";
import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";
import { AUTOMATIONS, DEFAULT_AUTOMATION, type AutomationFilter } from "./automate-data";
import { AutomationListHeader, AutomationControls, AutomationList } from "./automate-list";
import { AutomationDetails } from "./automate-details";

export function AutomateDemo() {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<AutomationFilter>("all");
	const [selectedId, setSelectedId] = useState(DEFAULT_AUTOMATION.id);
	const selected =
		AUTOMATIONS.find((automation) => automation.id === selectedId) ?? DEFAULT_AUTOMATION;
	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return AUTOMATIONS.filter(
			(automation) =>
				(filter === "all" || automation.status === filter) &&
				(!needle || automation.name.toLowerCase().includes(needle)),
		);
	}, [filter, query]);

	return (
		<DemoShell scene="automate" label="Automations" crop={STORY_CROP}>
			<div {...stylex.props(demoStyles.reset, styles.div71)}>
				<section {...stylex.props(demoStyles.reset, styles.section72)}>
					<AutomationListHeader />

					<AutomationControls
						query={query}
						filter={filter}
						setQuery={setQuery}
						setFilter={setFilter}
					/>

					<AutomationList
						visible={visible}
						selectedId={selected.id}
						setSelectedId={setSelectedId}
					/>
				</section>

				<AutomationDetails selected={selected} />
			</div>
		</DemoShell>
	);
}
