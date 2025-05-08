import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { relativeDate } from '@/utils/date';
import { ServiceTicketNote } from '@/types/manage';
import Tiptap from '@/components/tip-tap';

type Props = {
	note: ServiceTicketNote;
};

const NoteItem = ({ note }: Props) => {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-start gap-1.5 p-3 space-y-0 group'>
				<CardTitle className='text-sm flex items-center gap-1.5'>
					<Avatar className='size-5'>
						<AvatarFallback className='text-[9px] uppercase'>
							{note.member ? (
								<>
									{note?.member.name.split(' ')?.[0]?.[0] && note?.member.name.split(' ')?.[0]?.[0]}
									{note?.member.name.split(' ')?.[1]?.[0] && note?.member.name.split(' ')?.[1]?.[0]}
								</>
							) : (
								<>
									{note?.contact?.name.split(' ')?.[0]?.[0] &&
										note?.contact.name.split(' ')?.[0]?.[0]}
									{note?.contact?.name.split(' ')?.[1]?.[0] &&
										note?.contact.name.split(' ')?.[1]?.[0]}
								</>
							)}
						</AvatarFallback>
					</Avatar>

					<span>{note?.member?.name ?? note.contact?.name ?? 'Unknown'}</span>
				</CardTitle>

				<CardDescription className='text-xs'>
					{relativeDate(note?._info?.dateEntered ? new Date(note?._info.dateEntered) : new Date())}
				</CardDescription>
			</CardHeader>

			<CardContent className='p-3'>
				<Tiptap
					content={note.text}
					className='border-none shadow-none resize-none pointer-events-none markdown-editor'
					editable={false}
				/>
			</CardContent>
		</Card>
	);
};

export default NoteItem;
