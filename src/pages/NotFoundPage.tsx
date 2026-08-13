import { LocalLink } from "../components/LocalLink";
import { PageShell } from "../components/PageShell";

export function NotFoundPage() {
	return (
		<PageShell footerLeft="Local Studio" footerRight="Page not found">
			<section className="mx-auto grid min-h-[calc(100svh_-_160px)] w-[min(760px,calc(100%_-_48px))] place-content-center py-30 text-center max-[620px]:w-[calc(100%_-_24px)]" aria-labelledby="not-found-title">
				<p className="kicker">404</p>
				<h1 id="not-found-title" className="mt-5 text-[64px]/[64px] font-medium tracking-[-0.02em] max-[620px]:text-[40px]/[44px]">This page is not local.</h1>
				<p className="mt-8 text-base/6 text-white/70">The route does not exist in this Local Studio website.</p>
				<LocalLink className="button mx-auto mt-10" href="/">Back to Local Studio</LocalLink>
			</section>
		</PageShell>
	);
}
