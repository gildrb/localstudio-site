import * as stylex from "@stylexjs/stylex";
import { baseStyles } from "../styles/base-styles";
import { headerStyles } from "../styles/header-styles";
import { useHeaderNavigation, type HeaderNavigation } from "./header-navigation";
import { HeaderPrimary } from "./HeaderPrimary";
import { HeaderActions } from "./HeaderActions";
import { DesktopMenu } from "./HeaderDesktopMenu";
import { HeaderMobileSheet, HeaderMobileToggle } from "./HeaderMobile";

function HeaderBackdrop({
	mobileOpen,
	openMenu,
}: {
	readonly mobileOpen: boolean;
	readonly openMenu: HeaderNavigation["desktop"]["openMenu"];
}) {
	return (
		<span
			{...stylex.props(
				baseStyles.element,
				headerStyles.navBackdrop,
				mobileOpen && headerStyles.navBackdropOpen,
				openMenu === "products" && headerStyles.navBackdropProducts,
				openMenu === "resources" && headerStyles.navBackdropResources,
			)}
		/>
	);
}

export function Header() {
	const navigation = useHeaderNavigation();
	const { menusRef, ...desktop } = navigation.desktop;
	const { toggleRef, sheetRef, ...mobile } = navigation.mobile;
	return (
		<>
			{mobile.mobileOpen ? (
				<div {...stylex.props(baseStyles.element, headerStyles.spacer)} />
			) : null}
			<header
				ref={menusRef}
				{...stylex.props(
					baseStyles.element,
					headerStyles.nav,
					mobile.mobileOpen && headerStyles.navOpen,
				)}
				onPointerOver={desktop.cancelMenuClose}
				onPointerLeave={desktop.scheduleMenuClose}
			>
				<HeaderBackdrop mobileOpen={mobile.mobileOpen} openMenu={desktop.openMenu} />
				<HeaderPrimary
					openMenu={desktop.openMenu}
					controls={desktop.controls}
					close={desktop.close}
					closeMobile={mobile.closeMobile}
				/>
				<HeaderActions close={desktop.close} />
				{desktop.openMenu === null ? null : (
					<DesktopMenu menu={desktop.openMenu} onNavigate={desktop.close} />
				)}
				<HeaderMobileToggle {...mobile} toggleRef={toggleRef} />
				<HeaderMobileSheet {...mobile} sheetRef={sheetRef} />
			</header>
		</>
	);
}
