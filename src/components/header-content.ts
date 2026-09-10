import { productNav, resourceNav } from "../domain/route";
import { site } from "../domain/site";
import type { MenuId } from "../domain/nav";

export type NavLink = {
	readonly label: string;
	readonly href: string;
	readonly external?: true;
};

export const products = productNav();

export const resources = resourceNav() satisfies readonly NavLink[];

export const menuColumns = {
	products: [products],
	resources: [resources],
} as const satisfies Record<MenuId, readonly (readonly NavLink[])[]>;
export const githubUrl = site.products.localStudio.repository;
