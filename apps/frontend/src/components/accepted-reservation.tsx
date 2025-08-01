import {
	voiceAttributesSchema,
	voicemailAttributesSchema,
} from '@athena/utils';
import type { Call } from '@twilio/voice-sdk';
import type { Reservation } from 'twilio-taskrouter';
import { ActiveCall } from '@/components/active-call';
import VoicemailTask from '@/components/voicemail-task';

type Props = {
	reservation: Reservation;
	call?: Call;
};

function AcceptedReservation({ reservation, call }: Props) {
	const { data: voicemailAttributes } = voicemailAttributesSchema.safeParse(
		reservation.task.attributes
	);

	if (voicemailAttributes) return <VoicemailTask reservation={reservation} />;

	const { data: voiceAttributes } = voiceAttributesSchema.safeParse(
		reservation.task.attributes
	);

	if (voiceAttributes)
		return (
			<ActiveCall
				engagement={{ reservation, call }}
				attributes={voiceAttributes}
			/>
		);

	return null;
}

export default AcceptedReservation;
