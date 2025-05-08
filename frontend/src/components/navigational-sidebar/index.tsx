import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu } from '@/components/ui/sidebar';
import NavigationSection from './navigation-section';
import type { NavSection } from '@/types/nav';
import { cn } from '@/lib/utils';
interface NavigationalSidebarProps extends React.ComponentProps<typeof Sidebar> {
	sections: NavSection[];
	additionalContent?: React.ReactNode;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	className?: string;
}

const NavigationalSidebar = ({
	sections,
	header,
	footer,
	className,
	additionalContent,
	...props
}: NavigationalSidebarProps) => (
	<Sidebar
		className={cn('top-[var(--navbar-height)] !h-[calc(100svh-var(--navbar-height))]', className)}
		{...props}
	>
		{header && (
			<SidebarHeader>
				<SidebarMenu>{header}</SidebarMenu>
			</SidebarHeader>
		)}

		<SidebarContent>
			{sections.map((section, index) => (
				<NavigationSection
					key={`sidebar-group-${index}`}
					section={section}
				/>
			))}
			{additionalContent && additionalContent}
		</SidebarContent>

		{footer && (
			<SidebarFooter>
				<SidebarMenu>{footer}</SidebarMenu>
			</SidebarFooter>
		)}
	</Sidebar>
);

export default NavigationalSidebar;
