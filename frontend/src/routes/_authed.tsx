import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from '@/components/ui/sidebar';
import { Plus, Settings, Trash } from 'lucide-react';
import NavigationalSidebar from '@/components/navigational-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { linksConfig } from '@/config/links';
import NavigationItem from '@/components/navigational-sidebar/navigation-item';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getProfile } from '@/lib/supabase/read';
import type { Session } from '@supabase/supabase-js';
import GlobalNav from '@/components/global-nav';
import { WorkerProvider } from '@/providers/worker-provider';
import TaskList from '@/components/worker-sidebar/task-list';
import { pinnedIcons } from '@/utils/icon-sets';
import { getAccessTokenQuery, getActivitiesQuery, getWorkerQuery } from '@/lib/twilio/api';
import { getPinnedItemsQuery, getTeamsQuery } from '@/lib/supabase/api';
import OutboundDialer from '@/components/outbound-dialer';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { usePinnedItems } from '@/hooks/use-pinned-items';

export const Route = createFileRoute('/_authed')({
	component: AuthComponent,
	beforeLoad: async ({ context }) => {
		if (!context.session) throw redirect({ to: '/login' });

		const profile = await getProfile({ data: context.session.user.id });

		return { user: context.session.user, session: context.session, profile, features: { hideQueueStatus: false } };
	},
});

function AuthComponent() {
	const { session, profile, user } = Route.useRouteContext();
	const { sidebarNav } = linksConfig;

	const [{}, { data: worker }, {}, { data: pinnedItems }, { data: accessToken }] = useSuspenseQueries({
		queries: [
			getTeamsQuery(),
			getWorkerQuery('WK00f8c2c83262647dc5779fe20fc3220b'),
			getActivitiesQuery(),
			getPinnedItemsQuery(),
			getAccessTokenQuery({
				identity: user?.email ?? '',
				workerSid: 'WK00f8c2c83262647dc5779fe20fc3220b',
			}),
		],
	});

	const { handlePinnedItemDeletion } = usePinnedItems();

	return (
		<SidebarProvider
			defaultOpen={false}
			className='flex h-screen flex-col overflow-y-hidden'
		>
			<WorkerProvider authToken={accessToken}>
				<GlobalNav
					profile={profile}
					session={session as Session}
					// worker={worker as WorkerInstance}
				/>

				<div className='flex flex-1'>
					<NavigationalSidebar
						sections={sidebarNav}
						header={
							<Dialog>
								<SidebarMenuItem>
									<DialogTrigger asChild>
										<SidebarMenuButton className='rounded-full bg-primary text-white dark:text-black transition-all'>
											<Plus />
											<span>Create</span>
										</SidebarMenuButton>
									</DialogTrigger>
								</SidebarMenuItem>

								<DialogContent>
									<OutboundDialer />
								</DialogContent>

								{/* <DropdownMenuContent
									side='right'
									align='start'
									sideOffset={12}
								>
									<DropdownMenuItem
										onSelect={() => {
											toast.custom((t) => <OutboundDialer />, { duration: Infinity });
										}}
									>
										<PhoneOutgoing />
										<span>Start call</span>
									</DropdownMenuItem>
								</DropdownMenuContent> */}
							</Dialog>
						}
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

								<TaskList />
							</>
						}
						footer={
							<NavigationItem
								item={{
									title: 'Settings',
									to: '/settings',
									icon: Settings,
								}}
							/>
						}
						collapsible='icon'
					/>

					<SidebarInset className='relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto p-0'>
						<ScrollArea className='!h-[calc(100svh-var(--navbar-height))] flex flex-col [&_section]:px-6'>
							<Outlet />
						</ScrollArea>
					</SidebarInset>
				</div>
			</WorkerProvider>
		</SidebarProvider>
	);
}

{
	/* <DraggableWrapper
		          title={"Private Notepad"}
		          width="min-w-96"
		          height="auto"
		          fullScreenWidth="60%"
		          fullScreenHeight="auto"
		          onFullScreenChange={setIsFullScreen}
		          maximizeButton={
		            <Button
		              variant={"outline"}
		              size={"icon"}
		              className="rounded-md p-2"
		            >
		              {isFullScreen ? (
		                <Minimize strokeWidth={3} />
		              ) : (
		                <Maximize strokeWidth={3} />
		              )}
		            </Button>
		          }
		          minimizeButton={
		            <Button
		              variant={"outline"}
		              size={"icon"}
		              className="rounded-md p-2"
		            >
		              <ChevronDown strokeWidth={3} />
		            </Button>
		          }
		        >
		          <Tiptap
		            content={JSON.parse(
		              localStorage.getItem("private-notepad") ?? "[]",
		            )}
		            placeholder="Type something..."
		            onBlur={({ editor }) => {
		              if (localStorage) {
		                localStorage.setItem(
		                  "private-notepad",
		                  JSON.stringify(editor.getJSON()),
		                );
		              }
		            }}
		          />
		        </DraggableWrapper> */
}

{
	/* {data ? (
		          <DraggableWrapper
		            title={"Google — 25 Years in Search: The Most Searched"}
		            width="min-w-96"
		            height="auto"
		            fullScreenWidth="60%"
		            fullScreenHeight="auto"
		            onFullScreenChange={setIsFullScreen}
		            maximizeButton={
		              <Button
		                variant={"outline"}
		                size={"icon"}
		                className="rounded-md p-2"
		              >
		                {isFullScreen ? (
		                  <Minimize strokeWidth={3} />
		                ) : (
		                  <Maximize strokeWidth={3} />
		                )}
		              </Button>
		            }
		            minimizeButton={
		              <Button
		                variant={"outline"}
		                size={"icon"}
		                className="rounded-md p-2"
		              >
		                <ChevronDown strokeWidth={3} className="size-4" />
		              </Button>
		            }
		          >
		            <Card>
		              <CardHeader>
		                <CardTitle>Testing</CardTitle>
		              </CardHeader>
		            </Card>
		            <RealtimeChat
		              roomName="macrodata_refinement_office"
		              username="Mark Scout"
		              conversation={data}
		            />
		          </DraggableWrapper>
		        ) : null} */
}
