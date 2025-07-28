import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getTicket, getTicketConfigurations } from '@/lib/manage/read';
import {
	Building,
	Calendar,
	ChartNoAxesColumnIncreasing,
	Circle,
	ContactIcon,
	Pin,
	SquareKanban,
	SquareUser,
} from 'lucide-react';
import { formatDate } from 'date-fns';
import TicketConfigurations from '@/components/ticket-properties/configurations';
import { useSuspenseQueries } from '@tanstack/react-query';
import { ticketConfigurationsQuery } from '@/lib/manage/api';
import { getTicketQuery } from '@/lib/manage/api';

export default function Properties({ id }: { id: number }) {
	const [{ data: ticket }, { data: configurations }] = useSuspenseQueries({
		queries: [getTicketQuery(id), ticketConfigurationsQuery(id)],
	});

	return (
		<aside className='pb-6 pt-2.5 pr-1.5 space-y-6 h-[calc(100vh-var(--navbar-height))] [&>section]:border-b [&>section]:p-3 [&_h4]:text-xs [&_h4]:text-muted-foreground [&_h4]:font-medium [&_p]:text-sm [&_svg]:mr-1.5 [&_svg]:inline-block'>
			<section className='space-y-1.5'>
				<p className='text-sm'>
					<ChartNoAxesColumnIncreasing />
					{ticket.priority?.name}
				</p>

				<p className='text-sm'>
					<SquareUser />
					{ticket.owner?.name}
				</p>
			</section>

			<section className='space-y-1.5'>
				<h4>Board</h4>

				<p>
					<SquareKanban />
					{ticket.board?.name}
				</p>
				<p>
					<Circle />
					{ticket.type?.name}
				</p>

				{ticket.subType && (
					<p>
						<Circle />
						{ticket.subType?.name}
					</p>
				)}
			</section>

			<section className='space-y-1.5'>
				<h4>Company</h4>

				<p>
					<Building />
					{ticket.company?.name}
				</p>

				<p>
					<Pin />
					{ticket.site?.name}
				</p>

				<Suspense fallback={<Skeleton className='w-full h-9' />}></Suspense>

				<p>
					<ContactIcon />
					{ticket.contact?.name}
				</p>

				<Suspense fallback={<Skeleton className='w-full h-9' />}></Suspense>
			</section>

			{configurations.length > 0 && (
				<Suspense
					fallback={
						<section>
							<div className='flex items-center justify-between gap-3'>
								<h4>Configuration</h4>
							</div>
						</section>
					}
				>
					<TicketConfigurations id={id} />
				</Suspense>
			)}

			{ticket?.requiredDate && (
				<section className='space-y-1.5'>
					<h4>Due Date</h4>

					<p className='text-sm'>
						<Calendar className='inline-block mr-1.5' />{' '}
						{formatDate(new Date(ticket?.requiredDate), 'yyyy-MM-dd')}
					</p>
				</section>
			)}

			{ticket?.estimatedStartDate && (
				<section className='space-y-1.5'>
					<h4>Estimated Start Date</h4>

					<p className='text-sm'>
						<Calendar className='inline-block mr-1.5' />{' '}
						{formatDate(new Date(ticket?.estimatedStartDate), 'yyyy-MM-dd')}
					</p>
				</section>
			)}
		</aside>
	);
}
