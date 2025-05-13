import LabeledInput from '@/components/labeled-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { env } from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { SignJWT } from 'jose';
import { Key } from 'lucide-react';
import { z } from 'zod';

export const Route = createFileRoute('/token-setup')({
	component: RouteComponent,
	validateSearch: zodValidator(z.object({ user_id: z.string() })),
});

const createSignedToken = async (user_id: string) => {
	const token = await new SignJWT({
		user_id,
		connect_wise: {
			public_key: 'maaPiVTeEybbK3SX',
			secret_key: 'eCT1NboeMrXq9P3z',
		},
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('2h')
		.sign(new TextEncoder().encode(env.VITE_SECRET_KEY));

	return token;
};

function RouteComponent() {
	const params = Route.useSearch();
	return (
		<div className='grid h-screen w-screen place-items-center bg-muted/50 bg-gradient-to-t'>
			<form
				onSubmit={async (d) => {
					console.log(d);
					d.preventDefault();
					const token = await createSignedToken('6fecc24c-9c51-44b8-a45c-739e255dd586');
					console.log(token);
				}}
			>
				<Card className='w-full max-w-sm'>
					<CardHeader>
						<CardTitle className='flex items-center gap-[1ch] text-2xl'>
							<Key className='inline-block size-5' />
							<span>Key Setup</span>
						</CardTitle>

						<CardDescription>Please enter your provided public and secret keys&nbsp;below.</CardDescription>
					</CardHeader>

					<CardContent className='grid gap-3'>
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
					</CardContent>

					<CardFooter className='grid gap-1.5'>
						<Button className='w-full'>Save</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
}
