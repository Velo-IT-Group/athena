import { createFileRoute } from '@tanstack/react-router';
import { formatDate } from 'date-fns';
import MetricTrackerHeader from '@/components/metric-tracker-header';
import TimeEntriesProgress from '@/components/time-entries-progress';
import PrivateNotepad from '@/components/widgets/private-notepad';

export const Route = createFileRoute('/_authed/')({
	component: Home,
	ssr: 'data-only',
});

function Home() {
	const { user } = Route.useRouteContext();

	const today = new Date();
	const isAfternoon = today.getHours() >= 12 && today.getHours() < 18;
	const isMorning = today.getHours() >= 0 && today.getHours() < 12;

	return (
		<main className='p-3'>
			<section className='min-h-16'>
				<h1 className='text-2xl font-medium'>Home</h1>
			</section>

			<section className='container px-3 flex flex-col items-stretch gap-1.5 mx-auto space-y-3'>
				<span className='text-center font-medium'>
					{formatDate(new Date(), 'EEEE, MMMM d')}
				</span>
				<h3 className='text-center text-4xl'>
					Good{' '}
					{isAfternoon
						? 'afternoon'
						: isMorning
							? 'morning'
							: 'evening'}
					{user?.user_metadata?.full_name.split(' ')?.[0]
						? ` , ${user?.user_metadata?.full_name.split(' ')?.[0]}`
						: '!'}
				</h3>

				<TimeEntriesProgress user={user!} />

				<MetricTrackerHeader />

				<section>
					<PrivateNotepad />
				</section>
			</section>
		</main>
	);
}
