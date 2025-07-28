import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/utils";

export function createClient() {
	return createBrowserClient<Database>(
		env.VITE_SUPABASE_URL!,
		env.VITE_SUPABASE_ANON_KEY!,
	);
}
