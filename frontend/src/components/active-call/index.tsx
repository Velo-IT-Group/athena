'use client';
import { Card } from '@/components/ui/card';
import ActiveCallHeader from './header';
import ActiveCallFooter from './footer';
import ActiveCallParticipants from './participants';
import { Engagement } from '@/contexts/twilio-provider';
import { VoiceAttributes } from '@athena/utils';

type Props = {
	engagement: Engagement;
	attributes: VoiceAttributes;
};

export function ActiveCall({ engagement, attributes }: Props) {
	return (
		<Card className='border-none'>
			<ActiveCallHeader
				queueName={engagement?.reservation?.task.queueName}
			/>

			<ActiveCallParticipants attributes={attributes} />

			<ActiveCallFooter
				engagement={engagement}
				attributes={attributes}
			/>
		</Card>
	);
}
