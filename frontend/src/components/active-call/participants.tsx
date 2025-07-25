'use client';
import ParticipantListItem, {
	Participant,
} from '@/components/active-call/participant-list-item';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useConference } from '@/hooks/use-conference';
import { cn } from '@/lib/utils';
import { VoiceAttributes } from '@/types/twilio';
import { Grip, Mic, Pause, User } from 'lucide-react';

const ActiveCallParticipants = ({
	attributes,
}: {
	attributes: VoiceAttributes;
}) => {
	const {
		participantsQuery: { data: participantsData, isLoading },
	} = useConference({
		sid: attributes?.conference?.sid,
	});

	if (!attributes || !attributes.conference) return null;

	const { participants } = attributes.conference;

	const entries: string[] = Object.entries(participants)
		.filter(([key]) => key !== 'worker')
		.flatMap(([, value]) => value);

	const filteredParticipants =
		participantsData?.filter((p) => entries.includes(p.callSid)) || [];

	return (
		<CardContent className='p-1.5 flex flex-col justify-start'>
			{isLoading ? (
				<>
					{Array.from({ length: 2 }).map((_, index) => (
						<div
							key={index}
							className={cn(
								buttonVariants({
									variant: 'ghost',
									size: 'sm',
								}),
								'flex items-center justify-between h-9 hover:bg-transparent relative'
								// isOnHold && 'opacity-50'
							)}
						>
							<User />
							<Skeleton className='w-1/4' />
						</div>
					))}
				</>
			) : (
				<>
					{filteredParticipants.length === 1 ? (
						<div className='flex flex-col items-center gap-3 w-full'>
							<Avatar className='size-12 rounded-lg'>
								<AvatarFallback>UU</AvatarFallback>
							</Avatar>

							<p>{attributes.name}</p>

							<p>
								{attributes?.direction === 'outbound'
									? attributes?.outbound_to
									: attributes?.from}
							</p>

							<div className='flex items-center justify-around gap-1.5 w-full'>
								<Button size='icon'>
									<Mic />
								</Button>

								<Button size='icon'>
									<Pause />
								</Button>

								<Button size='icon'>
									<Grip />
								</Button>
							</div>
						</div>
					) : (
						<>
							{filteredParticipants.map((participant) => (
								<ParticipantListItem
									key={participant.callSid}
									participantType={
										(Object.entries(participants).find(
											([key, value]) =>
												value.includes(
													participant.callSid
												)
										)?.[0] as Participant) ?? 'worker'
									}
									showRemoval={entries.length > 2}
									sid={participant.callSid}
									attributes={attributes}
								/>
							))}
						</>
					)}
				</>
			)}

			{/* {items.map((item) => {
				const data = item.data as ParticipantInstance;

				return (
					<ParticipantListItem
						key={data.AccountSid}
						participantType={'customer'}
						sid={data.AccountSid}
						showRemoval={items.length > 2}
					/>
				);
			})} */}
		</CardContent>
	);
};

export default ActiveCallParticipants;
