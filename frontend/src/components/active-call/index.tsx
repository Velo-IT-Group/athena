import { Card } from '@/components/ui/card';
import ActiveCallHeader from './header';
import ActiveCallFooter from './footer';
import ActiveCallParticipants from './participants';
import { Task } from 'twilio-taskrouter';

type Props = {
	task: Task;
};

export function ActiveCall({ task }: Props) {
	const searchParams = new URLSearchParams();
	if (task.attributes.userId) {
		searchParams.set('contactId', task.attributes.userId);
	}
	if (task.attributes.companyId) {
		searchParams.set('companyId', task.attributes.companyId);
	}

	return (
		<Card className='border-none'>
			<ActiveCallHeader
				queueName={task.queueName}
				searchParams={searchParams}
			/>

			<ActiveCallParticipants />

			<ActiveCallFooter />
		</Card>
	);
}
