import { notFoundSuggestions , homePath } from "../domain/route";
import { LocalLink } from "../components/LocalLink";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

export function NotFoundPage() {
	return (
		<PageShell>
			<PageIntro
				id="not-found-title"
				title="This page is not local"
				description={
					<>
						The route does not exist in this{" "}
						<span translate="no">Local Studio</span> website. Try one of the
						routes below instead.
					</>
				}
				actions={
					<LocalLink className="button" href={homePath}>
						Back to <span translate="no">Local Studio</span>
					</LocalLink>
				}
			>
				<nav className="not-found__routes" aria-label="Suggested routes">
					{notFoundSuggestions().map(({ label, href }) => (
						<LocalLink href={href} key={href}>
							{label}
						</LocalLink>
					))}
				</nav>
			</PageIntro>
		</PageShell>
	);
}
