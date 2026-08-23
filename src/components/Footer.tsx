import { footerRoutes } from "../domain/route";
import { LocalLink } from "./LocalLink";

export function Footer() {
	return (
		<footer className="footer">
			<nav className="footer__links" aria-label="Footer navigation">
				{footerRoutes().map(({ label, path }) => (
					<LocalLink href={path} key={path}>
						{label}
					</LocalLink>
				))}
			</nav>
			<span className="footer__copyright">
				© 2026 <span translate="no">Local Studio</span>
			</span>
		</footer>
	);
}
