import { useEffect } from 'react';
import { Button, buttonVariants } from '../ui/button';
import { CircleMinus, Pause, Play, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import useConferenceParticipant from '@/hooks/use-conference-participant';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Skeleton } from '../ui/skeleton';
import { useTaskContext } from './context';
import { useWorker } from '@/providers/worker-provider';

export type Participant = 'worker' | 'customer' | 'external' | 'transferredWorker';

type Props = {
	participantType: Participant;
	sid: string;
	// name: string;
	// isYou: boolean;
	showRemoval: boolean;
	// nameKey: string;
};

const ParticipantListItem = ({ participantType, sid, showRemoval }: Props) => {
	const { conference, removeParticipantByName, wrapUpTask, task } = useTaskContext();
	const { worker } = useWorker();
	const {
		isOnHold,
		removeParticipant,
		setIsMuted,
		setIsCoaching,
		setIsOnHold,
		setStatus,
		toggleParticipantHoldState,
		participant,
		isParticipantLoading,
	} = useConferenceParticipant({
		conferenceSid: conference?.sid ?? '',
		participantSid: sid,
	});

	// const { data: participant, isLoading } = getParticipant;

	useEffect(() => {
		if (!participant) return;
		setIsMuted(participant.muted);
		setIsOnHold(participant.hold);
		setStatus(participant.status);
		setIsCoaching(participant.coaching);
	}, [participant]);

	if (isParticipantLoading) return <Skeleton className='h-9 w-full' />;

	return (
		<div
			className={cn(
				buttonVariants({
					variant: participant?.hold ? 'secondary' : 'ghost',
					size: 'sm',
				}),
				'flex items-center justify-between h-9 hover:bg-transparent relative',
				isOnHold && 'opacity-50'
			)}
		>
			<div className='mr-1.5 relative'>
				<User />
			</div>

			<p className='text-sm'>
				<span>
					{participantType === 'worker' && worker?.attributes.full_name}
					{participantType === 'customer' && (task?.attributes.name ?? task?.attributes.from)}
					{participantType === 'external' && task?.attributes?.externalContact}
					{participantType === 'transferredWorker' && sid}
				</span>

				{participantType === 'worker' && <span className='text-xs font-medium ml-1.5'>You</span>}
			</p>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						className='ml-auto'
						onClick={() =>
							toggleParticipantHoldState.mutate({
								hold: participant?.hold !== undefined ? !participant?.hold : true,
							})
						}
					>
						{participant?.hold ? <Play /> : <Pause />}
					</Button>
				</TooltipTrigger>

				<TooltipContent>{participant?.hold ? 'Remove From Hold' : 'Put On Hold'}</TooltipContent>
			</Tooltip>

			{showRemoval && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant='ghost'
							size='icon'
							onClick={() => {
								removeParticipant.mutate();
								removeParticipantByName(participantType);
								if (participantType === 'worker') {
									wrapUpTask?.mutate('Left conference');
								}
							}}
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
