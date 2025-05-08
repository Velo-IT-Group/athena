import { Suspense } from 'react';

import { createFileRoute } from '@tanstack/react-router';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

import { getTicket, getTicketNotes } from '@/lib/manage/read';
import Tiptap from '@/components/tip-tap';
import ActivityFeed from '@/components/activity-feed';
import Properties from '@/components/ticket-properties';
import { CommandMenu } from '@/components/command-menu';
import {
	Building,
	CalendarPlus,
	ChartNoAxesColumnIncreasing,
	Circle,
	CircleDashed,
	Pin,
	SquareKanban,
	UserSquare,
} from 'lucide-react';
import useServiceTicket from '@/hooks/use-service-ticket';
import { Operation } from '@/types';
import type {
	Board,
	BoardItem,
	BoardSubType,
	BoardType,
	Company,
	Contact,
	Priority,
	Site,
	SystemMember,
} from '@/types/manage';
import { CommandItem } from '@/components/ui/command';
import {
	getBoardItemsQuery,
	getBoardsQuery,
	getBoardSubTypesQuery,
	getBoardTypesQuery,
	getCompaniesQuery,
	getCompanySitesQuery,
	getContactsQuery,
	getMembersQuery,
	getPrioritiesQuery,
} from '@/lib/manage/api';
import { useSuspenseQueries } from '@tanstack/react-query';

export const Route = createFileRoute('/_authed/tickets/$id')({
	component: RouteComponent,
	// loader: async ({ params }) => {
	// 	const [ticket, notes] = await Promise.all([
	// 		getTicket({ data: { id: Number(params.id) } }),
	// 		getTicketNotes({ data: { id: Number(params.id) } }),
	// 	]);

	// 	return { ticket, notes };
	// },
});

