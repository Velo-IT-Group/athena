import { formatDate } from 'date-fns';
import { createFileRoute } from '@tanstack/react-router';

import MyTickets from '@/components/widgets/my-tickets';
import PrivateNotepad from '@/components/widgets/private-notepad';
import MyGoals from '@/components/widgets/my-goals';

import { AchievementsBar } from '@/components/achievements-bar';
import { Suspense, useState } from 'react';
import { MyProposals } from '@/components/widgets/my-proposals';
import { Sortable, SortableContent, SortableItem, SortableOverlay } from '@/components/ui/sortable';

export const Route = createFileRoute('/_authed/')({
	component: Home,
});

type Widget = {
	name: string;
	order: number;
};

function Home() {
	const { profile } = Route.useRouteContext();

	const today = new Date();
	const isAfternoon = today.getHours() >= 12 && today.getHours() < 18;
	const isMorning = today.getHours() >= 0 && today.getHours() < 12;

	const [widgets, setWidgets] = useState<Widget[]>([
		{ name: 'my-goals', order: 1 },
		{ name: 'private-notepad', order: 2 },
		{ name: 'my-tickets', order: 3 },
		{ name: 'my-proposals', order: 4 },
	]);

	return (
		<main className='p-3'>
			<section className='min-h-16'>
				<h1 className='text-2xl font-medium'>Home</h1>
			</section>

			<section className='container px-3 flex flex-col items-stretch gap-1.5 mx-auto'>
				<span className='text-center font-medium'>{formatDate(new Date(), 'EEEE, MMMM d')}</span>
				<h3 className='text-center text-4xl'>
					Good {isAfternoon ? 'afternoon' : isMorning ? 'morning' : 'evening'}, {profile?.first_name}
				</h3>

				<AchievementsBar />

				<Sortable
					value={widgets}
					onValueChange={setWidgets}
					getItemValue={(item) => item.order}
					orientation='mixed'
				>
					<SortableContent className='grid auto-rows-fr grid-cols-2 gap-3 mt-3'>
						{widgets.map((widget) => (
							<SortableItem
								key={widget.name}
								value={widget.order}
								asChild
								asHandle
							>
								<>
									{widget.name === 'my-goals' && <MyGoals />}
									{widget.name === 'private-notepad' && <PrivateNotepad />}
									{widget.name === 'my-tickets' && <MyTickets />}
									{widget.name === 'my-proposals' && <MyProposals />}
								</>
							</SortableItem>
						))}
					</SortableContent>

					<SortableOverlay>
						<div className='size-full rounded-md bg-primary/10'>
							<p>Drag and drop to reorder</p>
						</div>
					</SortableOverlay>
				</Sortable>

				{/* <div className='grid grid-cols-2 gap-3 mt-3'>
					{widgets.map((widget) => (
						<SortableItem
							key={widget.name}
							value={widget.name}
							asChild
							asHandle
						>
							{widget.name === 'my-goals' && <MyGoals />}
							{widget.name === 'private-notepad' && <PrivateNotepad />}
							{widget.name === 'my-tickets' && <MyTickets />}
							{widget.name === 'my-proposals' && <MyProposals />}
						</SortableItem>
					))}

					<MyGoals />

					<PrivateNotepad />

					<Suspense fallback={<div>Loading...</div>}>
						<MyTickets />
					</Suspense>

					<Suspense fallback={<div>Loading...</div>}>
						<MyProposals />
					</Suspense>
				</div> */}
			</section>
		</main>
	);
}
