'use client';
import type { VoiceAttributes } from '@athena/utils';
import { UseMutationResult, useQueries } from '@tanstack/react-query';
import {
	ArrowRightFromLine,
	Grip,
	Headset,
	Loader2,
	Mic,
	Phone,
	UserPlus2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type {
	ParticipantInstance,
	ParticipantListInstanceCreateOptions,
	ParticipantStatus,
} from 'twilio/lib/rest/api/v2010/account/conference/participant';
import type { OutgoingTransfer } from 'twilio-taskrouter';
import z from 'zod';
import DevicePicker from '@/components/device-picker';
import { Dialpad } from '@/components/dialpad';
import { ListSelector } from '@/components/list-selector';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Engagement } from '@/contexts/twilio-provider';
import { useCall } from '@/hooks/use-call';
import { useConference } from '@/hooks/use-conference';
import { getMembersQuery } from '@/lib/manage/api';
import { getWorkersQuery } from '@/lib/twilio/api';

const transferParticipantSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('internal'),
		name: z.string(),
		sid: z.string(),
	}),
	z.object({
		type: z.literal('external'),
		name: z.string(),
		number: z.string(),
	}),
]);

const ActiveCallFooter = ({
	engagement,
	attributes,

	onTransferInitiated,
	onTransferCompleted,
	onTransferFailed,
	onTransferCanceled,
	onTransferAttemptFailed,
}: {
	engagement: Engagement;
	attributes: VoiceAttributes;
	handleParticipantCreation: UseMutationResult<
		| {
				accountSid: string;
				callSid: string;
				label: string;
				callSidToCoach: string;
				coaching: boolean;
				conferenceSid: string;
				dateCreated: Date;
				dateUpdated: Date;
				endConferenceOnExit: boolean;
				muted: boolean;
				hold: boolean;
				startConferenceOnEnter: boolean;
				status: ParticipantStatus;
				queueTime: string;
				uri: string;
		  }
		| undefined,
		Error,
		{
			options: ParticipantListInstanceCreateOptions;
		},
		{
			previousItems: ParticipantInstance[];
			newItems: ParticipantInstance[];
		}
	>;
	onTransferInitiated?: (transfer: OutgoingTransfer) => void;
	onTransferCompleted?: (transfer: OutgoingTransfer) => void;
	onTransferFailed?: (transfer: OutgoingTransfer) => void;
	onTransferCanceled?: (transfer: OutgoingTransfer) => void;
	onTransferAttemptFailed?: (transfer: OutgoingTransfer) => void;
}) => {
	const { call, disconnectCall, toggleMute, sendDigits } = useCall({
		call: engagement.call,
	});

	const [transferTab, setTransferTab] = useState(false);
	const {
		participantsQuery: { data: participants },
		handleParticipantCreation,
		handleParticipantRemoval,
		handleParticipantUpdate,
	} = useConference({
		sid: attributes?.conference?.sid,
	});

	const [{ data: workers }, { data: members }] = useQueries({
		queries: [
			{
				...getWorkersQuery({ available: '1' }),
				refetchInterval: transferTab ? 1000 : false,
			},
			getMembersQuery({
				fields: [
					'officePhone',
					'mobilePhone',
					'firstName',
					'lastName',
					'id',
				],
			}),
		],
	});

	const possibleTransferParticipants: z.infer<
		typeof transferParticipantSchema
	>[] = [
		...(workers?.map((worker) => ({
			type: 'internal' as const,
			name: JSON.parse(worker.attributes).full_name,
			// workerAttributesSchema.safeParse(JSON.parse(worker.attributes))
			// 	?.data?.full_name ?? '',
			sid: worker.sid,
		})) || []),
		...(members
			?.filter((member) => member.officePhone || member.mobilePhone)
			.map((member) => ({
				type: 'external' as const,
				name: `${member.firstName ?? ''} ${member.lastName ?? ''}`,
				number: (member.officePhone || member.mobilePhone)!,
			})) || []),
	];

	const handleTransferInitiation = useCallback(
		(transfer: OutgoingTransfer) => {
			onTransferInitiated?.(transfer);

			transfer.on('completed', (transferCompleted) => {
				// Handle transfer completed event
				onTransferCompleted?.(transferCompleted);
			});

			transfer.on('failed', (transferFailed) => {
				// Handle transfer failed event
				onTransferFailed?.(transferFailed);
			});

			transfer.on('canceled', (transferCanceled) => {
				// Handle transfer canceled event
				onTransferCanceled?.(transferCanceled);
			});

			transfer.on('attemptFailed', (transferAttemptFailed) => {
				// Handle transfer attempt failed event
				onTransferAttemptFailed?.(transferAttemptFailed);
			});
		},
		[
			onTransferInitiated,
			onTransferCompleted,
			onTransferFailed,
			onTransferCanceled,
			onTransferAttemptFailed,
		]
	);

	useEffect(() => {
		engagement.reservation.task.on(
			'transferInitiated',
			handleTransferInitiation
		);

		return () => {
			engagement.reservation.task.off(
				'transferInitiated',
				handleTransferInitiation
			);
		};
	}, [engagement.reservation.task, handleTransferInitiation]);

	return (
		<CardFooter className='p-3 space-x-1.5 justify-between'>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={call?.isMuted() ? 'destructive' : 'accepting'}
						size='icon'
						onClick={() => toggleMute.mutate()}
					>
						<Mic />
					</Button>
				</TooltipTrigger>

				<TooltipContent
					side='top'
					align='center'
				>
					<span>Mute</span>
				</TooltipContent>
			</Tooltip>

			<div className='flex items-center gap-1.5'>
				<Tooltip>
					<TooltipTrigger asChild>
						<Popover
							open={transferTab}
							onOpenChange={setTransferTab}
						>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									size='icon'
								>
									<UserPlus2 />
								</Button>
							</PopoverTrigger>

							<PopoverContent>
								<ListSelector
									items={possibleTransferParticipants ?? []}
									itemView={(item) => (
										<span>{item.name}</span>
									)}
									onSelect={async (item) => {
										if (item.type === 'internal') {
											engagement.reservation.task.transfer(
												item.sid,
												{
													mode: 'WARM',
													attributes: {
														...engagement
															.reservation.task
															.attributes,
														transferee: {
															name: item.name,
															sid: item.sid,
														},
													},
												}
											);
										} else {
											handleParticipantUpdate.mutate({
												participantSid:
													engagement.reservation.task
														.attributes.conference
														.participants.worker,
												options: {
													endConferenceOnExit: false,
												},
											});

											handleParticipantCreation.mutate({
												options: {
													to: item.number,
													from:
														attributes.direction ===
														'inbound'
															? attributes.called
															: attributes.from,
													label: item.name,
												},
											});

											await engagement.reservation.task.setAttributes(
												{
													...engagement.reservation
														.task.attributes,
													transferee: {
														name: item.name,
														sid: handleParticipantCreation
															.data?.callSid,
													},
												}
											);
										}
										// Handle the selected item
									}}
									value={(item) =>
										item.type === 'internal'
											? item.sid
											: `${item.name}-${item.number}`
									}
									groupedBy={(item) =>
										item.type === 'internal'
											? 'Internal Workers'
											: 'External Contacts'
									}
								/>
							</PopoverContent>
						</Popover>
					</TooltipTrigger>

					<TooltipContent
						side='top'
						align='center'
					>
						<span>Transfer Call</span>
					</TooltipContent>
				</Tooltip>

				<Popover>
					<Tooltip>
						<TooltipTrigger asChild>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									size='icon'
								>
									<Grip />
								</Button>
							</PopoverTrigger>
						</TooltipTrigger>

						<TooltipContent
							side='top'
							align='center'
						>
							<span>Show Keypad</span>
						</TooltipContent>
					</Tooltip>

					<PopoverContent
						side='bottom'
						align='start'
						className='w-auto'
						forceMount
					>
						<Dialpad
							onValueChange={(value) => sendDigits.mutate(value)}
						/>
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							size='icon'
						>
							<Headset />
						</Button>
					</PopoverTrigger>
					<PopoverContent className='p-0'>
						<DevicePicker />
					</PopoverContent>
				</Popover>
			</div>

			<div className='flex items-center gap-1.5'>
				{participants && participants.length > 2 && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size='icon'
								onClick={() => {
									if (
										!attributes.conference?.participants
											.worker
									)
										return;
									handleParticipantRemoval.mutate({
										participantSid:
											attributes.conference?.participants
												.worker,
									});

									engagement.reservation.wrap();
								}}
								disabled={
									!attributes.conference?.participants.worker
								}
							>
								<ArrowRightFromLine />
								<span className='sr-only'>Leave Call</span>
							</Button>
						</TooltipTrigger>

						<TooltipContent
							side='top'
							align='center'
						>
							<span>Leave Call</span>
						</TooltipContent>
					</Tooltip>
				)}

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant='destructive'
							size='icon'
							onClick={async () => {
								disconnectCall.mutate();
								await engagement.reservation.wrap();
							}}
							disabled={disconnectCall.isPending}
						>
							{disconnectCall.isPending ? (
								<Loader2 className='animate-spin' />
							) : (
								<Phone className='rotate-[135deg]' />
							)}
						</Button>
					</TooltipTrigger>

					<TooltipContent
						side='top'
						align='center'
					>
						<span>End Call</span>
					</TooltipContent>
				</Tooltip>
			</div>
		</CardFooter>
	);
};

export default ActiveCallFooter;
