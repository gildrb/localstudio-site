import { useState } from "react";

interface CopyButtonProps {
	label: string;
	text: string;
}

export function CopyButton({ label, text }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.append(textarea);
			textarea.select();
			document.execCommand("copy");
			textarea.remove();
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1600);
	}

	return (
		<button className="button copy-button" type="button" onClick={copy}>
			{copied ? "Copied" : label}
			<span className="sr-only" role="status" aria-live="polite">
				{copied ? "Copied to clipboard" : ""}
			</span>
		</button>
	);
}
