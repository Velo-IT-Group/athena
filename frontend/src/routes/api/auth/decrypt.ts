import { env } from '@/lib/utils';
import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { jwtVerify } from 'jose';

export const APIRoute = createAPIFileRoute('/api/auth/decrypt')({
	POST: async ({ request, params }) => {
		const formData = await request.formData();
		const token = (formData.get('token') as string)?.trim();

		return json(await jwtVerify(token, new TextEncoder().encode(env.VITE_SECRET_KEY)));
	},
});
