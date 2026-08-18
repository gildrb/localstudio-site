"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useMountSubscription } from "@/hooks/use-mount-subscription";
import { X } from "@/ui/icon-registry";
import { Button } from "./button";
import { cx } from "./utils";

export function Drawer({
  children,
  width = 720,
  className,
  style,
}: {
  children: ReactNode;
  width?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <aside
      className={cx(
        "relative flex shrink-0 flex-col border-l border-(--color-popover-border) bg-(--color-popover) shadow-[-24px_0_80px_rgba(0,0,0,0.38)]",
        className,
      )}
      style={{
        width: `${width}px`,
        minWidth: "min(420px, 40%)",
        maxWidth: "min(960px, 76%)",
        ...style,
      }}
    >
      {children}
    </aside>
  );
}

export function DrawerOverlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useMountSubscription(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none justify-end bg-transparent p-0 backdrop:bg-black/30"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

export function DrawerHeader({
  title,
  icon,
  badge,
  actions,
  onClose,
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <header
      className={cx(
        "flex h-10 shrink-0 items-center gap-2 border-b border-(--border) bg-(--color-popover-header) px-3 text-[length:var(--fs-sm)]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon}
        <span className="truncate font-medium text-(--ui-fg)/85">{title}</span>
        {badge}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
      {onClose ? (
        <Button variant="icon" size="sm" onClick={onClose} aria-label="Close" title="Close">
          <X className="h-3 w-3" />
        </Button>
      ) : null}
    </header>
  );
}

export function DrawerBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("min-h-0 flex-1 overflow-y-auto p-4", className)}>{children}</div>;
}

export function DrawerFooter({
  status,
  children,
  className,
}: {
  status?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <footer
      className={cx(
        "flex h-11 shrink-0 items-center justify-between gap-3 border-t border-(--border) bg-(--color-popover-header) px-3 text-[length:var(--fs-sm)]",
        className,
      )}
    >
      <div className="min-w-0 truncate text-(--ui-muted)/75">{status}</div>
      {children ? <div className="flex shrink-0 items-center gap-1">{children}</div> : null}
    </footer>
  );
}
