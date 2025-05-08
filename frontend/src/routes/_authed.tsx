import { createClient } from '@/lib/supabase/server';
import { createClient as createTwilioClient } from '@/utils/twilio';
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
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
import { Plus, Settings } from 'lucide-react';
import NavigationalSidebar from '@/components/navigational-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { linksConfig } from '@/config/links';
import NavigationItem from '@/components/navigational-sidebar/navigation-item';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getPinnedItems, getProfile, getTeams } from '@/lib/supabase/read';
import type { Session, User } from '@supabase/supabase-js';
import { env } from '@/lib/utils';
import GlobalNav from '@/components/global-nav';
import { WorkerProvider } from '@/providers/worker-provider';
import type { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import TaskList from '@/components/worker-sidebar/task-list';
import { pinnedIcons } from '@/utils/icon-sets';
import { createAccessToken } from '@/lib/twilio';
import { getActivitiesQuery } from '@/lib/twilio/api';
import { DAY_IN_MS } from '@/components/template-catalog';

export const getWorker = createServerFn()
	.validator((sid: string) => sid)
	.handler(async ({ data }) => {
		const client = await createTwilioClient();
		const worker = await client.taskrouter.v1.workspaces(env.VITE_TWILIO_WORKSPACE_SID).workers(data).fetch();

		return worker.toJSON();
	});

export const fetchSessionUser = createServerFn().handler(async () => {
	const supabase = createClient();
	const [
		{
			data: { session },
			error,
		},
		{
			data: { user },
			error: userError,
		},
	] = await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]);

	return {
		session: JSON.parse(JSON.stringify(session)) as Session,
		user: JSON.parse(JSON.stringify(user)) as User,
		error: error ?? userError,
	};
});

export const Route = createFileRoute('/_authed')({
	component: AuthComponent,
	beforeLoad: async () => {
		const { user, session, error } = await fetchSessionUser();

		if (!user || !session) {
			throw redirect({ to: '/login', statusCode: 301, params: { error } });
		}

		const [accessToken, profile] = await Promise.all([
			createAccessToken({
				data: {
					identity: user?.email ?? '',
					workerSid:
						user?.user_metadata.workerSid ??
						user?.user_metadata.worker_sid ??
						// 'WKb7a43c7e5a528bd10fae1e5dd554e16b',
						'WK9e9f8637ee0ec4a19547fce618fd0fed',
				},
			}),
			getProfile({ data: user.id }),
		]);

		return { user, session, accessToken, profile, features: { hideQueueStatus: false } };
	},
	// staleTime: DAY_IN_MS,
	// shouldReload: false,
});

function AuthComponent() {
	const { session, profile, user } = Route.useRouteContext();
	const { sidebarNav } = linksConfig;

	const [{}, { data: worker }, {}, { data: pinnedItems }, { data: accessToken }] = useSuspenseQueries({
		queries: [
			{ queryKey: ['teams'], queryFn: getTeams, staleTime: Infinity },
			{
				queryKey: ['workers', 'WK9e9f8637ee0ec4a19547fce618fd0fed'],
				queryFn: () => getWorker({ data: 'WK9e9f8637ee0ec4a19547fce618fd0fed' }),
				staleTime: Infinity,
			},
			getActivitiesQuery(),
			{
				queryKey: ['pinned_items'],
				queryFn: getPinnedItems,
				staleTime: Infinity,
			},
			{
				queryKey: ['access-token'],
				queryFn: () =>
					createAccessToken({
						data: {
							identity: user?.email ?? '',
							workerSid:
								user?.user_metadata.workerSid ??
								user?.user_metadata.worker_sid ??
								'WK9e9f8637ee0ec4a19547fce618fd0fed',
						},
					}),
				staleTime: () => 1000 * 60 * 60 * 24,
			},
		],
	});

	return (
		<SidebarProvider
			defaultOpen={false}
			className='flex h-screen flex-col overflow-y-hidden'
		>
			<WorkerProvider authToken={accessToken}>
				<GlobalNav
					profile={profile}
					session={session as Session}
					worker={worker as WorkerInstance}
					accessToken={accessToken}
				/>

				<div className='flex flex-1'>
					<NavigationalSidebar
						sections={sidebarNav}
						header={
							<SidebarMenuItem>
								<SidebarMenuButton className='rounded-full bg-primary text-white dark:text-black transition-all'>
									<Plus />
									<span>Create</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						}
						additionalContent={
							<>
								<SidebarGroup>
									<SidebarGroupLabel>Pinned Items</SidebarGroupLabel>

									<SidebarGroupContent>
										<SidebarMenu>
											{/* @ts-ignore  */}
											{pinnedItems?.map((item) => {
												const Icon = pinnedIcons[item.record_type];
												return (
													<SidebarMenuItem key={item.id}>
														<SidebarMenuButton asChild>
															<Link
																to={item.path ?? ''}
																params={item.params}
															>
																{Icon && <Icon />}
																<span>{item.helper_name}</span>
															</Link>
														</SidebarMenuButton>
													</SidebarMenuItem>
												);
											})}
										</SidebarMenu>
									</SidebarGroupContent>
								</SidebarGroup>

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
