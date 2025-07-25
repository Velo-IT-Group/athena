import LabeledInput from '@/components/labeled-input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { env } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { SignJWT } from 'jose';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

export const Route = createFileRoute('/auth/token-setup')({
	component: RouteComponent,
	validateSearch: zodValidator(z.object({ user_id: z.string() })),
});

// const createSignedToken = async (user_id: string) => {
// 	const token = await new SignJWT({
// 		user_id,
// 		connect_wise: {
// 			public_key: 'maaPiVTeEybbK3SX',
// 			secret_key: 'eCT1NboeMrXq9P3z',
// 		},
// 	})
// 		.setProtectedHeader({ alg: 'HS256' })
// 		.sign(new TextEncoder().encode(env.VITE_SECRET_KEY));

// 	return token;
// };

function RouteComponent() {
	const params = Route.useSearch();
	const { user_id } = Route.useSearch();
	const supabase = createClient();

	const handleSocialLogin = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'azure',
				options: {
					scopes: 'offline_access openid profile email User.Read Calendars.ReadBasic Calendars.Read Calendars.ReadWrite',
					redirectTo: `${window.location.origin}/rest/v1/auth/callback`,
				},
			});

			if (error) throw error;
		},
	});

	const createSignedToken = useMutation({
		mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			const token = await new SignJWT({
				user_id,
				connect_wise: {
					public_key: 'maaPiVTeEybbK3SX',
					secret_key: 'eCT1NboeMrXq9P3z',
				},
			})
				.setProtectedHeader({ alg: 'HS256' })
				.sign(new TextEncoder().encode(env.VITE_SECRET_KEY));

			const { error } = await supabase.from('profile_keys').insert({
				user_id,
				key: token,
			});

			if (error) throw error;

			return token;
		},
		onSuccess() {
			handleSocialLogin.mutate();
		},
	});

	return (
		<form
			className='grid gap-6'
			onSubmit={createSignedToken.mutate}
		>
			<div className='flex flex-col items-center gap-2 text-center'>
				<h1 className='text-2xl font-bold'>Token Setup</h1>
				<p className='text-muted-foreground text-sm text-balance'>
					Please enter your provided public and secret
					keys&nbsp;below.
				</p>
			</div>
			<div className='grid gap-6'>
				<LabeledInput
					label='User ID'
					name='user_id'
					defaultValue={params.user_id}
					hidden
					className='hidden'
					required
				/>

				<LabeledInput
					label='Public Key'
					name='public_key'
					placeholder='e.g. "1234567890"'
					required
				/>

				<LabeledInput
					label='Secret Key'
					name='secret_key'
					type='password'
					placeholder='••••••••••••••'
					required
				/>

				<Button
					type='submit'
					className='w-full'
					disabled={
						createSignedToken.isPending ||
						handleSocialLogin.isPending
					}
				>
					{(createSignedToken.isPending ||
						handleSocialLogin.isPending) && (
						<Loader2 className='animate-spin' />
					)}
					<span>Save</span>
				</Button>
			</div>
		</form>
	);
}
