import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Fragment } from "react";
import { LocalLink } from "../components/LocalLink";
import { styles } from "../styles/pages-styles";
import type { OverviewEntry, OverviewTextLink } from "./resources-data";

type EntryProps = { readonly entry: OverviewEntry };

function OverviewLabel({ entry }: EntryProps) {
	return (
		<span
			{...stylex.props(
				baseStyles.element,
				styles.overviewLabel,
				entry.code === true && styles.overviewLabelCode,
			)}
		>
			{entry.label}
		</span>
	);
}

function LinkedOverviewLabel({ entry }: EntryProps) {
	const Icon = entry.external === true ? ArrowUpRight : ArrowRight;
	const label = (
		<>
			<OverviewLabel entry={entry} />
			<Icon
				{...stylex.props(styles.overviewArrow)}
				aria-hidden="true"
				size={14}
				strokeWidth={1.25}
			/>
		</>
	);
	if (entry.href === undefined || entry.href === "") return <OverviewLabel entry={entry} />;
	if (entry.external === true || entry.plain === true) {
		return (
			<a
				{...stylex.props(
					baseStyles.element,
					baseStyles.interactive,
					baseStyles.focusable,
					styles.overviewLink,
				)}
				href={entry.href}
				target={entry.external === true ? "_blank" : undefined}
				rel={entry.external === true ? "noreferrer" : undefined}
			>
				{label}
			</a>
		);
	}
	return (
		<LocalLink sx={styles.overviewLink} href={entry.href}>
			{label}
		</LocalLink>
	);
}

function OverviewTextLinks({ links }: { readonly links: readonly OverviewTextLink[] }) {
	return (
		<>
			{links.map((link, index) => (
				<Fragment key={link.href}>
					{index > 0 ? <> · </> : null}
					<a
						{...stylex.props(
							baseStyles.element,
							baseStyles.interactive,
							baseStyles.focusable,
							styles.overviewTextLink,
						)}
						href={link.href}
						target="_blank"
						rel="noreferrer"
					>
						{link.label}
					</a>
				</Fragment>
			))}
		</>
	);
}

function OverviewRow({ entry }: EntryProps) {
	return (
		<li {...stylex.props(baseStyles.element, styles.overviewRow, styles.docsListItem)}>
			<LinkedOverviewLabel entry={entry} />
			<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.overviewText)}>
				{entry.links === undefined ? entry.text : <OverviewTextLinks links={entry.links} />}
			</p>
		</li>
	);
}

export function OverviewRows({ entries }: { readonly entries: readonly OverviewEntry[] }) {
	return (
		<ul {...stylex.props(baseStyles.list, baseStyles.element, styles.overviewRows)}>
			{entries.map((entry) => (
				<OverviewRow entry={entry} key={entry.label} />
			))}
		</ul>
	);
}

export function OverviewHeading({ title }: { readonly title: string }) {
	return (
		<h2
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.headingTwo,
				styles.docsSectionHeading,
			)}
		>
			{title}
		</h2>
	);
}
