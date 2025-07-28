'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { CardFooter } from '@/components/ui/card';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
	ArrowRightFromLine,
	Check,
	Grip,
	Headset,
	Loader2,
	Mic,
	Phone,
	UserPlus2,
} from 'lucide-react';
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover';
import { Dialpad } from '@/components/dialpad';
import DevicePicker from '@/components/device-picker';
import { Engagement, useTwilio } from '@/contexts/twilio-provider';
import { useCall } from '@/hooks/use-call';
import { ListSelector } from '@/components/list-selector';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getWorkersQuery } from '@/lib/twilio/api';
import { useConference } from '@/hooks/use-conference';
import { getMembersQuery } from '@/lib/manage/api';
import z, { number } from 'zod';
import { VoiceAttributes, workerAttributesSchema } from '@athena/utils';

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
}: {
	engagement: Engagement;
	attributes: VoiceAttributes;
}) => {
	const { call, disconnectCall, toggleMute, sendDigits } = useCall({
		call: engagement.call!,
	});
	const {
		participantsQuery: { data: participants },
		handleParticipantCreation,
		handleParticipantRemoval,
	} = useConference({
		sid: attributes?.conference?.sid,
	});

	const [{ data: workers }, { data: members }] = useQueries({
		queries: [
			{ ...getWorkersQuery({ available: '1' }), refetchInterval: 1000 },
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
			name: workerAttributesSchema.parse(JSON.parse(worker.attributes))
				.full_name,
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
						<Popover>
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
									onSelect={(item) => {
										if (item.type === 'internal') {
											engagement.reservation.task.transfer(
												item.sid,
												{ mode: 'WARM' }
											);
										} else {
											handleParticipantCreation.mutate({
												options: {
													to: item.number,
													from: attributes.from,
												},
											});
										}
										// Handle the selected item
									}}
									value={(item) =>
										item.type === 'internal'
											? item.sid
											: item.number
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
							onClick={() => disconnectCall.mutate()}
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
