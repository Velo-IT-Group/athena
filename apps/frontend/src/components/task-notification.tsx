'use client';
import { voiceAttributesSchema } from '@athena/utils';
import { Call } from '@twilio/voice-sdk';
import { Phone, Voicemail } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AcceptedReservation from '@/components/accepted-reservation';
import OutboundDialer from '@/components/outbound-dialer';
import PendingReservation from '@/components/pending-reservation';
import TaskWrapup from '@/components/task/wrapup';
import { Button } from '@/components/ui/button';
import { type Engagement, useTwilio } from '@/contexts/twilio-provider';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type Props = {
	engagement?: Engagement;
};

const TaskNotification = ({ engagement }: Props) => {
	const { worker, device } = useTwilio();
	const [open, setOpen] = useState(false);

	// const isAccepted = useMemo(
	// 	() => engagement?.reservation?.status === 'accepted',
	// 	[engagement?.reservation?.status]
	// );
	// const isWrapping = useMemo(
	// 	() => engagement?.reservation?.status === 'wrapping',
	// 	[engagement?.reservation?.status]
	// );
	// const isPending = useMemo(
	// 	() => engagement?.reservation?.status === 'pending',
	// 	[engagement?.reservation?.status]
	// );
	// const isVoicemail = useMemo(
	// 	() =>
	// 		engagement?.reservation?.task?.attributes?.taskType === 'voicemail',
	// 	[engagement?.reservation?.task?.attributes?.taskType]
	// );

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

	// const { data: attributes } = voiceAttributesSchema.safeParse(
	// 	engagement?.reservation?.task?.attributes ?? {}
	// );

	// console.log(attributes);

	// const handleReservationCompletion = useMutation({
	// 	mutationKey: ['complete-reservation'],
	// 	mutationFn: async () => {
	// 		await engagement?.reservation.complete();
	// 	},
	// });

	// const handleReservationWrapup = useMutation({
	// 	mutationKey: ['wrapup-reservation'],
	// 	mutationFn: async () => {
	// 		await engagement?.reservation.wrap();
	// 	},
	// });

	const reservationArray = Array.from(worker?.reservations.values() ?? []);

	// if (!engagement)
	// 	return (
	// 		<Popover
	// 			open={open}
	// 			onOpenChange={setOpen}
	// 		>
	// 			<PopoverTrigger asChild>
	// 				<Button
	// 					size={engagement ? 'sm' : 'icon'}
	// 					variant='ghost'
	// 					className={cn(
	// 						engagement
	// 							? 'animate-pulse bg-muted'
	// 							: 'fill-current stroke-none'
	// 					)}
	// 				>
	// 					<Phone />
	// 				</Button>
	// 			</PopoverTrigger>

	// 			<PopoverContent
	// 				className='p-0 w-80'
	// 				align='center'
	// 			>
	// 				<OutboundDialer />
	// 			</PopoverContent>
	// 		</Popover>
	// 	);

	if (reservationArray.length === 0) {
		return (
			<Popover
				open={open}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<Button
						size='icon'
						variant='ghost'
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
	} else {
		return (
			<>
				{reservationArray.map((reservation) => {
					// const attributes = reservation.task.attributes;
					const isVoicemail =
						reservation.task.attributes?.direction === 'inbound' &&
						reservation.task.attributes?.taskType === 'voicemail';
					const isWrapping = reservation.status === 'wrapping';
					const isPending = reservation.status === 'pending';
					const isAccepted = reservation.status === 'accepted';

					return (
						<Popover
							key={reservation.sid}
							open={open}
							onOpenChange={setOpen}
						>
							<PopoverTrigger asChild>
								<Button
									size={'sm'}
									variant='ghost'
									className={cn(
										reservation.status === 'pending'
											? 'animate-pulse bg-muted'
											: 'fill-current stroke-none'
									)}
									// disabled={
									// 	!engagement
									// 		? !worker?.available || !isRegistered
									// 		: false
									// }
								>
									{/* {isVoicemail ? <Voicemail /> : <Phone />} */}
									{isVoicemail ? <Voicemail /> : <Phone />}

									<span className='text-muted-foreground flex items-center gap-1.5 font-medium'>
										{reservation.task.attributes?.name}
									</span>
								</Button>
							</PopoverTrigger>

							<PopoverContent
								className='p-0 w-80'
								align='center'
							>
								{isPending && (
									<PendingReservation
										reservation={reservation}
										call={device?.calls.find(
											(c) =>
												c.status() ===
												Call.State.Pending
										)}
									/>
								)}

								{isAccepted && (
									<AcceptedReservation
										reservation={reservation}
										call={device?._activeCall}
									/>
								)}

								{isWrapping && (
									<TaskWrapup reservation={reservation} />
								)}

								{/* {isVoicemail && isAccepted ? (
								<VoicemailTask reservation={reservation} />
							) : !isVoicemail && isAccepted ? (
								<ActiveCall
									engagement={{
										reservation,
										call: device?.calls.find((c) =>
											attributes.direction === 'inbound'
												? c.parameters.CallSid ===
													attributes.call_sid
												: undefined
										),
									}}
									attributes={
										attributes as z.infer<
											typeof voiceAttributesSchema
										>
									}
								/>
							) : null}

							

							{isPending &&
							attributes.direction === 'outbound' ? (
								<OutboundTask
									reservation={reservation}
									attributes={
										attributes as VoiceAttributes & {
											direction: 'outbound';
										}
									}
								/>
							) : isPending &&
							  attributes.direction === 'inbound' ? (
								<IncomingTask
									reservation={reservation}
									attributes={
										attributes as VoiceAttributes & {
											direction: 'inbound';
										}
									}
								/>
							) : isPending &&
							  attributes.taskType === 'voicemail' ? (
								<VoicemailTask reservation={reservation} />
							) : null} */}
							</PopoverContent>
						</Popover>
					);
				})}
			</>
		);
	}

	// return (
	// 	<ContextMenu>
	// 		<Popover
	// 			open={open}
	// 			onOpenChange={setOpen}
	// 		>
	// 			<PopoverTrigger asChild>
	// 				<ContextMenuTrigger asChild>
	// <Button
	// 	size={engagement ? 'sm' : 'icon'}
	// 	variant='ghost'
	// 	className={cn(
	// 		engagement
	// 			? 'animate-pulse bg-muted'
	// 			: 'fill-current stroke-none'
	// 	)}
	// 	// disabled={
	// 	// 	!engagement
	// 	// 		? !worker?.available || !isRegistered
	// 	// 		: false
	// 	// }
	// >
	// 	{isVoicemail ? <Voicemail /> : <Phone />}

	// 	<span
	// 		className={cn(
	// 			'text-muted-foreground flex items-center gap-1.5 font-medium',
	// 			!engagement && 'sr-only'
	// 		)}
	// 	>
	// 		{attributes?.name}
	// 	</span>
	// </Button>
	// 				</ContextMenuTrigger>
	// 			</PopoverTrigger>

	// <PopoverContent
	// 	className='p-0 w-80'
	// 	align='center'
	// >
	// 	{engagement?.reservation && attributes ? (
	// 		<>
	// 			{isAccepted && (
	// 				<>
	// 					{isVoicemail ? (
	// 						<VoicemailTask
	// 							task={engagement?.reservation?.task}
	// 						/>
	// 					) : (
	// 						<ActiveCall
	// 							engagement={engagement}
	// 							attributes={attributes}
	// 						/>
	// 					)}
	// 				</>
	// 			)}

	// 			{isWrapping && (
	// 				<TaskWrapup
	// 					reservation={engagement?.reservation}
	// 				/>
	// 			)}

	// 			{isPending && (
	// 				<>
	// 					{attributes.direction === 'outbound' ? (
	// 						<OutboundTask
	// 							reservation={
	// 								engagement?.reservation
	// 							}
	// 							attributes={attributes}
	// 						/>
	// 					) : (
	// 						<IncomingTask attributes={attributes} />
	// 					)}
	// 				</>
	// 			)}
	// 		</>
	// 	) : (
	// 		<OutboundDialer />
	// 	)}
	// </PopoverContent>
	// 		</Popover>

	// 		<ContextMenuContent>
	// 			<ContextMenuItem
	// 				onClick={() => handleReservationCompletion.mutate()}
	// 				disabled={handleReservationCompletion.isPending}
	// 			>
	// 				{handleReservationCompletion.isPaused ? (
	// 					<Loader2 className='animate-spin' />
	// 				) : (
	// 					<CheckCircle />
	// 				)}{' '}
	// 				<span>Complete</span>
	// 			</ContextMenuItem>

	// 			<ContextMenuItem
	// 				onClick={() => handleReservationWrapup.mutate()}
	// 				disabled={handleReservationWrapup.isPending}
	// 			>
	// 				{handleReservationWrapup.isPaused ? (
	// 					<Loader2 className='animate-spin' />
	// 				) : (
	// 					<CheckCircle />
	// 				)}{' '}
	// 				<span>Wrapup</span>
	// 			</ContextMenuItem>
	// 		</ContextMenuContent>
	// 	</ContextMenu>
	// );
};

export default TaskNotification;
