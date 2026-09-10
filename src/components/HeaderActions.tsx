import * as stylex from "@stylexjs/stylex";
import { baseStyles } from "../styles/base-styles";
import { headerStyles } from "../styles/header-styles";
import { site } from "../domain/site";
import { githubUrl } from "./header-content";
import { DownloadButton } from "./Links";
import { LocalLink } from "./LocalLink";

export function HeaderActions({ close }: { readonly close: () => void }) {
	return (
		<div {...stylex.props(baseStyles.element, headerStyles.actions)}>
			<LocalLink
				sx={headerStyles.github}
				href={githubUrl}
				target="_blank"
				rel="noreferrer"
				aria-label={`${site.products.localStudio.name} on GitHub`}
				onPointerEnter={close}
			>
				GitHub
			</LocalLink>
			<DownloadButton sx={headerStyles.button} />
		</div>
	);
}
