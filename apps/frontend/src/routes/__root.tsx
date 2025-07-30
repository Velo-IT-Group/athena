/// <reference types="vite/client" />

import type { Session, User } from '@supabase/supabase-js';
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
// import { createServerFn } from '@tanstack/react-start';
import { NuqsAdapter } from 'nuqs/adapters/react';
import * as React from 'react';
import { Toaster } from 'sonner';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { NotFound } from '@/components/NotFound';
// import { createClient } from '@/lib/supabase/server';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import appCss from '@/styles/app.css?url';
import { seo } from '@/utils/seo';
import { AuthProvider } from '@/hooks/use-auth';

// export const fetchSessionUser = createServerFn().handler<{
// 	session: Session | null;
// 	user: User | null;
// }>(async () => {
// 	const supabase = createClient();
// 	const [
// 		{
// 			data: { user },
// 		},
// 		{
// 			data: { session },
// 		},
// 	] = await Promise.all([
// 		supabase.auth.getUser(),
// 		supabase.auth.getSession(),
// 	]);

// 	if (!session || !user) {
// 		return { session: null, user: null };
// 	}

// 	return {
// 		session,
// 		user,
// 	};
// });

export const Route = createRootRoute({
	// beforeLoad: async () => {
	// 	const session = await fetchSessionUser();
	// 	return session as { session: Session; user: User };
	// },
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			...seo({
				title: 'Athena | Velo',
			}),
		],
		links: [
			{ rel: 'stylesheet', href: appCss },
			{ rel: 'icon', href: '/favicon.ico' },
			{ rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
		],
	}),
});

function RootComponent() {
	return (
		<NuqsAdapter>
			<RootDocument>
				<Outlet />
			</RootDocument>
		</NuqsAdapter>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html>
			<head>
				<HeadContent />
			</head>

			<body
				className='[--navbar-height:calc(theme(spacing.12))]'
				style={
					{
						'--header-height': 'calc(var(--spacing) * 12)',
					} as React.CSSProperties
				}
			>
				<ThemeProvider>
					<QueryProvider>
						<AuthProvider>{children}</AuthProvider>
						<Toaster
							richColors
							swipeDirections={['right']}
						/>

						<TanStackRouterDevtools position='bottom-left' />

						<Scripts />
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
