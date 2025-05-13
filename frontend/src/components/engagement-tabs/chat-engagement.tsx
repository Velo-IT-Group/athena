import { useMemo } from 'react';
import { RealtimeChat } from '@/components/realtime-chat';
import type { User } from '@supabase/supabase-js';
import type { Engagement } from '@/providers/worker-provider';

type Props = {
	engagement: Engagement;
	user?: User;
};

const ChatEngagement = ({ engagement, user }: Props) => {
	if (!engagement?.reservation) {
		throw new Error('Task not found');
	}

	const { task } = engagement.reservation;

	const parsedAttributes = useMemo(() => task.attributes, [task.attributes]);

	return (
		<RealtimeChat
			messages={[
				{
					id: crypto.randomUUID(),
					content: 'Hi, I need some technical assistance today.',
					user: {
						name: (parsedAttributes?.name ?? '') + ' (Customer)',
					},
					createdAt: new Date().toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: "Hello! I'd be happy to help. What seems to be the issue?",
					user: {
						name: user?.user_metadata.full_name + ' (Agent)',
					},
					createdAt: new Date(Date.now() + 1).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'My computer keeps freezing when I try to open certain applications.',
					user: {
						name: (parsedAttributes?.name ?? '') + ' (Customer)',
					},
					createdAt: new Date(Date.now() + 2).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'I understand. Let me help you troubleshoot that. When did this issue start happening?',
					user: {
						name: user?.user_metadata.full_name + ' (Agent)',
					},
					createdAt: new Date(Date.now() + 3).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'It started about a week ago after installing some new software.',
					user: {
						name: (parsedAttributes?.name ?? '') + ' (Customer)',
					},
					createdAt: new Date(Date.now() + 4).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'Can you tell me which applications specifically are causing the freezing?',
					user: {
						name: user?.user_metadata.full_name + ' (Agent)',
					},
					createdAt: new Date(Date.now() + 5).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'Mainly Microsoft Word and Chrome. Sometimes Excel too.',
					user: {
						name: (parsedAttributes?.name ?? '') + ' (Customer)',
					},
					createdAt: new Date(Date.now() + 6).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'How much free disk space do you have on your computer?',
					user: {
						name: user?.user_metadata.full_name + ' (Agent)',
					},
					createdAt: new Date(Date.now() + 7).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'Let me check... I have about 10GB free.',
					user: {
						name: (parsedAttributes?.name ?? '') + ' (Customer)',
					},
					createdAt: new Date(Date.now() + 8).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content:
						"That's quite low. Low disk space can cause system slowdowns. Let's try clearing some space first.",
					user: {
						name: user?.user_metadata.full_name + ' (Agent)',
					},
					createdAt: new Date(Date.now() + 9).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'Okay, how do I do that?',
					user: {
						name: (parsedAttributes?.name ?? '') + ' (Customer)',
					},
					createdAt: new Date(Date.now() + 10).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'First, let\'s run Disk Cleanup. Press Windows+R, type "cleanmgr" and press Enter.',
					user: {
						name: user?.user_metadata.full_name + ' (Agent)',
					},
					createdAt: new Date(Date.now() + 11).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: "Done. It's scanning my drive now.",
					user: {
						name: (parsedAttributes?.name ?? '') + ' (Customer)',
					},
					createdAt: new Date(Date.now() + 12).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'Great. Once it finishes, check all the boxes and click OK to remove unnecessary files.',
					user: {
						name: user?.user_metadata.full_name + ' (Agent)',
					},
					createdAt: new Date(Date.now() + 13).toISOString(),
				},
				{
					id: crypto.randomUUID(),
					content: 'It says it can free up about 12GB of space. Should I proceed?',
					user: {
						name: (parsedAttributes?.name ?? '') + ' (Customer)',
					},
					createdAt: new Date(Date.now() + 14).toISOString(),
				},
			]}
			roomName={task!.sid!}
			username={user?.user_metadata.full_name + ' (Agent)'}
		/>
	);
};

export default ChatEngagement;
