import { Headset, MessageSquare, Phone } from 'lucide-react';

import { Link } from '@tanstack/react-router';

import Timer from '@/components/timer';

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

import { getDateOffset } from '@/utils/date';

import { useWorker } from '@/providers/worker-provider';
import useConversationClient from '@/hooks/use-conversation-client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Props {
	workerSid: string;
	className?: string;
	token: string;
}

const TaskList = ({ className, token }: Props) => {
	const { engagements } = useWorker();
	const { client } = useConversationClient(token);

	const { data: conversations, isLoading } = useQuery({
		queryKey: ['conversations'],
		queryFn: async () => {
			const paginator = await client?.getSubscribedConversations();
			const conversations = paginator?.items || [];

			const unreadData = await Promise.all(
				conversations.map(async (conv) => {
					const unread = await conv
						.getUnreadMessagesCount()
						.catch(() => null);
					return { conversation: conv, unreadCount: unread };
				})
			);

			return unreadData;
		},
		enabled: !!client && !!token,
	});

	// console.log(conversations);

	return (
		<SidebarGroup className={className}>
			<SidebarGroupLabel>Engagements</SidebarGroupLabel>

			<SidebarGroupContent>
				<SidebarMenu>
					{engagements?.map((engagement) => {
						const attributes =
							typeof engagement.task?.attributes === 'string'
								? (JSON.parse(
										engagement.task?.attributes
									) as Record<string, any>)
								: typeof engagement.task?.attributes ===
									  'object'
									? (engagement.task?.attributes as Record<
											string,
											any
										>)
									: undefined;

						return (
							<SidebarMenuItem key={engagement?.reservation?.sid}>
								<SidebarMenuButton
									className='h-auto relative'
									isActive
									tooltip={attributes?.name}
									asChild
								>
									<Link
										to='/engagements/$taskSid/$reservationSid'
										params={{
											taskSid:
												engagement?.task?.sid ?? '',
											reservationSid:
												engagement?.reservation?.sid ??
												'',
										}}
									>
										{engagement?.task
											?.taskChannelUniqueName ===
										'voice' ? (
											<Phone />
										) : (
											<>
												<MessageSquare />
												<p className='bg-red-400 text-xs text-white absolute -top-1 -right-1 rounded-full size-3 text-center'>
													{1}
												</p>
											</>
										)}
										<div className='w-full space-y-1.5'>
											<div className='flex items-center justify-between'>
												<div>
													<h5 className='line-clamp-1 text-base'>
														{attributes?.name}
													</h5>

													{engagement.reservation
														?.status ===
														'wrapping' && (
														<p className='text-sm text-muted-foreground'>
															Wrapping
														</p>
													)}
												</div>
												{/* <Timer
													stopwatchSettings={{
														offsetTimestamp:
															getDateOffset(
																engagement
																	?.reservation
																	?.dateCreated ??
																	new Date()
															),
													}}
												/> */}
											</div>
										</div>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};

export default TaskList;
