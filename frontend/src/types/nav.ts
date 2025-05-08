import type { LucideIcon } from 'lucide-react';
import type { LinkOptions } from '@tanstack/react-router';

export interface NavSection {
	label?: String;
	items: NavItemWithChildren[];
}

export interface NavItem extends LinkOptions {
	title: string;
	disabled?: boolean;
	icon?: LucideIcon;
}

export interface NavItemWithChildren extends NavItem {
	items?: NavItemWithChildren[];
}
