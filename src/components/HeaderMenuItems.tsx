import * as stylex from "@stylexjs/stylex";
import { baseStyles } from "../styles/base-styles";
import { headerStyles } from "../styles/header-styles";
import type { NavLink } from "./header-content";
import { LocalLink } from "./LocalLink";

type MenuListProps = {
	readonly items: readonly NavLink[];
	readonly onNavigate: () => void;
	readonly desktop?: boolean;
};

function MenuItem({
	item,
	onNavigate,
	desktop,
}: {
	readonly item: NavLink;
	readonly onNavigate: () => void;
	readonly desktop: boolean;
}) {
	const itemSx = desktop ? headerStyles.menuItem : headerStyles.sheetItem;
	return (
		<li role={desktop ? "none" : undefined} {...stylex.props(baseStyles.element)}>
			{item.external ? (
				<a
					{...stylex.props(
						baseStyles.element,
						baseStyles.interactive,
						baseStyles.focusable,
						itemSx,
					)}
					href={item.href}
					target="_blank"
					rel="noreferrer"
					onClick={onNavigate}
					role={desktop ? "menuitem" : undefined}
				>
					{item.label}
				</a>
			) : (
				<LocalLink
					sx={itemSx}
					href={item.href}
					onClick={onNavigate}
					role={desktop ? "menuitem" : undefined}
				>
					{item.label}
				</LocalLink>
			)}
		</li>
	);
}

export function MenuItems({ items, onNavigate, desktop = false }: MenuListProps) {
	const sx = desktop ? headerStyles.menuItems : headerStyles.sheetItems;
	return (
		<ul
			{...stylex.props(baseStyles.list, baseStyles.element, sx)}
			role={desktop ? "none" : undefined}
		>
			{items.map((item) => (
				<MenuItem key={item.label} item={item} onNavigate={onNavigate} desktop={desktop} />
			))}
		</ul>
	);
}
