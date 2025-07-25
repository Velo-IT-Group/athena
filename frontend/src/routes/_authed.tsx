import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
} from '@tanstack/react-router';
import {
	SidebarInset,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { ChevronDown, Settings } from 'lucide-react';
import NavigationalSidebar from '@/components/navigational-sidebar';
import { linksConfig } from '@/config/links';
import NavigationItem from '@/components/navigational-sidebar/navigation-item';
import { useQueries } from '@tanstack/react-query';
import { getProfile } from '@/lib/supabase/read';
import { getAccessTokenQuery } from '@/lib/twilio/api';
import { createAccessToken } from '@/lib/twilio';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchModal } from '@/components/search/search-modal';
import { TwilioProvider } from '@/contexts/twilio-provider';
import { zodValidator } from '@tanstack/zod-adapter';
import z from 'zod';
import VeloLogo from '@/components/logo';
import { SiteHeader } from '@/components/app-header';
import { workerAttributesSchema } from '@/types/twilio';

const schema = z.object({
	modal: z.enum(['note']).optional(),
	id: z.string().optional(),
});

export const Route = createFileRoute('/_authed')({
	component: AuthComponent,
	validateSearch: zodValidator(schema),
	beforeLoad: async ({ context }) => {
		if (!context.session) throw redirect({ to: '/auth/login' });

		const { session, user } = context;

		const profile = await getProfile({ data: user.id });

		const workerSid = profile.worker_sid ?? '';

		const attributes = workerAttributesSchema.parse(user.user_metadata);

		const accessToken = await createAccessToken({
			data: {
				identity: attributes.identity,
				workerSid,
			},
		});

		return {
			user,
			session,
			profile,
			accessToken,
			workerSid,
			identity: attributes.identity,
			features: { hideQueueStatus: false },
			defaultOpen: true,
		};
	},
	ssr: 'data-only',
});

function AuthComponent() {
	const {
		user,
		accessToken: initialAccessToken,
		workerSid,
		identity,
		defaultOpen,
	} = Route.useRouteContext();
	const { modal, id } = Route.useSearch();
	const { sidebarNav } = linksConfig;

	const [{ data: accessToken }] = useQueries({
		queries: [
			{
				...getAccessTokenQuery({
					identity,
					workerSid,
				}),
				initialData: initialAccessToken,
			},
		],
	});

	return (
		<SidebarProvider
			defaultOpen={defaultOpen}
			// className='flex h-screen flex-col overflow-hidden flex-[1_1 auto] relative'
		>
			<TwilioProvider
				token={accessToken}
				workerSid={workerSid}
				identity={user?.email ?? ''}
			>
				<div className='flex flex-1'>
					<NavigationalSidebar
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
					/>

					<SidebarInset className='flex flex-[1_1_auto] relative flex-col p-0'>
						<div className='flex w-full'>
							<div className='flex flex-[1_1_auto] flex-col items-stretch justify-start gap-0 max-w-full !overflow-y-visible'>
								<SiteHeader />

								<Outlet />
							</div>
						</div>
					</SidebarInset>
				</div>
			</TwilioProvider>

			<SearchModal />
		</SidebarProvider>
	);
}
