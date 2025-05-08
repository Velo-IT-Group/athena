import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import * as React from 'react';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { NotFound } from '@/components/NotFound';
import { QueryProvider } from '@/providers/query-provider';
import appCss from '@/styles/app.css?url';
import { seo } from '@/utils/seo';
import { ThemeProvider } from '@/providers/theme-provider';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
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
				title: 'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
				description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
			}),
		],
		links: [
			{ rel: 'stylesheet', href: appCss },
			{
				rel: 'apple-touch-icon',
				sizes: '180x180',
				href: '/apple-touch-icon.png',
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '32x32',
				href: '/favicon-32x32.png',
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '16x16',
				href: '/favicon-16x16.png',
			},
			{ rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
			{ rel: 'icon', href: '/favicon.ico' },
		],
	}),
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
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
		<html className='text-sm'>
			<head>
				<script
					crossOrigin='anonymous'
					src='//unpkg.com/react-scan/dist/auto.global.js'
				/>
				<HeadContent />
			</head>

			<body className='[--navbar-height:calc(theme(spacing.12))]'>
				<ThemeProvider>
					<QueryProvider>
						{children}

						<Toaster richColors />

						<TanStackRouterDevtools position='bottom-left' />

						<Scripts />
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
