import { createClient } from '@/lib/supabase/server';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useEffect } from 'react';
import z from 'zod';

// import { linksConfig } from '@/config/links';
// import { TwilioProvider } from '@/contexts/twilio-provider';
// import { createClient } from '@/lib/supabase/client';
// import { getProfile } from '@/lib/supabase/read';
// import { createAccessToken } from '@/lib/twilio';
// import { getAccessTokenQuery } from '@/lib/twilio/api';
// import { workerAttributesSchema } from '@/types/twilio';

const schema = z.object({
	modal: z.enum(['note']).optional(),
	id: z.string().optional(),
});

export const Route = createFileRoute('/_authed')({
	component: AuthComponent,
	validateSearch: zodValidator(schema),
	beforeLoad: async ({ context, location }) => {
		// if (!context.session)
		// 	throw redirect({
		// 		to: '/auth/login',
		// 		search: { redirect: location.href },
		// 	});
		// const { session, user } = context;
		// const profile = await getProfile({ data: user.id });
		// const workerSid = profile.worker_sid ?? '';
		// const attributes = workerAttributesSchema.parse(user.user_metadata);
		// const accessToken = await createAccessToken({
		// 	data: {
		// 		identity: user?.email ?? attributes.identity,
		// 		workerSid,
		// 	},
		// });
		// return {
		// 	user,
		// 	session,
		// 	// profile,
		// 	accessToken: '',
		// 	// workerSid,
		// 	// identity: user?.email ?? attributes.identity,
		// 	features: { hideQueueStatus: false },
		// 	defaultOpen: true,
		// };
	},
	// ssr: 'data-only',
});

function AuthComponent() {
	// const {
	// 	user,
	// 	accessToken: initialAccessToken,
	// 	workerSid,
	// 	identity,
	// 	defaultOpen,
	// } = Route.useRouteContext();

	// useEffect(() => {
	// 	const supabase = createClient();

	// 	const authListener = supabase.auth.onAuthStateChange(
	// 		(event, session) => {
	// 			if (session && session.provider_token) {
	// 				window.localStorage.setItem(
	// 					'oauth_provider_token',
	// 					session.provider_token
	// 				);
	// 			}
	// 			if (session && session.provider_refresh_token) {
	// 				window.localStorage.setItem(
	// 					'oauth_provider_refresh_token',
	// 					session.provider_refresh_token
	// 				);
	// 			}
	// 			if (event === 'SIGNED_OUT') {
	// 				window.localStorage.removeItem('oauth_provider_token');
	// 				window.localStorage.removeItem(
	// 					'oauth_provider_refresh_token'
	// 				);
	// 			}
	// 		}
	// 	);

	// 	return () => {
	// 		authListener.data.subscription.unsubscribe();
	// 	};
	// }, []);

	// const { modal, id } = Route.useSearch();
	// const { sidebarNav } = linksConfig;

	// const [{ data: accessToken }] = useQueries({
	// 	queries: [
	// 		{
	// 			...getAccessTokenQuery({
	// 				identity,
	// 				workerSid,
	// 			}),
	// 			initialData: initialAccessToken,
	// 		},
	// 	],
	// });

	return (
		<div
		// defaultOpen={defaultOpen}
		// className='flex h-screen flex-col overflow-hidden flex-[1_1 auto] relative'
		>
			{/* <TwilioProvider
				token={accessToken}
				workerSid={workerSid}
				identity={user?.email ?? ''}
			> */}
			<div className='flex flex-1'>
				{/* <NavigationalSidebar
						sections={sidebarNav}
						header={
							<SidebarMenuItem>
								<DropdownMenu>
									<div className='flex items-center hover:bg-sidebar-accent'>
										<DropdownMenuTrigger asChild>
											<SidebarMenuButton
												size='lg'
												className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none px-2 h-12 gap-0'
											>
												<div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-[30%]'>
													<VeloLogo className='size-5 text-white fill-white' />
												</div>

												<div className='flex flex-row flex-[1_1_0%] items-center overflow-hidden'>
													<span className='ml-3 mr-1 tracking-tight font-semibold text-base truncate'>
														Velo IT Group
													</span>

													<ChevronDown className='size-3.5 flex-[0_0_auto]' />
												</div>
											</SidebarMenuButton>
										</DropdownMenuTrigger>
										<SidebarTrigger />
									</div>

									<DropdownMenuContent
										className='w-72'
										align='start'
										alignOffset={8}
									>
										{linksConfig.userDropdown.map(
											(item, index) => (
												<DropdownMenuGroup
													key={`dropdown-group-${index}`}
												>
													<>
														{item.items.map(
															(item) => (
																<DropdownMenuItem
																	key={
																		item.title
																	}
																	asChild
																>
																	<Link
																		{...item}
																		className='flex items-center gap-2'
																	>
																		{item.icon && (
																			<item.icon className='size-4' />
																		)}
																		<span>
																			{
																				item.title
																			}
																		</span>
																	</Link>
																</DropdownMenuItem>
															)
														)}
														{index !==
															linksConfig
																.userDropdown
																.length -
																1 && (
															<DropdownMenuSeparator />
														)}
													</>
												</DropdownMenuGroup>
											)
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						}
						// footer={
						// 	<NavigationItem
						// 		item={{
						// 			title: 'Settings',
						// 			to: '/settings',
						// 			icon: Settings,
						// 		}}
						// 	/>
						// }
						collapsible='offcanvas'
					/> */}

				<div className='flex flex-[1_1_auto] relative flex-col p-0'>
					<div className='flex w-full'>
						<div className='flex flex-[1_1_auto] flex-col items-stretch justify-start gap-0 max-w-full !overflow-y-visible'>
							{/* <SiteHeader /> */}

							<Outlet />
						</div>
					</div>
				</div>
			</div>
			{/* </TwilioProvider> */}

			{/* <SearchModal /> */}
		</div>
	);
}
