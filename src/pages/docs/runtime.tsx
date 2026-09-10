import * as stylex from "@stylexjs/stylex";
import { baseStyles } from "../../styles/base-styles";
import { styles } from "../../styles/pages-styles";

export const runtimeBackends = (
	<section id="runtime-backends" {...stylex.props(baseStyles.element, styles.docsSection)}>
		<h2
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.headingTwo,
				styles.docsSectionHeading,
			)}
		>
			Runtime Backends
		</h2>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
			Recipes launch through the controller runtime layer. Wired backend families:
		</p>
		<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.marginTop16, styles.docsList)}>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
					<span translate="no" {...stylex.props(baseStyles.element)}>
						vLLM
					</span>
				</strong>{" "}
				- CUDA throughput serving through configured, discovered, system, Docker, or bundled
				targets.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
					<span translate="no" {...stylex.props(baseStyles.element)}>
						SGLang
					</span>
				</strong>{" "}
				- Structured and multi-turn serving through discovered or configured Python targets.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
					<span translate="no" {...stylex.props(baseStyles.element)}>
						llama.cpp
					</span>
				</strong>{" "}
				- GGUF models through the llama-server binary. Great for CPU and modest hardware.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
					<span translate="no" {...stylex.props(baseStyles.element)}>
						MLX
					</span>
				</strong>{" "}
				- Apple Silicon serving through mlx_lm.server. The default path on Mac.
			</li>
		</ul>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
			Runtime target discovery is surfaced in Settings; selections persist in the controller data
			directory.
		</p>
	</section>
);

export const agentRuntime = (
	<section id="agent-runtime" {...stylex.props(baseStyles.element, styles.docsSection)}>
		<h2
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.headingTwo,
				styles.docsSectionHeading,
			)}
		>
			Agent Runtime
		</h2>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
			The agent surface lives at{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				/agent
			</code>{" "}
			in the frontend. It uses{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				@earendil-works/pi-coding-agent
			</code>{" "}
			through the frontend runtime rather than shelling out to a separate agent process. Agent
			skills and extensions are loaded by the frontend runtime and surfaced in the session UI.
		</p>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.marginTop16)}>
			Agent file operations are local-only, stored under{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				data/agentfs
			</code>
			.
		</p>
	</section>
);
