import { redirect } from '@tanstack/react-router';
import {
	createMiddleware,
	registerGlobalMiddleware,
} from '@tanstack/react-start';
import { createClient } from '@/lib/supabase/server';

const authMiddleware = createMiddleware({ type: 'function' }).server(
	async ({ next }) => {
		// const session = await isoMorphicGetSBSession();

		const client = createClient();
		const {
			data: { user },
		} = await client.auth.getUser();

		if (!user) {
			console.log('no user');
			throw redirect({ to: '/' });
		}

		return await next({ context: { user } });
	}
);

registerGlobalMiddleware({
	middleware: [authMiddleware],
});
