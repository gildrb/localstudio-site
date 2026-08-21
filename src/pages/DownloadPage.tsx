import { CtaPair } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

const downloadUrl =
	"https://github.com/sybil-solutions/local-studio/releases/download/v2.11.2/Local-Studio-arm64.dmg";

export function DownloadPage() {
	return (
		<PageShell backHref="/">
			<PageIntro
				id="download-page-title"
				title="Download for macOS."
				description={
					<>
						The desktop app for running local controllers, models, providers,
						and coding agents on Apple Silicon.
						<small className="mt-4 block text-sm/5 text-white/50">
							{"255\u00A0MB · arm64 · macOS · hosted on GitHub Releases"}
						</small>
					</>
				}
				actions={
					<CtaPair
						primary={{ href: downloadUrl, label: "Download DMG" }}
						secondary={{ href: "/docs#prerequisites", label: "Read prerequisites" }}
					/>
				}
			/>
		</PageShell>
	);
}
