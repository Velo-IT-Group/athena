'use client';
import { UseMutationResult } from '@tanstack/react-query';
import { CircleMinus, Loader2, Pause, Play, User } from 'lucide-react';
import {
	ParticipantContextUpdateOptions,
	ParticipantInstance,
} from 'twilio/lib/rest/api/v2010/account/conference/participant';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type Participant =
	| 'worker'
	| 'customer'
	| 'external'
	| 'transferredWorker';

export type ConferenceParticipant = {
	participantType: Participant;
	sid: string;
	name: string;
	isOnHold: boolean;
};

type Props = {
	participant: ConferenceParticipant;
	onHoldToggle?: (isOnHold: boolean) => void;
	handleParticipantUpdate: UseMutationResult<
		{},
		Error,
		{
			participantSid: string;
			options: ParticipantContextUpdateOptions;
		},
		{
			previousItems: ParticipantInstance[];
			newItems: ParticipantInstance[];
		}
	>;
	handleParticipantRemoval: UseMutationResult<
		boolean,
		Error,
		{
			participantSid: string;
		},
		{
			previousItems: ParticipantInstance[];
			newItems: ParticipantInstance[];
		}
	>;
	// participantType: Participant;
	// sid: string;
	// showRemoval: boolean;
	// attributes: VoiceAttributes;
};

const ParticipantListItem = ({
	participant,
	onHoldToggle,
	handleParticipantRemoval,
	handleParticipantUpdate,
}: Props) => {
	const { sid, name, isOnHold } = participant;

	return (
		<div
			className={cn(
				buttonVariants({
					variant: 'secondary',
					size: 'sm',
				}),
				'flex items-center justify-between h-9 hover:bg-transparent relative',
				isOnHold && 'opacity-50'
			)}
		>
			<div className='mr-1.5 relative'>
				<User />
			</div>

			<p className='text-sm'>{name}</p>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={isOnHold ? 'secondary' : 'ghost'}
						size='icon'
						className='ml-auto'
						onClick={() =>
							handleParticipantUpdate.mutate({
								participantSid: participant.sid,
								options: {
									hold: !isOnHold,
								},
							})
						}
						disabled={handleParticipantUpdate.isPending}
					>
						{handleParticipantUpdate.isPending &&
						handleParticipantUpdate.variables?.participantSid ===
							participant.sid ? (
							<Loader2 className='animate-spin' />
						) : isOnHold ? (
							<Play />
						) : (
							<Pause />
						)}
					</Button>
				</TooltipTrigger>

				<TooltipContent>
					{isOnHold ? 'Remove From Hold' : 'Put On Hold'}
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						onClick={() => {
							handleParticipantRemoval.mutate({
								participantSid: participant.sid,
							});
						}}
					>
						{handleParticipantRemoval.isPending &&
						handleParticipantRemoval.variables?.participantSid ===
							participant.sid ? (
							<Loader2 className='animate-spin' />
						) : (
							<CircleMinus />
						)}
					</Button>
				</TooltipTrigger>

				<TooltipContent>Remove</TooltipContent>
			</Tooltip>
		</div>
	);
};

export default ParticipantListItem;
