import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getEngagementsQuery } from '@/lib/supabase/api';
import { getTranscriptSentencesQuery } from '@/lib/twilio/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { formatDate } from 'date-fns';
import { Icon, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { Suspense } from 'react';

interface Props {
	contactId: number;
	companyId: number;
}

const HistoryEngagmentTab = (props: Props) => {
	const { contactId, companyId } = props;

	const {
		data: { data: engagements },
	} = useSuspenseQuery(getEngagementsQuery({ contactId, companyId }, { direction: 'desc', field: 'created_at' }));

	console.log(engagements);

	return (
		<div className='space-y-3'>
			<h2 className='text-2xl font-semibold'>History</h2>
			{engagements?.map((engagement) => (
				<li
					key={engagement.id}
					className='relative flex gap-3 group mt-3 first:mt-0'
				>
					<div className='absolute top-0 -bottom-6 left-0 flex w-6 justify-center'>
						<div className='w-[1px] group-last:hidden bg-muted-foreground' />
					</div>

					<div className='relative flex size-6 flex-none items-center justify-center bg-background'>
						<div className='size-1.5 rounded-full bg-muted-foreground'>{/* {item.contact?.id} */}</div>
					</div>

					<Collapsible>
						<Card className='w-full'>
							<CollapsibleTrigger disabled={!engagement.transcription_sid}>
								<CardHeader>
									<CardTitle>
										{engagement.is_inbound ? 'Inbound' : 'Outbound'} {engagement.id}
									</CardTitle>
								</CardHeader>
							</CollapsibleTrigger>

							{engagement.transcription_sid && (
								<CollapsibleContent>
									<Suspense fallback={<div>Loading...</div>}>
										<TranscriptDisplay id={engagement.transcription_sid} />
									</Suspense>
								</CollapsibleContent>
							)}

							{/* <CardContent className='flex items-start gap-6'>
								<time
									dateTime={engagement.created_at}
									className='flex-none px-0.5 text-xs text-muted-foreground'
								>
									{engagement.created_at && formatDate(new Date(engagement.created_at), 'hh:mm:ss b')}
								</time>

								<div>
									<h3 className='font-semibold'>
										<DynamicIcon
											name={
												engagement.channel === 'voice'
													? engagement.is_inbound
														? 'phone-incoming'
														: 'phone-outgoing'
													: 'message-circle'
											}
											className='inline-block mr-1.5'
										/>

										{engagement.is_inbound ? 'Inbound' : 'Outbound'}
									</h3>
									<p>
										Agent:{' '}
										<pre>
											{JSON.stringify(
												engagement.reservations.find(
													(r) => r.reservation_status === 'completed'
												),
												null,
												2
											)}
										</pre>
									</p>
								</div>
							</CardContent> */}
						</Card>
					</Collapsible>
					<p className='flex-auto py-0.5 text-xs text-muted-foreground leading-5'></p>
					{/* <span className='text-foreground font-medium'>{user}</span>

										{isVoicemail ? (
											<span> left a voicemail</span>
										) : (
											<span>
												{' '}
												talked to <span className='text-foreground font-medium'>
													{agent}
												</span>{' '}
												for {minutes}m {seconds}s
											</span>
										)}
									</p>
									<time
										dateTime={conversation.date}
										className='flex-none px-0.5 text-xs text-muted-foreground'
									>
										{conversation.date && relativeDate(new Date(conversation.date))} */}
					{/* </time> */}
				</li>
			))}
		</div>
	);
};

const TranscriptDisplay = ({ id }: { id: string }) => {
	const {
		data: { sentences, summary },
	} = useSuspenseQuery(getTranscriptSentencesQuery(id));

	return (
		<div>
			<h3 className='text-sm font-medium'>Summary</h3>
			<p>{JSON.stringify(summary, null, 2) ?? 'No summary available'}</p>

			<h3 className='text-sm font-medium'>Sentences</h3>
			{sentences.map((sentence) => (
				<div key={sentence.sid}>
					<p>{sentence.transcript}</p>
				</div>
			))}
		</div>
	);
};

export default HistoryEngagmentTab;
