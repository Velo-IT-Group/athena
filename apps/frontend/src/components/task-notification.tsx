'use client';
import { voiceAttributesSchema } from '@athena/utils';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, Loader2, Phone, Voicemail } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ActiveCall } from '@/components/active-call';
import IncomingTask from '@/components/incoming-task';
import OutboundDialer from '@/components/outbound-dialer';
import OutboundTask from '@/components/outbound-task';
import TaskWrapup from '@/components/task/wrapup';
import { Button } from '@/components/ui/button';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
import VoicemailTask from '@/components/voicemail-task';
import { Engagement } from '@/contexts/twilio-provider';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type Props = {
	engagement?: Engagement;
};

const TaskNotification = ({ engagement }: Props) => {
	const [open, setOpen] = useState(false);

	const isAccepted = useMemo(
		() => engagement?.reservation?.status === 'accepted',
		[engagement?.reservation?.status]
	);
	const isWrapping = useMemo(
		() => engagement?.reservation?.status === 'wrapping',
		[engagement?.reservation?.status]
	);
	const isPending = useMemo(
		() => engagement?.reservation?.status === 'pending',
		[engagement?.reservation?.status]
	);
	const isVoicemail = useMemo(
		() =>
			engagement?.reservation?.task?.attributes?.taskType === 'voicemail',
		[engagement?.reservation?.task?.attributes?.taskType]
	);

	useEffect(() => {
		if (!engagement) return;

		setOpen(true);
		// setOpen(
		// 	engagement?.reservation?.status === 'pending' &&
		// 		engagement.call !== undefined &&
		// 		[Call.State.Pending, Call.State.Ringing].includes(
		// 			engagement?.call?.status()
		// 		)
		// );
	}, [engagement]);

	const { data: attributes } = voiceAttributesSchema.safeParse(
		engagement?.reservation?.task?.attributes ?? {}
	);

	const handleReservationCompletion = useMutation({
		mutationKey: ['complete-reservation'],
		mutationFn: async () => {
			await engagement?.reservation.complete();
		},
	});

	const handleReservationWrapup = useMutation({
		mutationKey: ['wrapup-reservation'],
		mutationFn: async () => {
			await engagement?.reservation.wrap();
		},
	});

	if (!engagement)
		return (
			<Popover
				open={open}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<Button
						size={engagement ? 'sm' : 'icon'}
						variant='ghost'
						className={cn(
							engagement
								? 'animate-pulse bg-muted'
								: 'fill-current stroke-none'
						)}
					>
						<Phone />
					</Button>
				</PopoverTrigger>

				<PopoverContent
					className='p-0 w-80'
					align='center'
				>
					<OutboundDialer />
				</PopoverContent>
			</Popover>
		);

	return (
		<ContextMenu>
			<Popover
				open={open}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<ContextMenuTrigger asChild>
						<Button
							size={engagement ? 'sm' : 'icon'}
							variant='ghost'
							className={cn(
								engagement
									? 'animate-pulse bg-muted'
									: 'fill-current stroke-none'
							)}
							// disabled={
							// 	!engagement
							// 		? !worker?.available || !isRegistered
							// 		: false
							// }
						>
							{isVoicemail ? <Voicemail /> : <Phone />}

							<span
								className={cn(
									'text-muted-foreground flex items-center gap-1.5 font-medium',
									!engagement && 'sr-only'
								)}
							>
								{attributes?.name}
							</span>
						</Button>
					</ContextMenuTrigger>
				</PopoverTrigger>

				<PopoverContent
					className='p-0 w-80'
					align='center'
				>
					{engagement?.reservation && attributes ? (
						<>
							{isAccepted && (
								<>
									{isVoicemail ? (
										<VoicemailTask
											task={engagement?.reservation?.task}
										/>
									) : (
										<ActiveCall
											engagement={engagement}
											attributes={attributes}
										/>
									)}
								</>
							)}

							{isWrapping && (
								<TaskWrapup
									reservation={engagement?.reservation}
								/>
							)}

							{isPending && (
								<>
									{attributes.direction === 'outbound' ? (
										<OutboundTask
											reservation={
												engagement?.reservation
											}
											attributes={attributes}
										/>
									) : (
										<IncomingTask attributes={attributes} />
									)}
								</>
							)}
						</>
					) : (
						<OutboundDialer />
					)}
				</PopoverContent>
			</Popover>

			<ContextMenuContent>
				<ContextMenuItem
					onClick={() => handleReservationCompletion.mutate()}
					disabled={handleReservationCompletion.isPending}
				>
					{handleReservationCompletion.isPaused ? (
						<Loader2 className='animate-spin' />
					) : (
						<CheckCircle />
					)}{' '}
					<span>Complete</span>
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => handleReservationWrapup.mutate()}
					disabled={handleReservationWrapup.isPending}
				>
					{handleReservationWrapup.isPaused ? (
						<Loader2 className='animate-spin' />
					) : (
						<CheckCircle />
					)}{' '}
					<span>Wrapup</span>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};

export default TaskNotification;
