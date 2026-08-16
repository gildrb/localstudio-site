import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LocalLink } from "./LocalLink";

interface PageShellProps {
	children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
	return (
		<div className="site-shell">
			<LocalLink className="skip-link" href="#content">
				Skip to content
			</LocalLink>
			<Header />
			<main className="site-main" id="content" tabIndex={-1}>
				{children}
			</main>
			<Footer />
		</div>
	);
}
