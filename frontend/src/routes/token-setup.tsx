import LabeledInput from '@/components/labeled-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { encryptToken } from '@/lib/supabase/create';
import { createFileRoute } from '@tanstack/react-router';
import { Key } from 'lucide-react';

export const Route = createFileRoute('/token-setup')({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): { userId: string } => {
		// validate and parse the search params into a typed state
		return {
			userId: (search.userId as string) || '',
		};
	},
});

function RouteComponent() {
	const params = Route.useSearch();
	return (
		<div className='grid h-screen w-screen place-items-center bg-muted/50 bg-gradient-to-t'>
			<form
				action={async (d) => {
					console.log(d);
					await encryptToken({ data: d });
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
							defaultValue={params.userId}
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
