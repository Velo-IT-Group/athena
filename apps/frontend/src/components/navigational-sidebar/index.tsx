import React from 'react';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarRail,
} from '@/components/ui/sidebar';
import NavigationSection from './navigation-section';
import type { NavSection } from '@/types/nav';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BookA, Search } from 'lucide-react';
interface NavigationalSidebarProps
	extends React.ComponentProps<typeof Sidebar> {
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
		className={cn(className)}
		{...props}
	>
		{header && (
			<SidebarHeader className='p-0 border-b'>
				<SidebarMenu>{header}</SidebarMenu>
			</SidebarHeader>
		)}

		<SidebarContent className='gap-0'>
			{/* <SidebarGroup>
				<SidebarGroupContent>
					<div className='flex flex-row items-center gap-2'>
						<Button
							variant='outline'
							className='flex-[1_1_0%] flex items-center overflow-hidden h-7 !py-1 !pl-1.5 !pr-1'
						>
							<BookA className='size-3.5' />

							<span className='truncate text-sm'>
								Quick actions
							</span>

							<div className='ml-auto'>
								<kbd className='text-[rgba(0,0,0,0.4)] h-5 px-1 rounded-sm text-[11px] uppercase -tracking-tight flex flex-row items-center justify-center inset-shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05)]'>
									⌘K
								</kbd>
							</div>
						</Button>

						<Button
							variant='outline'
							className='flex items-center overflow-hidden h-7 !py-1 !pl-1.5 !pr-1'
						>
							<Search className='size-3.5 flex-[0_0_auto]' />

							<div className='ml-auto'>
								<kbd className='text-[rgba(0,0,0,0.4)] h-5 px-1 rounded-sm text-[11px] uppercase -tracking-tight flex flex-row items-center justify-center inset-shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05)]'>
									/
								</kbd>
							</div>
						</Button>
					</div>
				</SidebarGroupContent>
			</SidebarGroup> */}

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

		<SidebarRail />
	</Sidebar>
);

export default NavigationalSidebar;
