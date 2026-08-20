"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "./utils";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button-styles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const modelButtonToneClasses = {
  default: "text-(--ui-muted) hover:bg-(--ui-hover) hover:text-(--ui-fg)",
  primary: "text-(--ui-fg) hover:bg-(--ui-hover)",
  danger: "text-(--ui-danger) hover:bg-(--ui-danger)/10",
} as const;
const modelButtonBaseClasses =
  "inline-flex h-6 items-center justify-center gap-1.5 rounded-md px-1.5 text-[length:var(--fs-sm)] font-medium transition-[background-color,color,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-45";

export type ModelButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  tone?: "default" | "primary" | "danger";
  type?: "button" | "submit";
};

export function ModelButton({
  children,
  tone = "default",
  type = "button",
  ...props
}: ModelButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={cx(modelButtonBaseClasses, modelButtonToneClasses[tone])}
    >
      {children}
    </button>
  );
}


const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    children,
    className = "",
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  const cls = buttonClasses(variant, size);

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${cls} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
});

export { Button };
export type { ButtonProps };
