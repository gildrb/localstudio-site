"use client";
import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./agent-composer-textarea.styles.ts";

import type {
  ChangeEventHandler,
  ClipboardEventHandler,
  KeyboardEventHandler,
  RefObject,
} from "react";

export function AgentComposerTextArea({
  inputRef,
  value,
  onPaste,
  onChange,
  onKeyDown,
  placeholder = "Ask for follow-up changes",
}: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onPaste: ClipboardEventHandler<HTMLTextAreaElement>;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
}) {
  return (
    <textarea
      ref={inputRef}
      id="hero-demo-composer"
      name="message"
      rows={1}
      autoComplete="off"
      value={value}
      onPaste={onPaste}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      {...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.element37)}
    />
  );
}
