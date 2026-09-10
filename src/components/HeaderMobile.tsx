import * as stylex from "@stylexjs/stylex";
import { ChevronDown, Equal, X } from "lucide-react";
import { useState, type RefObject } from "react";
import { baseStyles } from "../styles/base-styles";
import { headerStyles } from "../styles/header-styles";
import { site } from "../domain/site";
import { downloadLabel, downloadPath } from "../domain/route";
import { LocalLink } from "./LocalLink";
import { products, resources, githubUrl, type NavLink } from "./header-content";
import { MenuItems } from "./HeaderMenuItems";

type MobileNavigateProps = { readonly closeMobile: () => void };

function MobileMenuGroup({
	label,
	items,
	onNavigate,
}: {
	readonly label: string;
	readonly items: readonly NavLink[];
	readonly onNavigate: () => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<details
			name="mobile-nav"
			{...stylex.props(baseStyles.element, headerStyles.sheetGroup)}
			onToggle={(event: { readonly currentTarget: Readonly<Pick<HTMLDetailsElement, "open">> }) => {
				setOpen(event.currentTarget.open);
			}}
		>
			<summary
				{...stylex.props(
					baseStyles.element,
					baseStyles.interactive,
					baseStyles.focusable,
					headerStyles.sheetSummary,
				)}
			>
				{label}
				<ChevronDown
					{...stylex.props(headerStyles.sheetChevron, open && headerStyles.chevronOpen)}
					size={20}
					strokeWidth={1.25}
					aria-hidden="true"
				/>
			</summary>
			<MenuItems items={items} onNavigate={onNavigate} />
		</details>
	);
}

function MobileCompanyLink({ closeMobile }: MobileNavigateProps) {
	return (
		<a
			{...stylex.props(
				baseStyles.element,
				baseStyles.interactive,
				baseStyles.focusable,
				headerStyles.sheetItem,
				headerStyles.sheetLink,
			)}
			href={site.company.url}
			onClick={closeMobile}
		>
			<span {...stylex.props(baseStyles.element, headerStyles.triggerSurface)} aria-hidden="true" />
			Company
		</a>
	);
}

function MobileNavigation({ closeMobile }: MobileNavigateProps) {
	return (
		<nav
			{...stylex.props(baseStyles.element, headerStyles.sheetNav)}
			aria-label="Mobile navigation"
		>
			<MobileMenuGroup label="Products" items={products} onNavigate={closeMobile} />
			<MobileMenuGroup label="Resources" items={resources} onNavigate={closeMobile} />
			<MobileCompanyLink closeMobile={closeMobile} />
		</nav>
	);
}

function MobileActions({ closeMobile }: MobileNavigateProps) {
	return (
		<div {...stylex.props(baseStyles.element, headerStyles.sheetActions)}>
			<LocalLink
				sx={[headerStyles.button, headerStyles.sheetAction]}
				href={downloadPath}
				onClick={closeMobile}
			>
				{downloadLabel()}
			</LocalLink>
			<a
				{...stylex.props(
					baseStyles.element,
					baseStyles.interactive,
					baseStyles.focusable,
					headerStyles.button,
					headerStyles.sheetAction,
				)}
				href={githubUrl}
				target="_blank"
				rel="noreferrer"
				onClick={closeMobile}
			>
				GitHub
			</a>
		</div>
	);
}

export function HeaderMobileSheet({
	sheetId,
	sheetRef,
	mobileOpen,
	closeMobile,
}: {
	readonly sheetId: string;
	readonly sheetRef: RefObject<HTMLDialogElement | null>;
	readonly mobileOpen: boolean;
	readonly closeMobile: () => void;
}) {
	return (
		<dialog
			id={sheetId}
			ref={sheetRef}
			{...stylex.props(
				baseStyles.dialog,
				baseStyles.element,
				headerStyles.sheet,
				mobileOpen && headerStyles.sheetOpen,
			)}
			aria-modal={mobileOpen || undefined}
			aria-label="Navigation menu"
			aria-hidden={!mobileOpen}
			inert={!mobileOpen || undefined}
		>
			<MobileNavigation closeMobile={closeMobile} />
			<MobileActions closeMobile={closeMobile} />
		</dialog>
	);
}

export function HeaderMobileToggle({
	sheetId,
	toggleRef,
	mobileOpen,
	setSheetOpen,
}: {
	readonly sheetId: string;
	readonly toggleRef: RefObject<HTMLButtonElement | null>;
	readonly mobileOpen: boolean;
	readonly setSheetOpen: (open: boolean) => void;
}) {
	return (
		<button
			ref={toggleRef}
			type="button"
			{...stylex.props(
				baseStyles.element,
				baseStyles.interactive,
				baseStyles.focusable,
				baseStyles.button,
				headerStyles.toggle,
			)}
			aria-label={mobileOpen ? "Close menu" : "Open menu"}
			aria-expanded={mobileOpen}
			aria-controls={sheetId}
			onClick={() => {
				setSheetOpen(!mobileOpen);
			}}
		>
			{mobileOpen ? (
				<X size={22} strokeWidth={1.5} aria-hidden="true" />
			) : (
				<Equal size={22} strokeWidth={1.5} aria-hidden="true" />
			)}
		</button>
	);
}
