import ConversationHistory from '@/components/conversation-history';
import OpenProjects from '@/components/open-projects';
import OpenProjectsSkeleton from '@/components/open-projects/skeleton';
import Tiptap from '@/components/tip-tap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCompanyNotes, getTickets } from '@/lib/manage/read';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { subDays } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/companies/$id/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	const [
		{ data: sopExceptions },
		{
			data: { data: tickets },
		},
	] = useSuspenseQueries({
		queries: [
			{
				queryKey: ['companies', Number(id), 'notes'],
				queryFn: () =>
					getCompanyNotes({
						data: {
							id: Number(id),
							conditions: {
								conditions: {
									'type/id': 6,
								},
								fields: ['id', 'text', '_info'],
							},
						},
					}),
			},
			{
				queryKey: ['companies', Number(id), 'best-practice-implementations'],
				queryFn: () =>
					getTickets({
						data: {
							conditions: {
								closedFlag: true,
								closedDate: subDays(new Date(), 30),
								enteredBy: 'MyIT',
								'board/name': 'Strength',
								'status/name': 'Completed',
								'company/id': Number(id),
							},
						},
					}),
			},
		],
	});

	return (
		<section className='grid grid-cols-[2.5fr_1fr] gap-3 mt-3'>
			<Card className='flex flex-col'>
				<CardHeader>
					<CardTitle>SOP Exceptions</CardTitle>
				</CardHeader>

				<CardContent className='flex-1'>
					<Tiptap
						editable={false}
						className='p-0'
						content={sopExceptions?.data?.[0]?.text}
					/>
				</CardContent>
			</Card>

			<Suspense
				fallback={
					<Card>
						<CardHeader>
							<CardTitle>Activity Log</CardTitle>
						</CardHeader>
						<CardContent className='p-3 space-y-3'>
							<Skeleton className='h-3.5 w-full' />
							<Skeleton className='h-3 w-3/4' />
							<Skeleton className='h-3 w-1/2' />
							<Skeleton className='h-3 w-1/4' />
						</CardContent>
					</Card>
				}
			>
				<ConversationHistory companyId={Number(id)} />
			</Suspense>

			<Suspense fallback={<OpenProjectsSkeleton />}>
				<OpenProjects companyId={Number(id)} />
			</Suspense>

			<Suspense
				fallback={
					<Card>
						<CardHeader className='border-b px-3 h-16'>
							<CardTitle className='text-lg font-medium leading-none'>
								Best Practice Implementations
							</CardTitle>
						</CardHeader>

						<CardContent className='p-3 space-y-3'>
							<Skeleton className='h-3.5 w-full' />
							<Skeleton className='h-3 w-3/4' />
							<Skeleton className='h-3 w-1/2' />
							<Skeleton className='h-3 w-1/4' />
						</CardContent>
					</Card>
				}
			>
				<Card className='flex flex-col'>
					<CardHeader>
						<CardTitle>
							<CheckCircle className='inline-block mr-1.5' /> Best Practice Implementation
						</CardTitle>
					</CardHeader>

					<CardContent>
						{tickets && tickets.length ? (
							<ul className='space-y-6'>
								{tickets?.map((ticket) => (
									<li
										key={ticket.id}
										className='relative flex gap-4 group'
									>
										<div className='absolute top-0 -bottom-6 left-0 flex w-6 justify-center'>
											<div className='w-[1px] group-last:hidden bg-muted-foreground' />
										</div>

										<div className='relative flex size-6 flex-none items-center justify-center bg-background'>
											<div className='size-1.5 rounded-full bg-muted-foreground' />
										</div>

										<p className='flex-auto py-0.5 text-xs text-muted-foreground leading-5'>
											<span className='text-foreground font-medium'>{ticket.summary}</span>
										</p>
									</li>
								))}
							</ul>
						) : (
							<div className='grid place-items-center gap-[1ch] font-medium text-muted-foreground p-[1ch] text-center'>
								<CheckCircle className='size-7' />
								<p className='px-6'>
									No Best Practices Implemented
									<br />
									In Past 90 days
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</Suspense>
		</section>
	);
}
