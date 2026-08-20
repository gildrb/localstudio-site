"use client";

import { createContext, useContext, useId, useRef, useState, type ReactNode } from "react";
import { useMountSubscription } from "@/hooks/use-mount-subscription";
import { X } from "@/ui/icon-registry";
import { POPOVER_PANEL_CLASS } from "./popover";
import { cx } from "./utils";

interface UiModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

const UiModalTitleIdContext = createContext<string | null>(null);

function UiModal({ isOpen, onClose, children, className, maxWidth = "max-w-lg" }: UiModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [callbacks] = useState(() => ({ onClose }));
  callbacks.onClose = onClose;

  useMountSubscription(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        callbacks.onClose();
      }}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-0 backdrop:bg-(--color-background) open:flex"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close modal"
        className="absolute inset-0"
        onClick={() => callbacks.onClose()}
      />
      <div
        className={cx(
          `relative z-10 max-h-[calc(100dvh-3rem)] w-[calc(100%-2rem)] outline-none ${POPOVER_PANEL_CLASS}`,
          maxWidth,
          className,
        )}
      >
        <UiModalTitleIdContext.Provider value={titleId}>{children}</UiModalTitleIdContext.Provider>
      </div>
    </dialog>
  );
}

interface UiModalHeaderProps {
  title: string;
  icon?: ReactNode;
  onClose?: () => void;
  actions?: ReactNode;
  closeLabel?: string;
  className?: string;
  showCloseButton?: boolean;
  closeIcon?: ReactNode;
}

function UiModalHeader({
  title,
  icon,
  onClose,
  actions,
  closeLabel = "Close",
  className,
  showCloseButton = true,
  closeIcon,
}: UiModalHeaderProps) {
  const titleId = useContext(UiModalTitleIdContext);

  return (
    <div
      className={cx(
        "flex min-h-13 items-center justify-between gap-3 border-b border-(--border) bg-(--color-popover-header) px-5 py-3.5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2
          id={titleId ?? undefined}
          className="text-[length:var(--fs-md)] font-medium tracking-[-0.01em] text-(--ui-fg)"
        >
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {showCloseButton && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-(--ui-muted) transition-colors hover:bg-(--ui-hover) hover:text-(--ui-fg) active:scale-[0.98]"
            aria-label={closeLabel}
          >
            {closeIcon ?? <X className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export { UiModal, UiModalHeader };
export type { UiModalProps, UiModalHeaderProps };
