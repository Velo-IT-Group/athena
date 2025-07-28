import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const LoginForm = ({
	className,
	isPending,
	...props
}: React.ComponentPropsWithoutRef<'form'> & { isPending: boolean }) => (
	<form
		className={cn('flex flex-col gap-6', className)}
		{...props}
	>
		<div className='flex flex-col items-center gap-3 text-center'>
			<h1 className='text-2xl font-bold'>Welcome to Athena</h1>
			<p className='text-muted-foreground text-sm text-balance'>
				New here or coming back? Choose how you want to continue
			</p>
		</div>
		<div className='grid gap-6'>
			<Button
				variant='outline'
				className='w-full text-base font-medium'
				size='lg'
				type='submit'
				disabled={isPending}
			>
				{isPending ? (
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
