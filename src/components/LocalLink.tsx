import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { decideSameOriginNavigation } from "../domain/route";
import { emitNavigation, scrollToHash } from "../app/browser-location";
import { prefetchRoutePage } from "../app/route-page-loaders";

export function LocalLink({
  children,
  href,
  onClick,
  onFocus,
  onPointerDown,
  onPointerEnter,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target
    ) {
      return;
    }

    const decision = decideSameOriginNavigation(
      href,
      window.location.origin,
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );
    if (decision.kind === "external") return;
    event.preventDefault();
    if (decision.kind === "push") {
      window.history.pushState({}, "", decision.next);
      emitNavigation();
      return;
    }
    if (decision.kind === "hash") {
      scrollToHash(decision.hash);
      return;
    }
    window.scrollTo({ top: 0 });
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      onFocus={(event) => {
        onFocus?.(event);
        prefetchRoutePage(href);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        prefetchRoutePage(href);
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        prefetchRoutePage(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
