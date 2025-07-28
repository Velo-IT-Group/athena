import ManageUserAvatar from '@/components/avatar/manage-user-avatar';
import Logo from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ZoomableImage from '@/components/zoomable-image';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import type { Message, Participant } from '@twilio/conversations';
import { RefreshCcw } from 'lucide-react';
import { useMemo } from 'react';

interface ChatMessageItemProps {
	message: Message;
	participants: Participant[];
	isOwnMessage: boolean;
	showHeader: boolean;
}

export const ChatMessageItem = ({
	message,
	participants,
	isOwnMessage,
	showHeader,
}: ChatMessageItemProps) => {
	const isVelo = /^CH[0-9a-fA-F]{32}$/.test(message.author ?? '');
	const messageAttributes = message.attributes as unknown as Record<
		string,
		string
	>;
	const media = message.attachedMedia;

	const fullParticipant = useMemo(
		() => participants.find((p) => p.sid === message.participantSid),
		[participants, message.participantSid]
	);

	console.log(participants, fullParticipant);

	const {
		data: mediaUrls,
		isLoading: isMediaLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ['messages', message.sid, 'media'],
		queryFn: async () => {
			// Return a (possibly empty) array of media matching a specific set of categories. Allowed category is so far only 'media'
			const categorizedMedia = message.getMediaByCategories(['media']);

			if (!categorizedMedia?.length) return [];

			//Get a temporary URL for the first media returned by the previous method
			return await Promise.all(
				categorizedMedia.map((c) =>
					c?.getContentTemporaryUrl() === null
						? ''
						: c.getContentTemporaryUrl()
				)
			);
		},
		enabled: media !== null && media.length > 0,
	});

	console.log(participants);

	return (
		<div className='grid grid-cols-[32px_1fr] gap-3 text-lg'>
			{showHeader ? (
				<>
					{(fullParticipant?.attributes as Record<string, any>)
						?.memberId ||
					(fullParticipant?.attributes as Record<string, any>)
						?.contactId ? (
						<ManageUserAvatar
							memberId={Number(
								(
									fullParticipant?.attributes as Record<
										string,
										any
									>
								)?.memberId
							)}
							contactId={Number(
								(
									fullParticipant?.attributes as Record<
										string,
										any
									>
								)?.contactId
							)}
						/>
					) : (
						<Avatar>
							<AvatarImage src='/nick.jpeg' />
							<AvatarFallback>
								<Logo className='size-6' />
							</AvatarFallback>
						</Avatar>
					)}
				</>
			) : (
				<div></div>
			)}

			{isMediaLoading ? (
				<Skeleton className='w-full max-w-1/3 aspect-square' />
			) : (
				<>
					{mediaUrls?.length ? (
						<div>
							{mediaUrls.map((m) => (
								<>
									{m ? (
										<ZoomableImage
											src={m}
											alt='Attached media'
											className='max-h-48 max-w-full rounded-lg object-cover'
										/>
									) : (
										<div className='aspect-square relative'>
											<img
												src='/placeholder.png'
												alt='Placeholder'
												className='max-h-48 max-w-full rounded-lg'
											/>

											<Button onClick={() => refetch()}>
												<RefreshCcw
													className={
														isRefetching
															? 'animate-spin'
															: ''
													}
												/>
											</Button>
										</div>
									)}
								</>
							))}
						</div>
					) : null}
				</>
			)}

			<div
				className={`flex text-lg mt- ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
			>
				<div className='w-full flex flex-col gap-1.5'>
					{showHeader && (
						<div className='flex items-center gap-1.5 text-base'>
							<span
								className={
									'font-semibold font-poppins text-base'
								}
							>
								{isVelo
									? 'Velo Bot'
									: (
											fullParticipant?.attributes as Record<
												string,
												any
											>
										)?.name}{' '}
								{isOwnMessage ? '(Me)' : ''}
							</span>

							<span className='text-muted-foreground text-xs'>
								{new Date(
									message.dateCreated?.toISOString() ?? ''
								).toLocaleTimeString('en-US', {
									hour: '2-digit',
									minute: '2-digit',
									hour12: true,
								})}
							</span>
						</div>
					)}

					<div className='w-full text-base hover:bg-muted p-1.5 -ml-1.5 rounded transition-colors duration-300'>
						{message.body}
					</div>
				</div>
			</div>
		</div>
	);
};
