import { DownloadIcon } from "../components/DownloadIcon";
import { LocalLink } from "../components/LocalLink";
import { PageShell } from "../components/PageShell";

const downloadUrl =
	"https://github.com/sybil-solutions/local-studio/releases/download/v2.11.2/Local-Studio-arm64.dmg";

export function DownloadPage() {
	return (
		<PageShell>
			<section
				className="mx-auto grid min-h-[calc(100svh_-_160px)] w-[min(760px,calc(100%_-_48px))] place-content-center py-30 text-center max-[620px]:w-[calc(100%_-_24px)]"
				aria-labelledby="download-page-title"
			>
				<h1 id="download-page-title">
					Download for macOS.
				</h1>
				<p className="mx-auto mt-8 max-w-xl text-base/6 text-white/70">
					The desktop app for running local controllers, models, providers, and
					coding agents on Apple Silicon.
				</p>
				<div className="mt-10 flex flex-wrap justify-center gap-4">
					<LocalLink className="button" href={downloadUrl}>
						<DownloadIcon />
						Download DMG
					</LocalLink>
					<LocalLink
						className="inline-flex min-h-10 items-center rounded-md border border-white/10 px-4"
						href="/docs#prerequisites"
					>
						Read prerequisites
					</LocalLink>
				</div>
				<p className="mt-8 text-sm/5 text-white/50">
					255 MB · arm64 · macOS · hosted on GitHub Releases
				</p>
			</section>
		</PageShell>
	);
}
