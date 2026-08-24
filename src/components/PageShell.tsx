import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { assets } from "../domain/asset";
import { site } from "../domain/site";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LocalLink } from "./LocalLink";

interface PageShellProps {
	backHref?: string;
	children: ReactNode;
}

export function PageShell({ backHref, children }: PageShellProps) {
	return (
		<div className={`site-shell${backHref ? " site-shell--back" : ""}`}>
			<LocalLink className="skip-link" href="#content">
				Skip to content
			</LocalLink>
			{backHref ? (
				<header className="back-nav">
					<LocalLink
						className="brand"
						href={backHref}
						aria-label={site.products.localStudio.name}
					>
						<img
							className="brand__logo"
							src={assets.wordmark}
							alt=""
							width="3000"
							height="566"
							draggable={false}
						/>
					</LocalLink>
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
