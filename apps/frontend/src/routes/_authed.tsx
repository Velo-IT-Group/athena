import { workerAttributesSchema } from '@athena/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	createFileRoute,
	Outlet,
	redirect,
	useNavigate,
} from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { ChevronDown, LogOut, Moon, MoonStar, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { SiteHeader } from '@/components/app-header';
import VeloLogo from '@/components/logo';
import NavigationalSidebar from '@/components/navigational-sidebar';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	SidebarInset,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { linksConfig } from '@/config/links';
import { TwilioProvider } from '@/contexts/twilio-provider';
import { createClient } from '@/lib/supabase/client';
import { getProfile } from '@/lib/supabase/read';
import { createAccessToken } from '@/lib/twilio';
import { getAccessTokenQuery } from '@/lib/twilio/api';
import { useTheme } from '@/providers/theme-provider';

const schema = z.object({
	modal: z.enum(['note']).optional(),
	id: z.string().optional(),
});

export const Route = createFileRoute('/_authed')({
	component: AuthComponent,
	validateSearch: zodValidator(schema),
	beforeLoad: async ({ context, location }) => {
		if (!context.session) {
			throw redirect({
				to: '/auth/login',
				search: { redirect: location.href },
			});
		}
		const { session, user } = context;
		const profile = await getProfile({ data: user.id });
		const workerSid = profile.worker_sid ?? '';
		const attributes = workerAttributesSchema.parse(user.user_metadata);
		const accessToken = await createAccessToken({
			data: {
				identity: user?.email ?? attributes.identity,
				workerSid,
			},
		});
		return {
			profile,
			accessToken,
			workerSid,
			identity: user?.email ?? attributes.identity,
			features: { hideQueueStatus: false },
			defaultOpen: true,
		};
	},
	ssr: 'data-only',
});

function AuthComponent() {
	const { user, accessToken, identity, workerSid, defaultOpen } =
		Route.useRouteContext();
	const navigate = useNavigate();

	const supabase = createClient();

	// const { modal, id } = Route.useSearch();
	const { sidebarNav } = linksConfig;

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (session?.provider_token) {
				window.localStorage.setItem(
					'oauth_provider_token',
					session.provider_token
				);
			}
			if (session?.provider_refresh_token) {
				window.localStorage.setItem(
					'oauth_provider_refresh_token',
					session.provider_refresh_token
				);
			}
			if (event === 'SIGNED_OUT') {
				window.localStorage.removeItem('oauth_provider_token');
				window.localStorage.removeItem('oauth_provider_refresh_token');
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [supabase.auth.onAuthStateChange]);

	useQuery({
		...getAccessTokenQuery({ identity, workerSid }),
		initialData: accessToken,
	});

	const handleSignOut = useMutation({
		mutationFn: async () => supabase.auth.signOut(),
		onError(error) {
			toast.error(
				`There was an error in signing you out: ${error.message}`
			);
		},
		onSuccess: () => {
			toast.success('Signed out successfully');
			navigate({ to: '/auth/login' });
		},
	});

	const { theme: activeTheme, setTheme, themes } = useTheme();

	return (
		<SidebarProvider
			defaultOpen={defaultOpen}
			// className='flex h-screen flex-col overflow-hidden flex-[1_1 auto] relative'
		>
			<TwilioProvider
				token={accessToken ?? ''}
				workerSid={workerSid ?? ''}
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
										className='w-'
										align='start'
										alignOffset={8}
									>
										<DropdownMenuSub>
											<DropdownMenuSubTrigger className='capitalize'>
												<Sun className='rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-1.5' />
												<Moon className='absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-1.5' />
												{activeTheme}
											</DropdownMenuSubTrigger>
											<DropdownMenuSubContent>
												<DropdownMenuGroup>
													{themes.map((theme) => (
														<DropdownMenuCheckboxItem
															key={theme}
															checked={
																theme ===
																activeTheme
															}
															onCheckedChange={(
																e
															) => {
																if (e) {
																	setTheme(
																		theme
																	);
																} else {
																	setTheme(
																		'system'
																	);
																}
															}}
															className='capitalize'
														>
															{theme ===
																'light' && (
																<Sun className='mr-1.5' />
															)}
															{theme ===
																'dark' && (
																<Moon className='mr-1.5' />
															)}
															{theme ===
																'system' && (
																<Sun className='mr-1.5' />
															)}
															{theme}
														</DropdownMenuCheckboxItem>
													))}
												</DropdownMenuGroup>
											</DropdownMenuSubContent>
										</DropdownMenuSub>

										<DropdownMenuGroup>
											<DropdownMenuItem
												onClick={() =>
													handleSignOut?.mutate()
												}
												disabled={
													handleSignOut?.isPending
												}
											>
												<LogOut />
												<span>Log Out</span>
											</DropdownMenuItem>
										</DropdownMenuGroup>
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
		</SidebarProvider>
	);
}
