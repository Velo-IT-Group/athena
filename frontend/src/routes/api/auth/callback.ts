import { getContacts, getSystemMembers } from '@/lib/manage/read';
import { createWorker } from '@/lib/twilio/create';
import { getWorkers } from '@/lib/twilio/read';
import { updateWorker } from '@/lib/twilio/update';
import type { User, UserMetadata } from '@supabase/supabase-js';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { createClient } from '@/lib/supabase/server';
import { setCookie, deleteCookie } from '@tanstack/start/server';

export const APIRoute = createAPIFileRoute('/api/auth/callback')({
	GET: async ({ request, params }: { request: Request; params: Record<string, string | undefined> }) => {
		const url = new URL(request.url);
		const { searchParams, origin } = url;
		const code = searchParams.get('code');
		const next = searchParams.get('next');
		console.log(code);

		if (code) {
			const supabase = createClient();

			const {
				data: { user },
				error,
			} = await supabase.auth.exchangeCodeForSession(code);

			const { data, error: profile_key_error } = await supabase.from('profile_keys').select().single();

			if (profile_key_error) return Response.redirect(`${origin}/token-setup?user_id=${user?.id}`);

			deleteCookie('connect_wise:auth');
			setCookie('connect_wise:auth', JSON.stringify(data?.key));
			setCookie('twilio:worker_sid', user?.user_metadata?.worker_sid);

			if (error) {
				const urlParams = new URLSearchParams();
				urlParams.append('error', error.message);

				// return the user to an error page with instructions
				return Response.redirect(`${origin}/auth/auth-code-error?${urlParams.toString()}`);
			}

			return Response.redirect(`${origin}${next ?? ''}`);
		}

		// return the user to an error page with instructions
		return Response.json({
			error: 'Not authenticated',
		});
	},
});

const handleAuthenticatedUser = async (user: User) => {
	const email = user.email;

	if (!email) throw new Error('No email found on user');

	const [members, { data: contacts }] = await Promise.all([
		getSystemMembers({
			conditions: { officeEmail: `'${email}'` },
			fields: ['id', 'salesDefaultLocation'],
		}),
		getContacts({
			data: {
				childConditions: {
					'communicationItems/value': `'${email}'`,
				},
				fields: ['id'],
			},
		}),
	]);

	const workers = await getWorkers({ data: { friendlyName: email } });

	const user_metadata: UserMetadata = {
		...user?.user_metadata,
		contact_uri: `client:${email}`,
		contact_id: contacts?.[0]?.id,
		member_id: members?.[0]?.id,
		team_id: members?.[0]?.salesDefaultLocation?.id,
		team_name: members?.[0]?.salesDefaultLocation?.name,
		identifier: members?.[0]?.identifier,
	};

	if (!workers.length) {
		const worker = await createWorker(email, {
			...user_metadata,
			on_call: false,
			contact_id: contacts?.[0]?.id,
			member_id: members?.[0]?.id,
			team_id: members?.[0]?.salesDefaultLocation?.id,
			team_name: members?.[0]?.salesDefaultLocation?.name,
			identifier: members?.[0]?.identifier,
			active: true,
		});

		user_metadata.on_call = false;
		user_metadata.worker_sid = worker?.sid;
	} else {
		const worker = workers[0];
		const parsedAttributes = JSON.parse(worker.attributes);
		user_metadata.on_call = parsedAttributes.on_call ?? false;
		user_metadata.worker_sid = worker.sid;

		await updateWorker(worker.sid, {
			attributes: {
				...parsedAttributes,
				...user_metadata,
				contact_uri: `client:${email}`,
				on_call: parsedAttributes.on_call ?? false,
				contact_id: contacts?.[0]?.id,
				member_id: members?.[0]?.id,
				team_id: members?.[0]?.salesDefaultLocation?.id,
				team_name: members?.[0]?.salesDefaultLocation?.name,
				identifier: members?.[0]?.identifier,
			},
		});
	}

	delete user_metadata?.workerSid;
	delete user_metadata?.contactId;
	delete user_metadata?.referenceId;

	return user_metadata;
};
