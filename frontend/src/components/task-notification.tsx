import { useMemo, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Reservation, Task } from 'twilio-taskrouter';
import IncomingTask from '@/components/incoming-task';
import { ActiveCall } from '@/components/active-call';
import TaskWrapup from '@/components/task/wrapup';
import { TaskContext } from '@/components/active-call/context';
import OutboundTask from '@/components/outbound-task';
import { Phone, Voicemail } from 'lucide-react';
import { cn } from '@/lib/utils';
import VoicemailTask from '@/components/voicemail-task';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useReservation } from '@/providers/reservation-context';

type Props = {
	reservation: Reservation;
	task: Task;
	isCollapsed?: boolean;
};

const TaskNotification = ({}: Props) => {
	const { status, reservation, isVoicemail } = useReservation();
	const [open, setOpen] = useState(
		reservation.status === 'pending' && reservation.task.attributes.direction !== 'outboundDial'
	);
	const { attributes } = reservation.task;
	const isAccepted = useMemo(() => status === 'accepted', [status]);
	const isWrapping = useMemo(() => status === 'wrapping', [status]);
	const isPending = useMemo(() => status === 'pending', [status]);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
		>
			<PopoverTrigger asChild>
				<SidebarMenuItem>
					<SidebarMenuButton
						size='sm'
						className={cn('animate-pulse')}
					>
						{isVoicemail ? <Voicemail /> : <Phone className={cn('fill-current stroke-none')} />}

						<span className='text-muted-foreground flex items-center gap-1.5 font-medium'>
							{attributes.name ?? attributes.from}
						</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</PopoverTrigger>

			<TaskContext
				reservation={reservation}
				task={reservation.task}
			>
				<PopoverContent
					side='right'
					align='start'
					sideOffset={12}
					className='p-0'
				>
					{isAccepted && (
						<>
							{isVoicemail ? (
								<VoicemailTask task={reservation.task} />
							) : (
								<ActiveCall task={reservation.task} />
							)}
						</>
					)}

					{isWrapping && <TaskWrapup task={reservation.task} />}

					{isPending && (
						<>
							{reservation.task.attributes.direction === 'outbound' ? (
								<OutboundTask
									reservation={reservation}
									task={reservation.task}
								/>
							) : (
								<IncomingTask
									reservation={reservation}
									task={reservation.task}
								/>
							)}
						</>
					)}
				</PopoverContent>
			</TaskContext>
		</Popover>
	);
};

export default TaskNotification;
