import * as stylex from "@stylexjs/stylex";
import { baseStyles } from "../../styles/base-styles";
import { styles } from "../../styles/pages-styles";

export const remoteLan = (
	<section id="remote-lan" {...stylex.props(baseStyles.element, styles.docsSection)}>
		<h2
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.headingTwo,
				styles.docsSectionHeading,
			)}
		>
			Remote / LAN Deployment
		</h2>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
			The controller binds{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				127.0.0.1
			</code>{" "}
			by default. Binding a non-loopback host (e.g.{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				LOCAL_STUDIO_HOST=0.0.0.0
			</code>
			) requires{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				LOCAL_STUDIO_API_KEY
			</code>
			. Startup throws without it. On a trusted LAN you may instead set{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				LOCAL_STUDIO_ALLOW_UNAUTHENTICATED=true
			</code>{" "}
			to opt out of authentication.
		</p>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.marginTop16)}>
			Point the frontend at a remote controller with{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				BACKEND_URL
			</code>{" "}
			or{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				NEXT_PUBLIC_API_URL
			</code>{" "}
			(default{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				http://localhost:8080
			</code>
			). Configure{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				.env.local
			</code>{" "}
			first:
		</p>
		<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
			REMOTE_HOST=192.168.x.x REMOTE_USER=username REMOTE_PATH=/home/user/project{`\n`}# Optional:
			REMOTE_SSH_KEY (defaults to ~/.ssh/id_ed25519)
		</pre>
		<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
			./scripts/deploy-remote.sh controller # sync + build + restart controller{`\n`}
			./scripts/deploy-remote.sh frontend # sync + build + restart frontend{`\n`}
			./scripts/deploy-remote.sh status # inspect remote processes
		</pre>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
			Local daemon helper:{" "}
			<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
				./scripts/daemon.sh &#123;start|stop|status&#125;
			</code>
			.
		</p>
	</section>
);

export const validation = (
	<section id="validation" {...stylex.props(baseStyles.element, styles.docsSection)}>
		<h2
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.headingTwo,
				styles.docsSectionHeading,
			)}
		>
			Validation
		</h2>
		<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
			After setup, confirm the stack is healthy:
		</p>
		<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.marginTop16, styles.docsList)}>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				Settings switches controllers and the runtime state updates.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				System shows installed engines and the active service topology.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				A model launches through a recipe and /status reflects it.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				/v1/chat/completions works locally and through a provider route.
			</li>
			<li {...stylex.props(baseStyles.element, styles.docsListItem)}>
				/agent completes a turn using the selected model and local tools.
			</li>
		</ul>
		<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
			npm run check # contracts + structure + frontend quality + controller typecheck{`\n`}npm run
			test:integration # controller integration + frontend regression
		</pre>
	</section>
);