function RouteComponent() {
	const { id } = Route.useParams();
	// const { ticket: initialTicket, notes } = Route.useLoaderData();

	const [{ data: ticketData }, { data: notesData }] = useSuspenseQueries({
		queries: [
			{
				queryKey: ['tickets', id],
				queryFn: () => getTicket({ data: { id: Number(id) } }),
				// initialData: initalTicketData,
			},
			{
				queryKey: ['tickets', id, 'notes'],
				queryFn: () => getTicketNotes({ data: { id: Number(id) } }),
				// initialData: initalNotes,
			},
		],
	});

	const initalNote = notesData?.find((note) => note.detailDescriptionFlag);

	const { data: ticket, handleTicketUpdate } = useServiceTicket({
		id: Number(id),
		initialData: ticketData,
	});

	return (
		<main className='grid grid-cols-[1fr_384px] items-start gap-3 h-full grow bg-muted/15'>
			<ScrollArea className='grid min-h-0 h-full overflow-y-auto'>
				<div className='container px-6 w-full py-9 grid items-start space-y-1.5 mx-auto'>
					{ticket?.parentTicketId && (
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href={`/tickets/${ticket.parentTicketId}`}>
										#{ticket.parentTicketId}
									</BreadcrumbLink>
								</BreadcrumbItem>

								<BreadcrumbSeparator />

								<BreadcrumbItem>
									<BreadcrumbLink href='/'>{ticket.summary}</BreadcrumbLink>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					)}

					<Textarea
						name='summary'
						defaultValue={ticket?.summary}
						className='border-none md:text-2xl font-semibold focus-visible:ring-0 shadow-none resize-none pointer-events-none px-0'
						readOnly
					/>

					{ticket?.parentTicketId && (
						<Suspense fallback={<Skeleton className='h-9 w-24' />}>
							{/* <ParentTicket ticketId={ticket.parentTicketId} /> */}
						</Suspense>
					)}

					<Tiptap
						content={initalNote?.text}
						editable={false}
					/>

					{ticket?.hasChildTicket && <Suspense>{/* <ChildTickets ticketId={ticket.id} /> */}</Suspense>}

					<ActivityFeed id={Number(id)} />
				</div>
			</ScrollArea>

			<div className='border-l h-full'>
				<Suspense>
					<Properties id={ticket?.id ?? -1} />
				</Suspense>
			</div>

			<CommandMenu
				sections={[
					{
						items: [
							{
								icon: <SquareKanban />,
								label: 'Change board...',
								value: 'board',
								fetcher: {
									options: getBoardsQuery(),
									itemView: (item: Board) => (
										<CommandItem
											value={item.id.toString()}
											onSelect={(value) =>
												handleTicketUpdate({
													operation: [
														{
															op: Operation.Replace,
															path: 'board/id',
															value: Number(value),
														},
													],
												})
											}
										>
											{item.name}
										</CommandItem>
									),
								},
							},
							{
								icon: <ChartNoAxesColumnIncreasing />,
								label: 'Change priority...',
								value: 'priority',
								fetcher: {
									options: getPrioritiesQuery(),
									itemView: (item: Priority) => (
										<CommandItem
											value={item.id.toString()}
											onSelect={(value) =>
												handleTicketUpdate({
													operation: [
														{
															op: Operation.Replace,
															path: 'priority/id',
															value: Number(value),
														},
													],
												})
											}
										>
											{item.name}
										</CommandItem>
									),
								},
							},
							{
								icon: <UserSquare />,
								label: 'Assign to...',
								value: 'assignee',
								fetcher: {
									options: getMembersQuery(),
									itemView: (item: SystemMember) => (
										<CommandItem
											value={`${item.id.toString()}-${item.firstName} ${item.lastName}`}
											onSelect={(value) =>
												handleTicketUpdate({
													operation: [
														{
															op: Operation.Replace,
															path: 'owner/id',
															value: Number(value),
														},
													],
												})
											}
										>
											{item.firstName} {item.lastName}
										</CommandItem>
									),
								},
							},
							{
								icon: <Circle />,
								label: 'Change type...',
								value: 'type',
								fetcher: {
									options: getBoardTypesQuery(ticket?.board?.id ?? -1),
									itemView: (item: BoardType) => (
										<CommandItem
											value={`${item.id.toString()}-${item.name}`}
											onSelect={(value) =>
												handleTicketUpdate({
													operation: [
														{
															op: Operation.Replace,
															path: 'type/id',
															value: Number(value.split('-')[0]),
														},
													],
												})
											}
										>
											{item.name}
										</CommandItem>
									),
								},
							},
							{
								icon: <CircleDashed />,
								label: 'Change sub-type...',
								value: 'sub-type',
								fetcher: {
									options: getBoardSubTypesQuery(),
									itemView: (item: BoardSubType) => (
										<CommandItem
											value={`${item.id.toString()}-${item.name}`}
											onSelect={(value) =>
												handleTicketUpdate({
													operation: [
														{
															op: Operation.Replace,
															path: 'type/id',
															value: Number(value.split('-')[0]),
														},
													],
												})
											}
										>
											{item.name}
										</CommandItem>
									),
								},
							},
							{
								icon: <CircleDashed />,
								label: 'Change item...',
								value: 'item',
								fetcher: {
									options: getBoardItemsQuery(ticket?.board?.id ?? -1),
									itemView: (item: BoardItem) => (
										<CommandItem
											value={`${item.id.toString()}-${item.name}`}
											onSelect={(value) =>
												handleTicketUpdate({
													operation: [
														{
															op: Operation.Replace,
															path: 'item/id',
															value: Number(value.split('-')[0]),
														},
													],
												})
											}
										>
											{item.name}
										</CommandItem>
									),
								},
							},
							{
								icon: <UserSquare />,
								label: 'Change contact...',
								value: 'contact',
								fetcher: {
									options: getContactsQuery({
										conditions: {
											'company/id': ticket?.company?.id,
											inactiveFlag: false,
										},
										pageSize: 1000,
									}),
									itemView: (item: Contact) => (
										<CommandItem
											value={`${item.id.toString()}-${item.firstName} ${item.lastName}`}
											onSelect={(value) =>
												handleTicketUpdate({
													operation: [
														{
															op: Operation.Replace,
															path: 'contact/id',
															value: Number(value.split('-')[0]),
														},
													],
												})
											}
										>
											{item.firstName} {item.lastName}
										</CommandItem>
									),
								},
							},
							{
								icon: <Building />,
								label: 'Change company...',
								value: 'company',
								fetcher: {
									options: getCompaniesQuery({ pageSize: 1000 }),
									itemView: (item: Company) => (
										<CommandItem
											value={`${item.id.toString()}-${item.name}`}
											onSelect={(value) =>
												handleTicketUpdate({
													operation: [
														{
															op: Operation.Replace,
															path: 'company/id',
															value: Number(value.split('-')[0]),
														},
													],
												})
											}
										>
											{item.name}
										</CommandItem>
									),
								},
							},
							{
								icon: <Pin />,
								label: 'Change site...',
								value: 'site',
								fetcher: {
									options: getCompanySitesQuery(ticket?.company?.id ?? -1),
									itemView: (item: Site) => (
										<CommandItem
											value={`${item.id.toString()}-${item.name}`}
											onSelect={(value) =>
												handleTicketUpdate({
													operation: [
														{
															op: Operation.Replace,
															path: 'site/id',
															value: Number(value.split('-')[0]),
														},
													],
												})
											}
										>
											{item.name}
										</CommandItem>
									),
								},
							},
							{
								icon: <CalendarPlus />,
								label: 'Set due date...',
								value: 'due-date',
								action: () => {},
							},
						],
					},
				]}
			/>
		</main>
	);
}
