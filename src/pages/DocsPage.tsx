import { docsPath, routes, setupPath } from "../domain/route";
import { CtaPair } from "../components/Links";
import { DocsLayout } from "../components/DocsLayout";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { introduction, prerequisites, quickStart, setupWizard } from "./docs/installation";
import { runtimeBackends, agentRuntime } from "./docs/runtime";
import { remoteLan, validation } from "./docs/operations";

const toc = [
	["Prerequisites", "prerequisites"],
	["Quick Start", "quick-start"],
	["Setup Wizard", "setup-wizard"],
	["Runtime Backends", "runtime-backends"],
	["Agent Runtime", "agent-runtime"],
	["Remote / LAN", "remote-lan"],
	["Validation", "validation"],
] as const;

export function DocsPage() {
	return (
		<PageShell>
			<PageIntro
				layout="left"
				id="docs-title"
				title={routes[docsPath].heading}
				description="Install the controller and desktop workspace, choose a runtime, launch a model, and verify local inference."
				actions={<CtaPair secondary={{ href: setupPath, label: "Setup Prompt" }} />}
			/>
			<DocsLayout toc={toc} path={docsPath} label="Documentation sections">
				{introduction}
				{prerequisites}

				{quickStart}

				{setupWizard}

				{runtimeBackends}

				{agentRuntime}

				{remoteLan}

				{validation}
			</DocsLayout>
		</PageShell>
	);
}
