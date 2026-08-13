import { LocalLink } from "../components/LocalLink";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

export function NotFoundPage() {
	return (
		<PageShell>
			<PageIntro
				id="not-found-title"
				title="This page is not local."
				description="The route does not exist in this Local Studio website."
				actions={
					<LocalLink className="button" href="/">
						Back to Local Studio
					</LocalLink>
				}
			/>
		</PageShell>
	);
}
