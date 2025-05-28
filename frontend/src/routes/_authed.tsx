import { createClient } from '@/lib/supabase/server';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarInset,
	SidebarMenu,
	SidebarProvider,
} from '@/components/ui/sidebar';
import { Trash } from 'lucide-react';
import NavigationalSidebar from '@/components/navigational-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { linksConfig } from '@/config/links';
import NavigationItem from '@/components/navigational-sidebar/navigation-item';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getProfile } from '@/lib/supabase/read';
import { pinnedIcons } from '@/utils/icon-sets';
import { getPinnedItemsQuery } from '@/lib/supabase/api';
import { usePinnedItems } from '@/hooks/use-pinned-items';
import GlobalNav from '@/components/global-nav';
import type { Session } from '@supabase/supabase-js';

export const Route = createFileRoute('/_authed')({
	component: AuthComponent,
	beforeLoad: async ({ context }) => {
		console.log(context.session);
		if (!context.session) throw redirect({ to: '/login' });

		const profile = await getProfile({ data: context.session.user.id });

		return { profile };
	},
});

function AuthComponent() {
	const { session, profile } = Route.useRouteContext();
	const { sidebarNav } = linksConfig;

	const [{ data: pinnedItems }] = useSuspenseQueries({
		queries: [getPinnedItemsQuery()],
	});

	const { handlePinnedItemDeletion } = usePinnedItems();

	return (
		<SidebarProvider
			defaultOpen={false}
			className='flex h-screen flex-col overflow-y-hidden'
		>
			<GlobalNav
				profile={profile}
				session={session as Session}
			/>

			<div className='flex flex-1'>
				<NavigationalSidebar
					sections={sidebarNav}
					additionalContent={
						<>
							{pinnedItems.length > 0 && (
								<SidebarGroup>
									<SidebarGroupLabel>Pinned Items</SidebarGroupLabel>

									<SidebarGroupContent>
										<SidebarMenu>
											{pinnedItems?.map((item) => {
												const Icon = pinnedIcons[item.record_type];

												return (
													<NavigationItem
														key={item.id}
														item={{
															title: item.helper_name,
															to: item.path as any,
															params: item.params as Record<string, any>,
															icon: Icon,
														}}
														actions={[
															{
																label: 'Delete',
																icon: Trash,
																action: () => {
																	handlePinnedItemDeletion.mutate(item.id);
																},
															},
														]}
													/>
												);
											})}
										</SidebarMenu>
									</SidebarGroupContent>
								</SidebarGroup>
							)}
						</>
					}
					collapsible='icon'
				/>

				<SidebarInset className='relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto p-0 [&_section]:px-6'>
					<ScrollArea className='!h-[calc(100svh-var(--navbar-height))] flex flex-col [&_section]:px-6'>
						<Outlet />
					</ScrollArea>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
