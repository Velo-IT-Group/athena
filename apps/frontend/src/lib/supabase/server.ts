'use client';
import { createBrowserClient } from '@supabase/ssr';
// import { parseCookies, setCookie } from '@tanstack/react-start/server';
import { env } from '@/lib/utils';

export function getSupabaseServerClient() {
	return createBrowserClient(
		env.VITE_SUPABASE_URL,
		env.VITE_SUPABASE_ANON_KEY
		// {
		// 	cookies: {
		// 		getAll() {
		// 			return Object.entries(parseCookies()).map(
		// 				([name, value]) => ({
		// 					name,
		// 					value,
		// 				})
		// 			);
		// 		},
		// 		setAll(cookies) {
		// 			cookies.forEach((cookie) => {
		// 				setCookie(cookie.name, cookie.value);
		// 			});
		// 		},
		// 	},
		// }
	);
}
