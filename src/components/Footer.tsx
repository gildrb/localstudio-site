import { LocalLink } from "./LocalLink";

const links = [
	["Machines", "/machine"],
	["Mobile", "/mobile"],
	["Docs", "/docs"],
	["Setup", "/prompt"],
	["Agents", "/agents"],
	["Download", "/download/macos"],
] as const;

export function Footer() {
	return (
		<footer className="footer">
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
			<span className="footer__copyright">
				© 2026 <span translate="no">Local Studio</span>
			</span>
		</footer>
	);
}
