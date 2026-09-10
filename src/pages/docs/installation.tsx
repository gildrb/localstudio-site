import { site } from "../../domain/site";
import * as stylex from "@stylexjs/stylex";
import { baseStyles } from "../../styles/base-styles";
import { styles } from "../../styles/pages-styles";

export const prerequisites = (
	<section id="prerequisites" {...stylex.props(baseStyles.element, styles.docsSection)}>
		<h2
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.headingTwo,
				styles.docsSectionHeading,
			)}
		>
			Prerequisites
		</h2>
		<ul
			{...stylex.props(
				baseStyles.list,
				baseStyles.element,
				styles.docsSectionLead,
				styles.docsList,
			)}
		>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
					<span translate="no" {...stylex.props(baseStyles.element)}>
						Bun
					</span>{" "}
					1.x
				</strong>{" "}
				for the controller.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
					Node.js 20+ and npm
				</strong>{" "}
				for the frontend.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
					Python 3.10+ on PATH.
				</strong>{" "}
				Engine installs use{" "}
				<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
					uv
				</code>{" "}
				when present, pip otherwise.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>Git.</strong>
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				<strong {...stylex.props(baseStyles.element, styles.docsStrong)}>
					NVIDIA driver +{" "}
					<span translate="no" {...stylex.props(baseStyles.element)}>
						CUDA
					</span>
				</strong>{" "}
				for vLLM/SGLang on Linux. Apple Silicon uses the{" "}
				<span translate="no" {...stylex.props(baseStyles.element)}>
					MLX
				</span>{" "}
				backend.
			</li>
		</ul>
	</section>
);

export const quickStart = (
	<section id="quick-start" {...stylex.props(baseStyles.element, styles.docsSection)}>
		<h2
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.headingTwo,
				styles.docsSectionHeading,
			)}
		>
			Quick Start
		</h2>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
			Run the preflight check first. It verifies toolchain, ports, directories, and network:
		</p>
		<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
			npm run doctor
		</pre>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
			Start the controller (listens on{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				127.0.0.1:8080
			</code>
			; data dir and SQLite are created automatically, model weights live in{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				LOCAL_STUDIO_MODELS_DIR
			</code>
			, default{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				/models
			</code>
			):
		</p>
		<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
			cd controller &amp;&amp; bun install &amp;&amp; bun src/main.ts
		</pre>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
			Start the frontend in a second terminal, then open{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				http://localhost:3000/setup
			</code>
			:
		</p>
		<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
			cd frontend &amp;&amp; npm ci &amp;&amp; npm run dev
		</pre>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsNotice)}>
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				npm ci
			</code>{" "}
			runs a postinstall patch against{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				@earendil-works/pi-ai
			</code>
			. If that step prints a warning, agent streaming may misrender. Re-run{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				npm ci
			</code>{" "}
			to fix it.
		</p>
	</section>
);

export const setupWizard = (
	<section id="setup-wizard" {...stylex.props(baseStyles.element, styles.docsSection)}>
		<h2
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.headingTwo,
				styles.docsSectionHeading,
			)}
		>
			Setup Wizard
		</h2>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
			The first-run{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				/setup
			</code>{" "}
			wizard walks through choosing a models directory, installing an engine, downloading a model,
			launching it, and benchmarking. Engine installs (vLLM/SGLang/MLX) land in{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				&lt;data dir&gt;/runtime/venvs/&lt;backend&gt;-latest
			</code>
			.
		</p>
	</section>
);

export const introduction = (
	<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
		<span translate="no" {...stylex.props(baseStyles.element)}>
			{site.products.localStudio.name}
		</span>{" "}
		is a local-first workstation for running, managing, and using self-hosted LLM backends. Two
		modules share one controller API: a{" "}
		<span translate="no" {...stylex.props(baseStyles.element)}>
			Bun
		</span>
		/Hono backend and a Next.js + React frontend with an Electron desktop shell.
	</p>
);
