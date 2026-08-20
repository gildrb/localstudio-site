import { useId, useState } from "react";
import { CopyIcon } from "./CopyIcon";

interface PromptBlockProps {
	label: string;
	text: string;
}

export function PromptBlock({ label, text }: PromptBlockProps) {
	const [expanded, setExpanded] = useState(false);
	const contentId = useId();

	return (
		<section
			className="prompt-block surface-panel border border-white/15"
			aria-label={label}
			data-expanded={expanded ? "true" : "false"}
		>
			<CopyIcon text={text} />
			<pre
				id={contentId}
				className="prompt-block__pre w-full min-w-0 overflow-hidden whitespace-pre-wrap break-words p-8 pr-20 font-mono text-sm/5 text-white/80 max-[620px]:p-5 max-[620px]:pr-12"
			>
				<code>{text}</code>
			</pre>
			<button
				className="prompt-block__toggle"
				type="button"
				aria-expanded={expanded}
				aria-controls={contentId}
				onClick={() => setExpanded((value) => !value)}
			>
				{expanded ? "Show less" : "Show more"}
			</button>
		</section>
	);
}
