"use client";
import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./agent-composer-textarea.styles.ts";

import type { ChangeEventHandler, KeyboardEventHandler, RefObject } from "react";

export function AgentComposerTextArea({
	inputRef,
	value,
	onChange,
	onKeyDown,
	placeholder = "Ask for follow-up changes",
}: {
	readonly inputRef: Readonly<RefObject<HTMLTextAreaElement | null>>;
	readonly value: string;
	readonly onChange: ChangeEventHandler<HTMLTextAreaElement>;
	readonly onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
	readonly placeholder?: string;
}) {
	return (
		<textarea
			ref={inputRef}
			id="hero-demo-composer"
			name="message"
			rows={1}
			autoComplete="off"
			value={value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			placeholder={placeholder}
			{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.element37)}
		/>
	);
}
