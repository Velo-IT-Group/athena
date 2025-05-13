import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { TriangleAlert } from 'lucide-react';
import { z } from 'zod';

export const Route = createFileRoute('/auth/auth-code-error')({
	component: RouteComponent,
	validateSearch: zodValidator(z.object({ error: z.string().optional() })),
});

function RouteComponent() {
	const search = Route.useSearch();
	return (
		<main className='grid place-items-center gap-3 h-screen max-w-lg w-full mx-auto text-center'>
			<div className='flex flex-col items-center gap-3 w-full'>
				<TriangleAlert className='stroke-red-500 size-16' />

				<h1>Seems like you've run into a bit of error...</h1>

				<p>{search?.error}</p>
			</div>
		</main>
	);
}
