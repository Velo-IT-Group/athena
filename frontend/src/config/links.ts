import {
	Building,
	Cable,
	ChartBarDecreasing,
	FileText,
	Home,
	Settings,
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
					to: "/",
				},
				{
					title: "Coordinator View",
					icon: ChartBarDecreasing,
					to: "/coordinator-view",
				},
				{
					title: "Teams",
					icon: Users,
					to: "/teams",
				},
				{
					title: "Tickets",
					icon: Ticket,
					to: "/tickets",
				},
				{
					title: "Companies",
					icon: Building,
					to: "/companies",
				},
				{
					title: "Contacts",
					icon: User,
					to: "/contacts",
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
			items: [{
				title: "Members",
				icon: Users2,
				to: "/settings/members",
			}],
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
};
