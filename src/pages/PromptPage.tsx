import { useState } from "react";
import setupPrompt from "../content/setup-prompt.txt?raw";
import { CopyIcon } from "../components/CopyIcon";
import { CtaPair } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

export function PromptPage() {
	const [expanded, setExpanded] = useState(false);

	return (
		<PageShell>
			<PageIntro
				id="prompt-title"
				layout="left"
				title="Give this to any coding model."
				description="It will inspect the machine, choose the right runtime, install Local Studio, and prove a real inference request works."
				actions={
					<CtaPair secondary={{ href: "/docs", label: "Read the docs" }} />
				}
			/>
			<section className="section-width pb-30" aria-label="Setup handoff">
				<section
					className="prompt-block relative rounded-2xl border border-white/15"
					aria-label="Portable setup prompt"
					data-expanded={expanded ? "true" : "false"}
				>
					<CopyIcon text={setupPrompt} />
					<pre
						id="setup-prompt"
						className="prompt-block__pre w-full min-w-0 overflow-hidden whitespace-pre-wrap break-words p-8 pr-20 font-mono text-sm/5 text-white/80 max-[620px]:p-5 max-[620px]:pr-12"
					>
						<code>{setupPrompt}</code>
					</pre>
					<button
						className="prompt-block__toggle"
						type="button"
						aria-expanded={expanded}
						aria-controls="setup-prompt"
						onClick={() => setExpanded((value) => !value)}
					>
						{expanded ? "Show less" : "Show more"}
					</button>
				</section>
			</section>
		</PageShell>
	);
}
