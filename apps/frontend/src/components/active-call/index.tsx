'use client';
import type { VoiceAttributes } from '@athena/utils';
import { useState } from 'react';
import type { ConferenceParticipant } from '@/components/active-call/participant-list-item';
import ParticipantListItem from '@/components/active-call/participant-list-item';
import { Card, CardContent } from '@/components/ui/card';
import type { Engagement } from '@/contexts/twilio-provider';
import { useConference } from '@/hooks/use-conference';
import { updateParticipant } from '@/lib/twilio/update';
import ActiveCallFooter from './footer';
import ActiveCallHeader from './header';

type Props = {
	engagement: Engagement;
	attributes: VoiceAttributes;
};

export function ActiveCall({ engagement, attributes }: Props) {
	const [isCustomerMuted, setIsCustomerMuted] = useState(
		engagement.reservation.task.transfers.incoming ? true : false
	);

	const {
		participantsQuery: { data: participants },
		handleParticipantCreation,
		handleParticipantRemoval,
		handleParticipantUpdate,
	} = useConference({
		sid: engagement.reservation.task.attributes.conference?.sid,
	});

	const filteredParticipants: ConferenceParticipant[] =
		participants && participants.length > 1
			? participants
					?.filter(
						(p) =>
							p.callSid !== engagement.call?.parameters?.CallSid
					)
					.map((p) => {
						console.log(p);
						if (
							p.callSid ===
							engagement.reservation.task.attributes.conference
								?.participants.customer
						) {
							return {
								name: attributes.name,
								participantType: 'customer',
								sid: p.callSid,
								isOnHold: p.hold,
							};
						} else if (
							engagement.reservation.task.transfers.incoming?.to
						) {
							return {
								name: engagement.reservation.task.attributes
									.transferee?.name,
								participantType: 'transferredWorker',
								sid: engagement.reservation.task.attributes
									.transferee?.sid,
								isOnHold: p.hold,
							};
						} else if (
							engagement.reservation.task.transfers.outgoing?.to
						) {
							return {
								name: engagement.reservation.task.attributes
									.transferee?.name,
								participantType: 'transferredWorker',
								sid: engagement.reservation.task.attributes
									.transferee?.sid,
								isOnHold: p.hold,
							};
						}
						return {
							name: p.label,
							participantType: 'transferredWorker',
							sid: p.callSid,
							isOnHold: p.hold,
						};
					})
			: [
					{
						name: attributes.name,
						participantType: 'customer',
						sid:
							attributes.direction === 'inbound'
								? attributes.call_sid
								: engagement.reservation.task.attributes
										.conference?.participants.customer ??
									'',
						isOnHold: isCustomerMuted,
					},
				];

	console.log('filtered: ', filteredParticipants);

	return (
		<Card className='border-none'>
			<ActiveCallHeader
				queueName={engagement?.reservation?.task.queueName}
			/>

			<CardContent className='p-1.5 flex flex-col justify-start'>
				{filteredParticipants.map((participant) => (
					<ParticipantListItem
						key={participant.sid}
						participant={participant}
						handleParticipantRemoval={handleParticipantRemoval}
						handleParticipantUpdate={handleParticipantUpdate}
						onHoldToggle={(isOnHold) => {
							participant.isOnHold = isOnHold;
						}}
					/>
				))}
			</CardContent>
			{/* <ActiveCallParticipants
				reservation={engagement?.reservation}
				attributes={attributes}
			/> */}

			<ActiveCallFooter
				engagement={engagement}
				attributes={attributes}
				onTransferInitiated={() => {
					setIsCustomerMuted(true);
				}}
				handleParticipantCreation={handleParticipantCreation}
				onTransferCompleted={async () => {
					if (!engagement.call?.parameters?.CallSid) return;
					await updateParticipant({
						data: {
							sid: engagement.reservation.task.attributes
								.conference?.sid,
							participantSid:
								engagement.call?.parameters?.CallSid,
							options: {
								endConferenceOnExit: false,
							},
						},
					});
				}}
			/>
		</Card>
	);
}
