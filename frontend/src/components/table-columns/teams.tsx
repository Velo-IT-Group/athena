import { ColumnDef, type Column, type Row } from '@tanstack/react-table';
import type { WorkerConversation } from '@/routes/_authed/teams';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import ActivityListItem from '@/components/activity-list-item';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Mic, Phone, PhoneCall, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import Timer from '@/components/timer';
import { getDateOffset } from '@/utils/date';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@tanstack/react-router';
import ManageUserAvatar from '@/components/avatar/manage-user-avatar';

export const columns: ColumnDef<WorkerConversation>[] = [
	{
		id: 'full_name',
		accessorKey: 'attributes',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Worker'
				className='w-96'
			/>
		),
		cell: ({ row }) => (
			<Link
				to='/teams'
				search={{ pane: 'worker', itemId: row.original?.sid }}
				className='flex items-center gap-1.5'
			>
				<ManageUserAvatar
					memberId={
						JSON.parse(JSON.stringify(row.original.attributes))
							.member_id
					}
				/>

				<div className='flex flex-col items-start'>
					<p>
						{
							JSON.parse(JSON.stringify(row.original.attributes))
								.full_name
						}
					</p>

					<div className='flex items-center gap-1.5'>
						<ActivityListItem
							activityName={row.original.activityName}
						/>

						<Separator
							orientation='vertical'
							className='h-4'
						/>

						{/* <Timer
							stopwatchSettings={{
								offsetTimestamp: getDateOffset(
									new Date(row.original.dateStatusChanged)
								),
								autoStart: true,
							}}
						/> */}
					</div>
				</div>
			</Link>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'calls',
		accessorKey: 'tasks',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Calls'
				className='w-96'
			/>
		),
		cell: ({ row, column }) => {
			return (
				<div className='w-96'>
					{row.original.tasks.length > 0 ? (
						<div className='flex flex-col items-start gap-1.5'>
							{row.original.tasks.map((task) => {
								return (
									<ActiveCall
										key={task.sid}
										task={task}
									/>
								);
							})}
						</div>
					) : (
						<Component />
					)}
				</div>
			);
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'chats',
		accessorKey: 'tasks',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Chats'
				className='w-96'
			/>
		),
		cell: ({ row, column }) => <Component />,
		enableSorting: false,
		enableHiding: false,
	},
];

const WorkerCell = ({
	row,
	column,
}: {
	row: Row<WorkerConversation>;
	column: Column<WorkerConversation, unknown>;
}) => (
	<Sheet>
		<SheetTrigger>
			<div className='flex items-center gap-1.5'>
				<Avatar className='size-12'>
					<AvatarFallback>
						<User className='size-5 stroke-[2px]' />
					</AvatarFallback>
				</Avatar>

				<div className='flex flex-col items-start'>
					<p>
						{
							JSON.parse(JSON.stringify(row.original.attributes))
								.full_name
						}
					</p>

					<div className='flex items-center gap-1.5'>
						<ActivityListItem
							activityName={row.original.activityName}
						/>

						<Separator
							orientation='vertical'
							className='h-4'
						/>

						{/* <Timer
							stopwatchSettings={{
								offsetTimestamp: getDateOffset(
									new Date(row.original.dateStatusChanged)
								),
								autoStart: true,
							}}
						/> */}
					</div>
				</div>
			</div>
		</SheetTrigger>

		<SheetContent className='gap-0 sm:max-w-xl'>
			<SheetHeader>
				<div className='flex items-center gap-1.5'>
					<SheetTitle>
						{
							JSON.parse(JSON.stringify(row.original.attributes))
								.full_name
						}
					</SheetTitle>

					{/* <Popover>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								role='combobox'
								className='w-[200px] justify-between'
								// disabled={isPending}
							>
								<ActivityListItem activityName={row.original.activityName} />
							</Button>
						</PopoverTrigger>

						<ModalPopoverContent className='p-0'>
							<ListSelector
								items={activities}
								currentValue={activities.find((a) => a.sid === cell.activitySid)}
								itemView={(a) => <ActivityListItem activityName={a.friendlyName} />}
							/>
						</ModalPopoverContent>
					</Popover> */}
				</div>
			</SheetHeader>

			<div className='p-6'></div>
		</SheetContent>
	</Sheet>
);

