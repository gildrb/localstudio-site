import * as stylex from "@stylexjs/stylex";
import { baseStyles } from "../styles/base-styles";
import { headerStyles } from "../styles/header-styles";
import { site } from "../domain/site";
import { homePath } from "../domain/route";
import { LocalLink } from "./LocalLink";
import { BrandLogo } from "./BrandLogo";
import { HeaderMenuTrigger } from "./HeaderMenuTrigger";
import type { DesktopControls, HeaderNavigation } from "./header-navigation";

function CompanyMenuLink({ close }: { readonly close: () => void }) {
	return (
		<a
			{...stylex.props(
				baseStyles.element,
				baseStyles.interactive,
				baseStyles.focusable,
				headerStyles.topLink,
				stylex.defaultMarker(),
			)}
			data-nav-company=""
			href={site.company.url}
			onPointerEnter={close}
		>
			<span {...stylex.props(baseStyles.element, headerStyles.triggerSurface)} aria-hidden="true" />
			Company
		</a>
	);
}

export function HeaderPrimary({
	openMenu,
	controls,
	close,
	closeMobile,
}: {
	readonly openMenu: HeaderNavigation["desktop"]["openMenu"];
	readonly controls: DesktopControls;
	readonly close: () => void;
	readonly closeMobile: () => void;
}) {
	return (
		<div {...stylex.props(baseStyles.element, headerStyles.primary)}>
			<LocalLink
				sx={headerStyles.brand}
				href={homePath}
				aria-label={site.products.localStudio.name}
				onClick={closeMobile}
				onPointerEnter={close}
			>
				<BrandLogo />
			</LocalLink>
			<nav
				{...stylex.props(baseStyles.element, headerStyles.links)}
				aria-label="Landing navigation"
			>
				<HeaderMenuTrigger
					id="products"
					label="Products"
					open={openMenu === "products"}
					controls={controls}
				/>
				<HeaderMenuTrigger
					id="resources"
					label="Resources"
					open={openMenu === "resources"}
					controls={controls}
				/>
				<CompanyMenuLink close={close} />
			</nav>
		</div>
	);
}
