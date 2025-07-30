import { createIsomorphicFn } from '@tanstack/react-start-client';
// import { parseCookies, setCookie } from '@tanstack/react-start/server';
import { env } from '@/lib/utils';

export type SerializableSession = {
	access_token: string;
	refresh_token: string;
};

export const isoMorphicGetSBSession = createIsomorphicFn()
	.client(async () => {
		const { createBrowserClient } = await import('@supabase/ssr');
		const url = env.VITE_SUPABASE_URL;
		const anonKey = env.VITE_SUPABASE_ANON_KEY;
		return createBrowserClient(url, anonKey);
		// const {
		// 	error,
		// 	data: { session },
		// } = await supabase.auth.getSession();
		// if (!session) {
		// 	return null;
		// }
		// return {
		// 	access_token: session.access_token,
		// 	refresh_token: session.refresh_token,
		// };
	})
	.server(async () => {
		const { parseCookies, setCookie } = await import(
			'@tanstack/react-start/server'
		);
		const { createServerClient } = await import('@supabase/ssr');
		return createServerClient(
			env.VITE_SUPABASE_URL,
			env.VITE_SUPABASE_ANON_KEY,
			{
				cookies: {
					getAll() {
						return Object.entries(parseCookies()).map(
							([name, value]) => ({
								name,
								value,
							})
						);
					},
					setAll(cookies: any) {
						cookies.forEach((cookie: any) => {
							setCookie(cookie.name, cookie.value);
						});
					},
				},
			}
		);
		// const {
		// 	error,
		// 	data: { session },
		// } = await supabase.auth.getSession();
		// if (!session) {
		// 	return null;
		// }

		// const {
		// 	error: authErr,
		// 	data: { user },
		// } = await supabase.auth.getUser();
		// if (authErr) {
		// 	return null;
		// }

		// return {
		// 	access_token: session.access_token,
		// 	refresh_token: session.refresh_token,
		// };
	});
