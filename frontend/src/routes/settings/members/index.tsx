import { getProfiles } from '@/lib/supabase/read';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/members/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useSuspenseQuery({
		queryKey: ['profiles'],
		queryFn: () => getProfiles(),
	});

	return (
		<main>
			<h1 className='text-2xl font-bold'>Members</h1>

			<section>
				{data?.map((p) => (
					<Link
						to='/settings/members/$id'
						params={{ id: p.id }}
					>
						{p.first_name}
					</Link>
				))}
			</section>
		</main>
	);
}
