import NavigationalSidebar from '@/components/navigational-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar';
import { linksConfig } from '@/config/links';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

export const Route = createFileRoute('/settings')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className='re [--navbar-height:calc(theme(spacing.12))]'>
			<SidebarProvider defaultOpen={true}>
				<NavigationalSidebar
					sections={linksConfig.settingsNav}
					header={
						<SidebarMenuItem>
							<SidebarMenuButton
								className='rounded-full bg-primary text-white'
								asChild
							>
								<Link to='/'>
									<ChevronLeft />
									<span>Back</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					}
					collapsible='icon'
					className='!h-screen top-0'
				/>

				<SidebarInset className=''>
					<ScrollArea className='h-[calc(100vh-var(--navbar-height))] p-3'>
						<Outlet />
					</ScrollArea>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
