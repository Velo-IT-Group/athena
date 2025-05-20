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
import { Settings, Trash } from 'lucide-react';
import NavigationalSidebar from '@/components/navigational-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { linksConfig } from '@/config/links';
import NavigationItem from '@/components/navigational-sidebar/navigation-item';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getProfile } from '@/lib/supabase/read';
import type { Session } from '@supabase/supabase-js';
import GlobalNav from '@/components/global-nav';
import { pinnedIcons } from '@/utils/icon-sets';
import { getPinnedItemsQuery } from '@/lib/supabase/api';
import { usePinnedItems } from '@/hooks/use-pinned-items';
import { getCookie, setCookie } from '@tanstack/react-start/server';
import { EncryptJWT, jwtDecrypt, jwtVerify, SignJWT } from 'jose';
import { decryptToken } from '@/utils/crypto';
import type { WebToken } from '@/types/crypto';
import { env } from '@/lib/utils';
import { AxiosHeaders } from 'axios';

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

	return JSON.parse(
		JSON.stringify({
			session,
			user,
			error: error ?? userError,
		})
	);
});

export const getUserCookie = createServerFn().handler(async () => {
	const cookie = getCookie('connect_wise:auth');

	if (!cookie) {
		throw new Error('No cookie found');
	}

	const jwt = await jwtVerify(decodeURIComponent(cookie), new TextEncoder().encode(env.VITE_SECRET_KEY));

	return jwt.payload as WebToken;
});

export const Route = createFileRoute('/_authed')({
	component: AuthComponent,
	beforeLoad: async () => {
		const { user, session, error } = await fetchSessionUser();

		// const cookie = getCookie('connect_wise:auth');

		// if (!cookie) {
		// 	throw new Error('No cookie found');
		// }

		// const jwt = await jwtVerify(decodeURIComponent(cookie), new TextEncoder().encode(env.VITE_SECRET_KEY));

		// const decryptedCookie = jwt.payload as WebToken;
		// const headers = new AxiosHeaders();
		// headers.set('clientId', env.VITE_CONNECT_WISE_CLIENT_ID!);
		// headers.set('Content-Type', 'application/json');
		// headers.set(
		// 	'Authorization',
		// 	'Basic ' + btoa(decryptedCookie.connect_wise.public_key + ':' + decryptedCookie.connect_wise.secret_key)
		// );

		// if (!user || !session) {
		// 	throw redirect({ to: '/login', statusCode: 301, params: { error } });
		// }

		const profile = await getProfile({ data: user.id });

		return { user, session, profile, features: { hideQueueStatus: false } };
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
					<Outlet />
					{/* <ScrollArea className='!h-[calc(100svh-var(--navbar-height))] flex flex-col [&_section]:px-6'></ScrollArea> */}
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
