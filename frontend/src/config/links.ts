import {
	Building,
	Cable,
	ChartBarDecreasing,
	ClipboardList,
	FileText,
	Folders,
	Home,
	ListChecks,
	Settings,
	ShoppingBag,
	Ticket,
	User,
	Users,
	Users2,
} from "lucide-react";
import type { NavItem, NavSection } from "@/types/nav";

export interface LinksConfig {
	modules: NavItem[];
	mainNav: NavItem[];
	sidebarNav: NavSection[];
	settingsNav: NavSection[];
	companyTabs: NavItem[];
	contactTabs: NavItem[];
	teamTabs: NavItem[];
	proposalTabs: NavItem[];
}

export const linksConfig: LinksConfig = {
	modules: [],
	mainNav: [],
	sidebarNav: [
		{
			items: [
				{
					title: "Home",
					icon: Home,
					href: "https://athena.velomethod.com",
					// to: "/",
				},
				{
					title: "Coordinator View",
					icon: ChartBarDecreasing,
					href: "https://athena.velomethod.com/coordinator-view",
					// to: "/coordinator-view",
				},
				// {
				// 	title: "Teams",
				// 	icon: Users,
				// 	href: "https://www.athena.velomethod.com/teams",
				// 	// to: "/teams",
				// },
				{
					title: "Tickets",
					icon: Ticket,
					href: "https://athena.velomethod.com/tickets",
					// to: "/tickets",
				},
				{
					title: "Companies",
					icon: Building,
					href: "https://athena.velomethod.com/companies",
					// to: "/companies",
				},
				{
					title: "Contacts",
					icon: User,
					href: "https://athena.velomethod.com/contacts",
					// to: "/contacts",
				},
				{
					title: "Proposals",
					icon: FileText,
					to: "/proposals",
				},
			],
		},
	],
	settingsNav: [
		{
			items: [{ title: "Settings", icon: Settings, to: "/settings" }],
		},
		{
			items: [
				{
					title: "Members",
					icon: Users2,
					to: "/settings/members",
				},
				{
					title: "Templates",
					icon: Folders,
					to: "/settings/templates",
				},
			],
		},
	],
	companyTabs: [
		{
			title: "Overview",
			icon: Home,
			to: "/companies/$id",
		},
		{
			title: "Tickets",
			icon: Ticket,
			to: "/companies/$id/tickets",
		},
		{
			title: "Contacts",
			icon: User,
			to: "/companies/$id/contacts",
		},
		{
			title: "Configurations",
			icon: Cable,
			to: "/companies/$id/configurations",
		},
		{
			title: "Proposals",
			icon: FileText,
			to: "/companies/$id/proposals",
		},
	],
	teamTabs: [
		{
			title: "Overview",
			icon: Home,
			to: "/teams/$id",
		},
	],
	contactTabs: [
		{
			title: "Overview",
			icon: Home,
			to: "/contacts/$id",
		},
		{
			title: "Tickets",
			icon: Ticket,
			to: "/contacts/$id/tickets",
		},
		{
			title: "Configurations",
			icon: Cable,
			to: "/contacts/$id/configurations",
		},
	],
	proposalTabs: [
		{
			title: "Overview",
			icon: ClipboardList,
			to: "/proposals/$id/$version",
		},
		{
			title: "Workplan",
			to: "/proposals/$id/$version/workplan",
			icon: ListChecks,
		},
		{
			title: "Products",
			to: "/proposals/$id/$version/products",
			icon: ShoppingBag,
		},
	],
};
