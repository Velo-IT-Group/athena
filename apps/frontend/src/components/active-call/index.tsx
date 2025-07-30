'use client';
import { VoiceAttributes } from '@athena/utils';
import { Card } from '@/components/ui/card';
import { Engagement } from '@/contexts/twilio-provider';
import ActiveCallFooter from './footer';
import ActiveCallHeader from './header';
import ActiveCallParticipants from './participants';

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

			<ActiveCallParticipants
				reservation={engagement?.reservation}
				attributes={attributes}
			/>

			<ActiveCallFooter
				engagement={engagement}
				attributes={attributes}
			/>
		</Card>
	);
}
