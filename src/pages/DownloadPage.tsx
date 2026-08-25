import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { CtaPair } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { docsPath, downloadLabel } from "../domain/route";
import { release } from "../domain/release";
import { styles } from "../styles/pages-styles";

export function DownloadPage() {
  return (
    <PageShell backHref="/">
      <PageIntro
          sx={styles.downloadIntro}
          id="download-page-title"
          title={downloadLabel()}
          description={
            <>
              The desktop app for running local controllers, models, providers,
              and coding agents on Apple Silicon.
              <small {...stylex.props(baseStyles.element, styles.downloadMeta)}>
                <span {...stylex.props(baseStyles.element)}>{release.label.replace(" ", "\u00A0")}</span>
                <span {...stylex.props(baseStyles.element)}>{release.arch}</span>
                <span {...stylex.props(baseStyles.element)}>macOS</span>
                <span {...stylex.props(baseStyles.element)}>hosted on GitHub Releases</span>
              </small>
            </>
          }
          actions={
            <CtaPair
              sx={styles.downloadCta}
              primary={{ href: release.url, label: "Download DMG" }}
              secondary={{
                href: `${docsPath}#prerequisites`,
                label: "Read Prerequisites",
              }}
            />
          }
      />
    </PageShell>
  );
}
