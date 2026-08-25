import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./assistant-message-actions.styles.ts";
import { useState } from "react";
import { Copy } from "../ui/icon-registry";

export function AssistantMessageActions({ copyText }: { copyText: string }) {
	const [copied, setCopied] = useState(false);
	async function copy() {
		if (!copyText.trim() || copied) return;
		try {
			await navigator.clipboard.writeText(copyText);
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = copyText;
			document.body.append(textarea);
			textarea.select();
			document.execCommand("copy");
			textarea.remove();
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1500);
	}
	return (
		<div {...stylex.props(demoStyles.reset, styles.div22)}>
			<button
				type="button"
				onClick={() => void copy()}
				disabled={!copyText.trim()}
				{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.element27)}
				aria-label={copied ? "Copied" : "Copy response"}
			>
				<Copy {...stylex.props(demoStyles.reset, styles.copy30, styles.lucideScale)} strokeWidth={1.5} />
			</button>
		</div>
	);
}
