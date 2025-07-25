import {
	Activity,
	AudioLines,
	Building,
	Cable,
	ChartBarDecreasing,
	ClipboardList,
	File,
	FileText,
	Folders,
	Home,
	LayoutDashboard,
	ListChecks,
	LogOut,
	Phone,
	RadioTower,
	Settings,
	ShoppingBag,
	Ticket,
	User,
	UserPlus,
	Users,
	Users2,
	Workflow,
} from "lucide-react";
import type { NavItem, NavSection } from "@/types/nav";

export interface LinksConfig {
	modules: NavItem[];
	mainNav: NavItem[];
	sidebarNav: NavSection[];
	companyTabs: NavSection[];
	contactTabs: NavItem[];
	teamTabs: NavItem[];
	proposalTabs: NavSection[];
	userDropdown: NavSection[];
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
			],
		},
		{
			// label: "Client Experience",
			items: [
				{
					title: "Engagements",
					icon: ChartBarDecreasing,
					to: "/engagements",
					badge: "2",
				},
				{
					title: "Teams",
					icon: Users,
					to: "/teams",
				},
			],
		},
		{
			items: [
				{
					title: "Proposals",
					icon: FileText,
					to: "/proposals",
				},
			],
		},
	],
	companyTabs: [
		{
			items: [
				{
					title: "Activity",
					icon: Activity,
					to: "/companies/$id/activity",
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
				{
					title: "Notes",
					icon: File,
					to: "/companies/$id/proposals",
				},
			],
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
		{
			title: "Engagements",
			icon: AudioLines,
			to: "/contacts/$id/engagements",
		},
	],
	proposalTabs: [
		{
			items: [
				{
					title: "Overview",
					icon: ClipboardList,
					to: "/proposals/$id/$version",
				},
			],
		},
		{
			items: [
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
		},
	],
	userDropdown: [
		{
			items: [
				{
					title: "Sign out",
					icon: LogOut,
					to: "/auth/login",
				},
			],
		},
	],
};