function Component() {
	return (
		<div
			className='rounded pattern-diagonal-lines pattern-primary pattern-bg-background
  pattern-size-2 pattern-opacity-15 w-56 h-12 border border-primary'
		/>
	);
}

function ActiveCall({ task }: { task: TaskInstance }) {
	const isWrapping = task.assignmentStatus === 'wrapping';
	const parsedAttributes = JSON.parse(task.attributes);

	return (
		<></>
		// <Sheet>
		// 	<SheetTrigger asChild>
		// 		<Button
		// 			variant='outline'
		// 			size='lg'
		// 			className='h-12 items-center gap-[1.125rem] w-56 border-primary justify-start'
		// 		>
		// 			{isWrapping ? <Phone className='rotate-[135deg]' /> : <Phone />}

		// 			<div className='flex flex-col items-start'>
		// 				<span className='text-xs'>{parsedAttributes.name}</span>

		// 				<div className='flex text-xs text-muted-foreground'>
		// 					<Timer
		// 						stopwatchSettings={{
		// 							offsetTimestamp: getDateOffset(new Date(task.dateUpdated)),
		// 							autoStart: true,
		// 						}}
		// 						hideDays
		// 						hideHours
		// 					/>
		// 					<span className=''>&nbsp;</span>| {task.taskQueueFriendlyName}
		// 				</div>
		// 			</div>
		// 		</Button>
		// 	</SheetTrigger>

		// 	<SheetContent className='gap-0 sm:max-w-xl'>
		// 		<SheetHeader>
		// 			<SheetTitle className='text-2xl'>Monitor Engagement</SheetTitle>
		// 		</SheetHeader>

		// 		<Tabs
		// 			defaultValue='engagement'
		// 			className='flex-1 px-4 overflow-hidden'
		// 		>
		// 			<TabsList>
		// 				<TabsTrigger value='engagement'>Engagement</TabsTrigger>
		// 				<TabsTrigger value='info'>Info</TabsTrigger>
		// 			</TabsList>

		// 			<TabsContent
		// 				value='engagement'
		// 				asChild
		// 			>
		// 				<div className='flex-1 grid place-items-center'>
		// 					<div className='flex flex-col items-center gap-6'>
		// 						{isWrapping ? (
		// 							<Phone className='rotate-[135deg] size-9' />
		// 						) : (
		// 							<Phone className='size-9' />
		// 						)}

		// 						<p className='text-lg font-semibold'>
		// 							{parsedAttributes.name === parsedAttributes.caller ? (
		// 								<span>{parsedAttributes.name}</span>
		// 							) : (
		// 								<span>
		// 									{parsedAttributes.name}, {parsedAttributes.caller}
		// 								</span>
		// 							)}
		// 						</p>
		// 					</div>
		// 				</div>
		// 			</TabsContent>

		// 			<TabsContent
		// 				value='info'
		// 				asChild
		// 			>
		// 				<pre className='flex-1 text-wrap overflow-y-scroll overflow-x-hidden'>
		// 					{JSON.stringify(task, null, 2)}
		// 				</pre>
		// 			</TabsContent>
		// 		</Tabs>

		// 		<SheetFooter className='flex-row justify-center gap-6'>
		// 			<Button
		// 				size='icon'
		// 				variant='outline'
		// 				className='rounded-full size-12 shrink-0'
		// 				disabled={isWrapping}
		// 			>
		// 				<Mic />
		// 			</Button>

		// 			<Button
		// 				size='icon'
		// 				variant='outline'
		// 				className='rounded-full size-12 shrink-0'
		// 				disabled={isWrapping}
		// 			>
		// 				<PhoneCall />
		// 			</Button>

		// 			<Button
		// 				size='icon'
		// 				variant='outline'
		// 				className='rounded-full size-12 shrink-0'
		// 				onClick={() => worker?.monitor(task.sid, '', {})}
		// 				disabled={isWrapping}
		// 			>
		// 				<User />
		// 			</Button>
		// 		</SheetFooter>
		// 	</SheetContent>
		// </Sheet>
	);
}
