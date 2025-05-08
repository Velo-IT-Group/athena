import { parseCookies, setCookie } from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/utils";

export function createClient() {
	return createServerClient<Database>(
		env.VITE_SUPABASE_URL!,
		env.VITE_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return Object.entries(parseCookies()).map(
						([name, value]) =>
							({
								name,
								value,
							}) as { name: string; value: string },
					);
				},
				setAll(cookies) {
					cookies.forEach((cookie) => {
						setCookie(cookie.name, cookie.value);
					});
				},
			},
		},
	);
}

export async function getSafeSession() {
	const supabase = createClient();
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error) {
		return { session: null, user: null, error: "No session found" };
	}

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError) {
		return { session, user: null, error: userError.message };
	}

	return {
		session,
		user,
		error: null,
	};
}
