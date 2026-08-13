import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface PageShellProps {
	children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
	return (
		<main className="site-shell">
			<Header />
			{children}
			<Footer />
		</main>
	);
}
