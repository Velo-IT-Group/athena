import { RealtimeChat } from '@/components/realtime-chat';
import type { User } from '@supabase/supabase-js';
import useTwilioConversation from '@/hooks/use-twilio-conversation';
import { Reservation, Task } from 'twilio-taskrouter';
import { UnsentMessage } from '@twilio/conversations';

interface Props {
	engagement: {
		reservation: Reservation;
		task: Task;
	};
	user?: User;
	accessToken: string;
}

const ChatEngagement = ({ engagement, user, accessToken }: Props) => {
	if (!engagement?.reservation) {
		throw new Error('Please provide a reservation');
	}

	const { task } = engagement;

	// const parsedAttributes = useMemo(() => JSON.parse(task.attributes), [task.attributes]);

	const {
		conversation,
		messages,
		sendMessage,
		participants,
		participantsTyping,
	} = useTwilioConversation({
		sid: (task.attributes.conversationSid as unknown as string) ?? '',
		token: accessToken,
	});

	const { data: conversationData, isLoading } = conversation;

	return (
		<>
			<RealtimeChat
				messages={messages}
				roomName={conversationData?.sid ?? ''}
				username={'nblack@velomethod.com'}
				isConnected={!isLoading}
				participants={participants ?? []}
				participantsTyping={participantsTyping ?? []}
				messageBuilder={conversationData?.prepareMessage()}
				onSubmit={async (message) => {
					if (!message) return;
					const newMessage: UnsentMessage = message;
					newMessage.attributes = {
						taskSid: task.sid,
						reservationSid: engagement.reservation.sid,
					};
					sendMessage(newMessage);
				}}
			/>
			<p className='text-sm text-muted-foreground'>
				{participantsTyping.map((p) => (
					<span key={p.sid}>{p.identity} is typing...</span>
				))}
			</p>
		</>
	);
};

export default ChatEngagement;
