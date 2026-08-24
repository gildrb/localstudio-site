import { docsPath, downloadLabel } from "../domain/route";
import { CtaPair } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

import { release } from "../domain/release";

export function DownloadPage() {
	return (
		<PageShell backHref="/">
			<div className="download-page">
				<PageIntro
					id="download-page-title"
					title={downloadLabel()}
					description={
						<>
							The desktop app for running local controllers, models, providers,
							and coding agents on Apple Silicon.
							<small className="mt-4 block text-sm/5 text-white/50">
								{`${release.label.replace(" ", "\u00A0")} · ${release.arch} · macOS · hosted on GitHub Releases`}
							</small>
						</>
					}
					actions={
						<CtaPair
							primary={{ href: release.url, label: "Download DMG" }}
							secondary={{ href: `${docsPath}#prerequisites`, label: "Read prerequisites" }}
						/>
					}
				/>
			</div>
		</PageShell>
	);
}
