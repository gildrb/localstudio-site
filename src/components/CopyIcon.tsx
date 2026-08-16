import { useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";

interface CopyIconProps {
	text: string;
}

const copyPath =
	"M8.25 2c.14 0 .25.11.25.25V3H10v-.75C10 1.28 9.22.5 8.25.5h-5.5C1.78.5 1 1.28 1 2.25v7.5c0 .97.78 1.75 1.75 1.75H4.5V10H2.75a.25.25 0 0 1-.25-.25v-7.5c0-.14.11-.25.25-.25zm5 4c.14 0 .25.11.25.25v7.5q-.02.23-.25.25h-5.5a.25.25 0 0 1-.25-.25v-7.5c0-.14.11-.25.25-.25zm0 9.5c.97 0 1.75-.78 1.75-1.75v-7.5c0-.97-.78-1.75-1.75-1.75h-5.5C6.78 4.5 6 5.28 6 6.25v7.5c0 .97.78 1.75 1.75 1.75z";
const checkPath =
	"m15.56 4-.53.53-8.8 8.8c-.68.68-1.78.68-2.47 0l.53-.54-.53.53-2.79-2.79L.44 10 1.5 8.94l.53.53 2.8 2.8c.1.09.25.09.35 0l8.79-8.8.53-.53z";

export function CopyIcon({ text }: CopyIconProps) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		if (copied) return;
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
		window.setTimeout(() => setCopied(false), 1500);
	}

	return (
		<button
			className={copied ? "copy-icon copied" : "copy-icon"}
			type="button"
			onClick={copy}
			aria-label="Copy to clipboard"
		>
			<span className="sr-only" role="status" aria-live="polite">
				{copied ? "Copied to clipboard" : ""}
			</span>
			<span className="copy-icon__glyph" aria-hidden="true">
				<LazyMotion features={domAnimation} strict>
				<AnimatePresence initial={false} mode="popLayout">
					<m.svg
						key={copied ? "check" : "copy"}
						viewBox="0 0 16 16"
						width="16"
						height="16"
						initial={{ opacity: 0, scale: 0.4 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.4 }}
						transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
						style={{ x: "-50%", y: "-50%", position: "absolute", left: "50%", top: "50%" }}
					>
						<path fill="currentColor" d={copied ? checkPath : copyPath} />
					</m.svg>
				</AnimatePresence>
				</LazyMotion>
			</span>
		</button>
	);
}
