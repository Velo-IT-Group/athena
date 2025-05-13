import { Card, CardContent } from '@/components/ui/card';
import { getEngagementsQuery } from '@/lib/supabase/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { formatDate } from 'date-fns';

type Props = {
	contactId: number;
	companyId: number;
};

const HistoryEngagmentTab = (props: Props) => {
	const { contactId, companyId } = props;

	const {
		data: { data: engagements },
	} = useSuspenseQuery(getEngagementsQuery({ contactId, companyId }));

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

					<Card className='w-full'>
						<CardContent className='flex items-start gap-6'>
							<time
								dateTime={engagement.created_at}
								className='flex-none px-0.5 text-xs text-muted-foreground'
							>
								{engagement.created_at && formatDate(new Date(engagement.created_at), 'hh:mm:ss b')}
							</time>

							<div>
								<h3 className='font-semibold'>Agent Outbound</h3>
								<p>Channel Type: {engagement.channel}</p>
								<p>Agent: {engagement.contact?.id}</p>
							</div>
						</CardContent>
					</Card>
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

export default HistoryEngagmentTab;
