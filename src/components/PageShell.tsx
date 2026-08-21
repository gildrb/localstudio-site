import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LocalLink } from "./LocalLink";

interface PageShellProps {
	backHref?: string;
	children: ReactNode;
}

export function PageShell({ backHref, children }: PageShellProps) {
	return (
		<div className="site-shell">
			<LocalLink className="skip-link" href="#content">
				Skip to content
			</LocalLink>
			{backHref ? (
				<header className="back-nav">
					<LocalLink className="back-nav__link" href={backHref}>
						<ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
						Back
					</LocalLink>
				</header>
			) : (
				<Header />
			)}
			<main className="site-main" id="content" tabIndex={-1}>
				{children}
			</main>
			<Footer />
		</div>
	);
}
