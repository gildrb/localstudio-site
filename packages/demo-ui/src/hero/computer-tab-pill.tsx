import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./computer-header.styles.ts";
import { useState, type ComponentType } from "react";
import type { HeroLucideIcon } from "./computer-tabs";
import { CloseIcon } from "../ui/icons";
export function TabPill({
	icon: Icon,
	label,
	selected,
	shortcut,
	title,
	onSelect,
	onClose,
}: {
	readonly icon?: HeroLucideIcon;
	readonly label: string;
	readonly selected: boolean;
	readonly shortcut?: string | undefined;
	readonly title: string;
	readonly onSelect: () => void;
	readonly onClose?: (() => void) | undefined;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<div
			onMouseEnter={() => {
				setHovered(true);
			}}
			onMouseLeave={() => {
				setHovered(false);
			}}
			{...stylex.props(
				demoStyles.reset,
				styles.tab,
				selected ? styles.selectedTab : styles.idleTab,
			)}
			title={title}
		>
			<button
				type="button"
				onClick={onSelect}
				{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button113)}
			>
				{Icon ? (
					<Icon {...stylex.props(demoStyles.reset, styles.icon116, styles.lucideScale)} />
				) : null}
				<span {...stylex.props(demoStyles.reset, styles.span118)}>{label}</span>
				{shortcut !== undefined && shortcut !== "" ? (
					<span {...stylex.props(demoStyles.reset, styles.span122)}>{shortcut}</span>
				) : null}
			</button>
			<TabClose onClose={onClose} hovered={hovered} selected={selected} label={label} />
		</div>
	);
}

export function HeaderIconButton({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	readonly icon: ComponentType<{ className?: string }>;
	readonly label: string;
	readonly active?: boolean;
	readonly onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			{...stylex.props(
				demoStyles.reset,
				demoStyles.controlReset,
				styles.headerButton,
				active === true ? styles.headerButtonActive : styles.headerButtonIdle,
			)}
			title={label}
			aria-label={label}
			aria-pressed={active}
		>
			<Icon {...stylex.props(demoStyles.reset, styles.icon171, styles.lucideScale)} />
		</button>
	);
}

function TabClose({
	onClose,
	hovered,
	selected,
	label,
}: {
	readonly onClose: (() => void) | undefined;
	readonly hovered: boolean;
	readonly selected: boolean;
	readonly label: string;
}) {
	return onClose ? (
		<button
			type="button"
			onClick={(
				event: Readonly<Pick<import("react").MouseEvent<HTMLButtonElement>, "stopPropagation">>,
			) => {
				event.stopPropagation();
				onClose();
			}}
			{...stylex.props(
				demoStyles.reset,
				demoStyles.controlReset,
				styles.closeButton,
				(hovered || selected) && styles.closeHovered,
			)}
			aria-label={`Close ${label}`}
			title={`Close ${label}`}
		>
			<CloseIcon {...stylex.props(demoStyles.reset, styles.closeicon140)} />
		</button>
	) : null;
}
