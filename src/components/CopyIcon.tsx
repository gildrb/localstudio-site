import { useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { motion } from "../domain/motion";

interface CopyIconProps {
	text: string;
}

const copyPath =
	"M8.25 2c.14 0 .25.11.25.25V3H10v-.75C10 1.28 9.22.5 8.25.5h-5.5C1.78.5 1 1.28 1 2.25v7.5c0 .97.78 1.75 1.75 1.75H4.5V10H2.75a.25.25 0 0 1-.25-.25v-7.5c0-.14.11-.25.25-.25zm5 4c.14 0 .25.11.25.25v7.5q-.02.23-.25.25h-5.5a.25.25 0 0 1-.25-.25v-7.5c0-.14.11-.25.25-.25zm0 9.5c.97 0 1.75-.78 1.75-1.75v-7.5c0-.97-.78-1.75-1.75-1.75h-5.5C6.78 4.5 6 5.28 6 6.25v7.5c0 .97.78 1.75 1.75 1.75z";
const checkPath =
	"m15.56 4-.53.53-8.8 8.8c-.68.68-1.78.68-2.47 0l.53-.54-.53.53-2.79-2.79L.44 10 1.5 8.94l.53.53 2.8 2.8c.1.09.25.09.35 0l8.79-8.8.53-.53z";


function glyphState(active: boolean, reduceMotion: boolean) {
	if (reduceMotion) return { opacity: active ? 1 : 0 };
	return {
		opacity: active ? 1 : 0,
		scale: active ? 1 : 0.55,
		filter: active ? "blur(0px)" : "blur(4px)",
	};
}

export function CopyIcon({ text }: CopyIconProps) {
	const [copied, setCopied] = useState(false);
	const reduceMotion = useReducedMotion();
	const transition = { duration: reduceMotion ? 0 : 0.18, ease: motion.ease };

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
		<LazyMotion features={domAnimation} strict>
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
					<m.svg
						className="copy-icon__symbol"
						viewBox="0 0 16 16"
						width="16"
						height="16"
						initial={false}
					>
						<m.path
							fill="currentColor"
							d={copyPath}
							style={{ originX: "50%", originY: "50%" }}
							animate={glyphState(!copied, Boolean(reduceMotion))}
							transition={transition}
						/>
						<m.path
							fill="currentColor"
							d={checkPath}
							style={{ originX: "50%", originY: "50%" }}
							animate={glyphState(copied, Boolean(reduceMotion))}
							transition={transition}
						/>
					</m.svg>
				</span>
			</button>
		</LazyMotion>
	);
}
