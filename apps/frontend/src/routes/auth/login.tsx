import LabeledInput from '@/components/labeled-input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import {
	createFileRoute,
	redirect,
	useNavigate,
	useRouteContext,
} from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import z from 'zod';

export const Route = createFileRoute('/auth/login')({
	component: RouteComponent,
	validateSearch: zodValidator(
		z.object({
			redirect: z.string().optional(),
		})
	),
});

function RouteComponent() {
	const navigate = useNavigate();
	const { redirect } = Route.useSearch();

	const handlePassswordLogin = useMutation({
		mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			const supabase = createClient();

			const { data, error } = await supabase.auth.signInWithPassword({
				email: 'nicholas.black98@icloud.com',
				password: 'Bl@ck1998!',
			});

			if (error) throw error;

			// redirect({ to: '/' });
		},
		onError(error) {
			console.log(error);
			toast.error(error.message);
		},
		onSuccess(data, variables, context) {
			navigate({ to: '/' });
		},
	});

	const handleSocialLogin = useMutation({
		mutationFn: async () => {
			const supabase = createClient();

			const params = new URLSearchParams();

			if (redirect) {
				params.set('next', redirect);
			}

			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'azure',
				options: {
					scopes: 'offline_access openid profile email User.Read Calendars.ReadBasic Calendars.Read Calendars.ReadWrite',
					redirectTo:
						`${window.location.origin}/rest/v1/auth/callback` +
						`?${params.toString()}`,
				},
			});

			if (error) throw error;
		},
	});

	return (
		<form
			className={cn('flex flex-col gap-6')}
			onSubmit={handlePassswordLogin.mutate}
		>
			<div className='flex flex-col items-center gap-3 text-center'>
				<h1 className='text-2xl font-bold'>Welcome to Athena</h1>
				<p className='text-muted-foreground text-sm text-balance'>
					New here or coming back? Choose how you want to continue
				</p>
			</div>

			<div className='grid gap-6'>
				<LabeledInput
					name='email'
					type='email'
					label='Email'
					autoComplete='email'
					placeholder='Enter your email'
					required
				/>

				<LabeledInput
					name='password'
					type='password'
					label='Password'
					autoComplete='current-password'
					placeholder='••••••••'
					required
				/>

				<Button disabled={handlePassswordLogin.isPending}>
					{handlePassswordLogin.isPending && (
						<Loader2 className='animate-spin' />
					)}
					{handlePassswordLogin.isPending ? 'Logging in...' : 'Login'}
				</Button>

				<div className='flex items-center gap-3'>
					<Separator
						orientation='horizontal'
						className='flex-1'
					/>

					<p className='text-center text-sm'>Or</p>

					<Separator
						orientation='horizontal'
						className='flex-1'
					/>
				</div>

				<Button
					variant='outline'
					className='w-full text-base font-medium'
					size='lg'
					onClick={() => handleSocialLogin.mutate()}
					disabled={handleSocialLogin.isPending}
				>
					{handleSocialLogin.isPending ? (
						<Loader2 className='size-3.5 rounded-xs' />
					) : (
						<img
							src='/microsoftLogo.png'
							alt='Microsoft Logo'
							className='size-3.5 rounded-xs'
						/>
					)}
					Login with Microsoft
				</Button>
			</div>

			<div className='text-center text-sm'>
				Don&apos;t have an account?{' '}
				<a
					href='#'
					className='underline underline-offset-4'
				>
					Sign up
				</a>
			</div>
		</form>
	);
}
