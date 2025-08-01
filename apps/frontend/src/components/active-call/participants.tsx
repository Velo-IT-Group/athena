'use client';
import type { VoiceAttributes } from '@athena/utils';
import { useQuery } from '@tanstack/react-query';
import type { Reservation } from 'twilio-taskrouter';
import ParticipantListItem, {
	type ConferenceParticipant,
	type Participant,
} from '@/components/active-call/participant-list-item';
import { CardContent } from '@/components/ui/card';
import { getConferenceParticipantsQuery } from '@/lib/twilio/api';

const ActiveCallParticipants = ({
	reservation,
	attributes,
}: {
	reservation: Reservation;
	attributes: VoiceAttributes;
}) => {
	const entries: string[] = Object.entries(
		attributes?.conference?.participants || {}
	)
		.filter(([key]) => key !== 'worker')
		.flatMap(([, value]) => value);

	const { data: participantsData } = useQuery({
		...getConferenceParticipantsQuery(
			reservation?.task.attributes?.conference?.sid ||
				attributes?.conference?.sid
		),
		enabled:
			!!reservation.task.attributes.conference?.participants
				.transferredWorker,
	});

	console.log(participantsData);

	const filteredParticipants: ConferenceParticipant[] = [
		{
			name: attributes.name,
			participantType: 'customer',
			sid: attributes.direction === 'inbound' ? attributes.call_sid : '',
		},
	] as ConferenceParticipant[];

	// const filteredParticipants: ConferenceParticipant[] = participantsData
	// 	? participantsData
	// 			?.filter((p) => entries.includes(p.callSid))
	// 			.map((p) => ({
	// 				name:
	// 					attributes.direction === 'inbound' &&
	// 					p.callSid === attributes.call_sid
	// 						? attributes.name
	// 						: attributes.name,
	// 				participantType: 'worker',
	// 				sid: p.callSid,
	// 			}))
	// 	: ();

	console.log(filteredParticipants);

	return (
		<CardContent className='p-1.5 flex flex-col justify-start'>
			{filteredParticipants.map((participant) => (
				<ParticipantListItem
					key={participant.sid}
					participant={participant}
				/>
			))}
		</CardContent>
	);
};

export default ActiveCallParticipants;
