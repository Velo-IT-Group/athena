'use client';
import { Button, buttonVariants } from '../ui/button';
import { CircleMinus, Loader2, Pause, Play, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Task } from 'twilio-taskrouter';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTwilio } from '@/contexts/twilio-provider';
import { VoiceAttributes } from '@athena/utils';

export type Participant =
	| 'worker'
	| 'customer'
	| 'external'
	| 'transferredWorker';

type Props = {
	participantType: Participant;
	sid: string;
	// name: string;
	// isYou: boolean;
	showRemoval: boolean;
	attributes: VoiceAttributes;
};

const ParticipantListItem = ({
	participantType,
	sid,
	showRemoval,
	attributes,
}: Props) => {
	const { activeEngagement } = useTwilio();
	const [isOnHold, setIsOnHold] = useState(false);

	const toggleHold = useMutation({
		mutationKey: ['participant', 'update', sid],
		mutationFn: async () => {
			activeEngagement?.reservation.task.updateParticipant({
				hold: !isOnHold,
			});
		},
		onSuccess: () => setIsOnHold((prev) => !prev),
	});

	return (
		<div
			className={cn(
				buttonVariants({
					variant: 'secondary',
					size: 'sm',
				}),
				'flex items-center justify-between h-9 hover:bg-transparent relative'
				// isOnHold && 'opacity-50'
			)}
		>
			<div className='mr-1.5 relative'>
				<User />
			</div>

			<p className='text-sm'>
				<span>
					{participantType === 'worker' && 'You'}
					{participantType === 'customer' &&
						(attributes.name ?? attributes.from)}
					{/* {participantType === 'worker' &&
						worker?.attributes.full_name}
					{participantType === 'customer' &&
						(task?.attributes.name ??
							parsePhoneNumber(task?.attributes.from)
								.formattedNumber)}
					{participantType === 'external' &&
						task?.attributes?.externalContact}
					{participantType === 'transferredWorker' && sid} */}
				</span>
			</p>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={isOnHold ? 'secondary' : 'ghost'}
						size='icon'
						className='ml-auto'
						onClick={() => toggleHold.mutate()}
						disabled={toggleHold.isPending}
					>
						{toggleHold.isPending ? (
							<Loader2 className='animate-spin' />
						) : isOnHold ? (
							<Play />
						) : (
							<Pause />
						)}
					</Button>
				</TooltipTrigger>

				<TooltipContent>
					{/* {participant?.hold ? 'Remove From Hold' : 'Put On Hold'} */}
				</TooltipContent>
			</Tooltip>

			{showRemoval && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant='ghost'
							size='icon'
							// onClick={() => {
							// 	removeParticipant.mutate();
							// 	removeParticipantByName(participantType);
							// 	if (participantType === 'worker') {
							// 		wrapUpTask?.mutate('Left conference');
							// 	}
							// }}
						>
							<CircleMinus />
						</Button>
					</TooltipTrigger>

					<TooltipContent>Remove</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
};

export default ParticipantListItem;
