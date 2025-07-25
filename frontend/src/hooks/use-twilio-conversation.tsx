import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Client,
	Message,
	Participant,
	UnsentMessage,
	type Conversation,
} from '@twilio/conversations';
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import useConversationClient from '@/hooks/use-conversation-client';

interface Props {
	sid: string;
	token: string;
}

const useTwilioConversation = ({ sid, token }: Props) => {
	const [isConnected, setIsConnected] = useState(true);
	const { client, isConnected: isClientConnected } =
		useConversationClient(token);
	const [messages, setMessages] = useState<Message[]>([]);
	const [participantsTyping, setParticipantsTyping] = useState<Participant[]>(
		[]
	);

	const conversationData = useQuery({
		queryKey: ['conversations', sid],
		queryFn: () => client?.getConversationBySid(sid),
		enabled: !!sid && isClientConnected,
	});

	const { data: conversation } = conversationData;

	const { data: participants } = useQuery({
		queryKey: ['conversations', sid, 'participants'],
		queryFn: () => conversation?.getParticipants(),
		enabled: !!conversationData,
	});

	const { data } = useInfiniteQuery({
		queryKey: ['conversations', sid, 'messages'],
		queryFn: async ({ pageParam }) => {
			const l = await conversation?.setAllMessagesUnread();
			console.log(l);
			return await conversation?.getMessages();
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages, lastPageParam) => {
			if (!lastPage?.hasNextPage) {
				return undefined;
			}
			return lastPageParam + 1;
		},
		getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
			if (!firstPage?.hasPrevPage) {
				return undefined;
			}
			return firstPageParam - 1;
		},
		enabled: !!conversation,
	});

	useEffect(() => {
		if (!conversation) return;

		conversation.on('messageRemoved', (message) =>
			setMessages((current) =>
				current.filter((m) => m.sid !== message.sid)
			)
		);

		conversation.on('messageAdded', (message) =>
			setMessages((current) => [
				...current.filter((m) => m.sid !== message.sid),
				message,
			])
		);

		conversation.on('messageUpdated', ({ message }) =>
			setMessages((current) =>
				current.map((m) => (m.sid === message.sid ? message : m))
			)
		);

		conversation.on('typingStarted', (p) => {
			console.log('typing started', p);
			if (p.identity === 'nblack@velomethod.com') return; // Ignore own typing
			setParticipantsTyping((current) => [
				...current.filter((participant) => participant.sid !== p.sid),
				p,
			]);
		});

		conversation.on('typingEnded', (p) => {
			setParticipantsTyping((current) =>
				current.filter((participant) => participant.sid !== p.sid)
			);
		});

		// conversation.on('messageRemoved', ({ sid }) => setMessages((current) => current.filter((m) => m.sid !== sid)));
	}, [conversation, isConnected]);

	useEffect(() => {
		if (!data?.pages) return;

		const allMessages = data.pages.flatMap((page) => page?.items ?? []);
		setMessages(allMessages);
	}, [data]);

	const { mutate: sendMessage } = useMutation({
		mutationFn: async (message: UnsentMessage) => await message?.send(),
		// onSuccess: (data, variables) => {
		// 	const messages = queryClient.getQueryData<{
		// 		pagesParams: Array<number>;
		// 		pages: Array<{ hasLastPage: boolean; hasNextPage: boolean; items: Array<Message> }>;
		// 	}>(messagesQueryKey);

		// 	const lastPage = messages?.pages.pop()?.items ?? [];

		// 	const newMessage = new Message(
		// 		lastPage.length,
		// 		{
		// 			author: 'nblack@velomethod.com',
		// 			contentSid: '',
		// 			dateUpdated: new Date().toISOString(),
		// 			sid: '',
		// 			subject: '',
		// 			text: variables.body,
		// 		},
		// 		conversation!,
		// 		{ conversation: '', messages_receipts: '', self: '' },
		// 		// @ts-ignore
		// 		{},
		// 		// @ts-ignore
		// 		{}
		// 	);

		// 	queryClient.setQueryData(messagesQueryKey, (old: any) => {
		// 		const lastPage = old?.pages.pop()?.items ?? [];
		// 		return {
		// 			...old,
		// 			pages: [...old.pages, { items: [...lastPage, newMessage], hasNextPage: false, hasLastPage: false }],
		// 		};
		// 	});
		// },
		onError: (error) => {
			console.error(error.cause, error.message, error.name);
		},
	});

	const { mutate: leaveConversation } = useMutation({
		mutationFn: async () => await conversation?.leave(),
		onError: (error) => {
			console.error(error.cause, error.message, error.name);
		},
	});

	const savedMessage = useMemo(() => messages, [messages]);

	return {
		messages: savedMessage,
		conversation: conversationData,
		isConnected,
		sendMessage,
		participants,
		leaveConversation,
		participantsTyping,
	};
};

export default useTwilioConversation;
