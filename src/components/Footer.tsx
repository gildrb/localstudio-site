import { footerRoutes } from "../domain/route";
import { site } from "../domain/site";
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
				© {site.copyrightYear}{" "}
				<span translate="no">{site.products.localStudio.name}</span>
			</span>
		</footer>
	);
}
