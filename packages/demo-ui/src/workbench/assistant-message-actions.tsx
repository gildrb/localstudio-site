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
		<div className="mt-2 flex items-center gap-1 text-(--dim)/65">
			<button
				type="button"
				onClick={() => void copy()}
				disabled={!copyText.trim()}
				className="inline-flex h-7 w-7 items-center justify-center rounded-md text-(--hl2) transition-colors hover:bg-(--hover) hover:text-(--fg) disabled:pointer-events-none disabled:opacity-30"
				aria-label={copied ? "Copied" : "Copy response"}
			>
				<Copy className="h-4 w-4" strokeWidth={1.5} />
			</button>
		</div>
	);
}
