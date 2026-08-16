import { LocalLink } from "./LocalLink";

const links = [
	["Mobile", "/mobile"],
	["Docs", "/docs"],
	["Setup", "/prompt"],
	["Agents", "/agents"],
	["Download", "/download/macos"],
] as const;

export function Footer() {
	return (
		<footer className="footer">
			<img
				className="footer__mark"
				src="/images/optimized-outline.svg"
				alt=""
				width="525"
				height="525"
				loading="lazy"
				decoding="async"
				aria-hidden="true"
			/>
			<div className="footer__bar">
				<span className="footer__copyright">
					© 2026 <span translate="no">Local Studio</span>
				</span>
				<nav className="footer__links" aria-label="Footer navigation">
					{links.map(([label, href]) => (
						<LocalLink href={href} key={href}>
							{label}
						</LocalLink>
					))}
					<a href="/images/localstudio-logo.svg" download>
						Brand assets
					</a>
				</nav>
			</div>
		</footer>
	);
}
