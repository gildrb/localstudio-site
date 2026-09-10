import { baseStyles, type PublicStyle } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./copy-button-styles";
import { CopyGlyph } from "./CopyGlyph";
import { useState } from "react";

interface CopyButtonProps {
	readonly sx?: PublicStyle;
	readonly text: string;
}

export function CopyButton({ text, sx }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		if (copied) return;
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.className = stylex.props(baseStyles.element, styles.clipboard).className ?? "";
			document.body.append(textarea);
			textarea.select();
			document.execCommand("copy");
			textarea.remove();
		}
		setCopied(true);
		window.setTimeout(() => {
			setCopied(false);
		}, 1500);
	}

	return (
		<button
			{...stylex.props(
				baseStyles.element,
				baseStyles.interactive,
				baseStyles.focusable,
				baseStyles.button,
				styles.button,
				copied && styles.copied,
				sx,
			)}
			type="button"
			onClick={() => {
				void copy();
			}}
			aria-label="Copy to clipboard"
		>
			<span
				{...stylex.props(baseStyles.element, styles.screenReaderOnly)}
				role="status"
				aria-live="polite"
			>
				{copied ? "Copied to clipboard" : ""}
			</span>
			<CopyGlyph copied={copied} />
		</button>
	);
}
