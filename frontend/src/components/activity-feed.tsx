import ActivityItem, { ActivityItemProps } from '@/components/activity-item';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSuspenseQueries } from '@tanstack/react-query';
import NoteItem from '@/components/note-item';
import { getTicketNotesQuery } from '@/lib/manage/api';

export default function ActivityFeed({ id }: { id: number }) {
	const [{ data: notes }] = useSuspenseQueries({
		queries: [getTicketNotesQuery(id)],
	});

	console.log(notes);

	const discussionNotes = notes?.filter((note) => note.detailDescriptionFlag && !note.detailDescriptionFlag);
	const internalNotes = notes?.filter((note) => note.internalAnalysisFlag);
	const resolutionNotes = notes?.filter((note) => note.resolutionFlag);

	return (
		<div className='space-y-3 border-t'>
			<Accordion type='multiple'>
				<AccordionItem value='notes'>
					<AccordionTrigger className='flex items-center justify-between'>
						<h4 className='font-medium text-sm'>Notes</h4>
					</AccordionTrigger>

					<AccordionContent>
						<Tabs defaultValue='all'>
							<TabsList>
								<TabsTrigger value='all'>All ({notes?.length})</TabsTrigger>
								<TabsTrigger value='discussion'>Discussion ({discussionNotes?.length})</TabsTrigger>
								<TabsTrigger value='internal'>Internal ({internalNotes?.length})</TabsTrigger>
								<TabsTrigger value='resolution'>Resolution ({resolutionNotes?.length})</TabsTrigger>
							</TabsList>

							<TabsContent
								value='all'
								className='space-y-3'
							>
								{notes?.map((note) => (
									<NoteItem
										key={note.id}
										note={note}
									/>
								))}
							</TabsContent>

							<TabsContent
								value='discussion'
								className='space-y-3'
							>
								{discussionNotes?.map((note) => (
									<NoteItem
										key={note.id}
										note={note}
									/>
								))}
							</TabsContent>

							<TabsContent
								value='internal'
								className='space-y-3'
							>
								{internalNotes?.map((note) => (
									<NoteItem
										key={note.id}
										note={note}
									/>
								))}
							</TabsContent>

							<TabsContent
								value='resolution'
								className='space-y-3'
							>
								{resolutionNotes?.map((note) => (
									<NoteItem
										key={note.id}
										note={note}
									/>
								))}
							</TabsContent>
						</Tabs>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

type ActivityProps = {
	activities: ActivityItemProps[];
};

export const ActivityList = ({ activities }: ActivityProps) => {
	return (
		<div className='relative'>
			<Separator
				orientation='vertical'
				className='absolute top-0 bottom-3 left-[18px] -z-10'
			/>

			<ul className='space-y-6'>
				{activities?.map((activity) => (
					<ActivityItem
						key={activity.text}
						icon={activity.icon}
						text={activity.text}
						date={activity.date}
						source={activity.source}
					/>
				))}
			</ul>

			{/* <div className="space-y-3 flex flex-col">
                {activities?.map((activity) => (
                    <ActivityItem
                        key={activity.text}
                        icon={activity.icon}
                        text={activity.text}
                        date={activity.date}
                    />
                ))}
            </div> */}
		</div>
	);
};
