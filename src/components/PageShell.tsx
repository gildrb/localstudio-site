import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface PageShellProps {
	children: ReactNode;
	footerLeft?: string;
	footerRight?: string;
}

export function PageShell({
	children,
	footerLeft = "Local Studio",
	footerRight = "Desktop / web / controller / agents",
}: PageShellProps) {
	return (
		<main className="site-shell">
			<Header />
			{children}
			<Footer left={footerLeft} right={footerRight} />
		</main>
	);
}
