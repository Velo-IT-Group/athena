import type { LucideIcon } from "lucide-react";
import type { LinkOptions } from "@tanstack/react-router";

export interface NavSection {
	label?: string;
	items: NavItemWithChildren[];
}

export interface NavItem extends LinkOptions {
	title: string;
	disabled?: boolean;
	icon?: LucideIcon;
	badge?: string | number;
}

export interface Action {
	title: string;
	action: () => void;
}

export interface NavItemWithChildren extends NavItem {
	items?: NavItemWithChildren[];
	actions?: Action[];
}
