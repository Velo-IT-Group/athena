import { cn } from '@/lib/utils';
import { ChatMessageItem } from '@/components/chat-message';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, File, X } from 'lucide-react';
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
	Message,
	MessageBuilder,
	UnsentMessage,
	type Participant,
} from '@twilio/conversations';
import Dropzone, {
	DropEvent,
	FileRejection,
	useDropzone,
} from 'react-dropzone';
import { FileWithPreview } from '@/hooks/use-supabase-upload';
import { formatBytes } from '@/components/dropzone';

interface RealtimeChatProps {
	roomName: string;
	username: string;
	onMessage?: (messages: Message[]) => void;
	onSubmit?: (message: UnsentMessage | undefined) => void;
	messages?: Message[];
	isConnected?: boolean;
	participants: Participant[];
	participantsTyping: Participant[];
	messageBuilder?: MessageBuilder;
	// typing: () => void;
}

/**
 * Realtime chat component
 * @param username - The username of the user
 * @param messages - The messages to display in the chat. Useful if you want to display messages from a database.
 * @returns The chat component
 */
export const RealtimeChat = ({
	username,
	onSubmit,
	isConnected,
	messages,
	participants,
	messageBuilder,
	participantsTyping,
	// typing,
}: RealtimeChatProps) => {
	const { containerRef, scrollToBottom } = useChatScroll();
	const formRef = useRef<HTMLFormElement>(null);
	const [newMessage, setNewMessage] = useState('');
	const [files, setFiles] = useState<FileWithPreview[]>([]);

	useEffect(() => {
		// Scroll to bottom whenever messages change
		scrollToBottom();
	}, [messages, scrollToBottom]);

	// Merge realtime messages with initial messages

	const allMessages = useMemo(() => messages, [messages]);

	const onDrop = useCallback(
		(acceptedFiles: File[], fileRejections: FileRejection[]) => {
			const validFiles = acceptedFiles
				.filter((file) => !files.find((x) => x.name === file.name))
				.map((file) => {
					(file as FileWithPreview).preview =
						URL.createObjectURL(file);
					(file as FileWithPreview).errors = [];
					return file as FileWithPreview;
				});

			const invalidFiles = fileRejections.map(({ file, errors }) => {
				(file as FileWithPreview).preview = URL.createObjectURL(file);
				(file as FileWithPreview).errors = errors;
				return file as FileWithPreview;
			});

			const newFiles = [...files, ...validFiles, ...invalidFiles];

			console.log(newFiles);
			acceptedFiles.forEach((file) => {
				messageBuilder?.addMedia({
					contentType: file.type,
					filename: file.name,
					media: file instanceof Blob ? file : new Blob([file]),
				});
			});

			setFiles(newFiles);
		},
		[files, setFiles]
	);

	const { getInputProps, isDragActive, inputRef } = useDropzone({
		onDrop,
		preventDropOnDocument: true,
	});

	const handleRemoveFile = useCallback(
		(fileName: string) => {
			setFiles(files.filter((file) => file.name !== fileName));
		},
		[files, setFiles]
	);

	return (
		<>
			<div
				ref={containerRef}
				className='flex-1 overflow-y-auto p-3 space-y-3'
				// {...getRootProps()}
			>
				{allMessages?.length === 0 ? (
					<div className='text-center text-sm text-muted-foreground'>
						No messages yet. Start the conversation!
					</div>
				) : null}
				<div className='space-y-1.'>
					{allMessages?.map((message, index) => {
						const prevMessage =
							index > 0 ? allMessages[index - 1] : null;
						const showHeader =
							!prevMessage ||
							prevMessage.author !== message.author;

						return (
							<div
								key={message.sid}
								className='animate-in fade-in slide-in-from-bottom-3 duration-300'
							>
								<ChatMessageItem
									message={message}
									isOwnMessage={message.author === username}
									showHeader={showHeader}
									participants={participants}
								/>
							</div>
						);
					})}
				</div>
			</div>

			{participantsTyping.map((p) => (
				<span
					key={p.sid}
					className='text-sm text-muted-foreground'
				>
					{p.identity} is typing...
				</span>
			))}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					setNewMessage('');
					onSubmit?.(messageBuilder?.build());
				}}
				ref={formRef}
				className='flex flex-col-reverse w-full gap-1.5 border-t border-border p-3 relative'
			>
				<Textarea
					className={cn(
						'rounded-lg bg-background text-sm transition-all duration-300 resize-none min-h-9 max-h-36 !h-auto'
						// isConnected && newMessage.trim() ? 'w-[calc(100%-36px)]' : 'w-full'
					)}
					// type='text'
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							formRef.current?.requestSubmit();
						} else {
							// typing();
						}
					}}
					name='message'
					value={newMessage}
					onChange={(e) => {
						messageBuilder?.setBody(e.target.value);
						setNewMessage(e.target.value);
					}}
					placeholder='Type a message...'
					disabled={!isConnected}
					minRows={2}
					maxRows={5}
					// ref={inputRef}
				/>

				<input
					type='file'
					{...getInputProps()}
					hidden
					className='hidden'
					ref={inputRef}
				/>

				{files.map((file, idx) => (
					<div
						key={`${file.name}-${idx}`}
						className='flex items-center gap-x-3 py-1.5 first:mt-3 last:mb-3 '
					>
						{file.type.startsWith('image/') ? (
							<div className='h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center'>
								<img
									src={file.preview}
									alt={file.name}
									className='object-cover'
								/>
							</div>
						) : (
							<div className='h-10 w-10 rounded border bg-muted flex items-center justify-center'>
								<File size={18} />
							</div>
						)}

						<div className='shrink grow flex flex-col items-start truncate'>
							<p
								title={file.name}
								className='text-sm truncate max-w-full'
							>
								{file.name}
							</p>
						</div>

						<Button
							size='icon'
							variant='link'
							className='shrink-0 justify-self-end text-muted-foreground hover:text-foreground'
							onClick={() => handleRemoveFile(file.name)}
						>
							<X />
						</Button>
					</div>
				))}

				<div className='absolute bottom-3 right-3 pb-1.5 pr-1.5 z-50'>
					<Button
						className='aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300'
						variant='ghost'
						type='button'
						size='icon'
						onClick={() => inputRef.current?.click()}
					>
						<Paperclip className='size-4' />
					</Button>

					<Button
						className='aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300'
						type='submit'
						size='icon'
						disabled={!newMessage.trim() && files.length === 0}
					>
						<Send className='size-4' />
					</Button>
				</div>
			</form>

			<div
				className={cn(
					'absolute bg-primary/15 top-0 h-full w-full p-3',
					isDragActive ? 'visible' : 'invisible'
				)}
			>
				<div className='w-full h-full border-4 border-dashed border-primary rounded-lg flex items-center justify-center text-primary'>
					Drop the files here ...
				</div>
			</div>
		</>
	);
};
