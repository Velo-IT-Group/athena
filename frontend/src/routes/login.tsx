import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '@/components/login-form';
import { createClient } from '@/lib/supabase/server';
import { createServerFn } from '@tanstack/react-start';

// const logout = createServerFn().handler(async () => {
// 	const supabase = createClient();
// 	await supabase.auth.signOut();
// });

export const Route = createFileRoute('/login')({
	component: LoginComponent,
	// beforeLoad: async () => await logout(),
});

function LoginComponent() {
	return (
		<div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
			<div className='w-full max-w-sm'>
				<LoginForm />
			</div>
		</div>
	);
}
