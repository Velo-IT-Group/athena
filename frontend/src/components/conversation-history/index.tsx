import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ConversationItem from './conversation-item';
import { Activity } from 'lucide-react';
import FullConversationHistory from './full-history';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getConversations } from '@/lib/supabase/read';
import { getConversationsQuery, getProfilesQuery } from '@/lib/supabase/api';
import { getCompanyContactsQuery } from '@/lib/manage/api';

type Props = {
	contactId?: number;
	companyId: number;
};

const ConversationHistory = ({ contactId, companyId }: Props) => {
	const [
		{ data: profiles },
		{
			data: { data: contacts },
		},
		{ data: conversations },
	] = useSuspenseQueries({
		queries: [
			getProfilesQuery(),
			getCompanyContactsQuery(companyId),
			getConversationsQuery({ contactId, companyId }),
		],
	});

	return (
		<Sheet>
			<Card className='flex flex-col'>
				<CardHeader>
					<CardTitle>
						<Activity className='inline-block mr-1.5' /> Activity Log
					</CardTitle>
				</CardHeader>

				<CardContent className='h-full'>
					{conversations && conversations.length ? (
						<ul className='space-y-6'>
							{conversations?.map((c) => (
								<ConversationItem
									key={c.id}
									conversation={c}
									contacts={contacts}
									profiles={profiles ?? []}
								/>
							))}
						</ul>
					) : (
						<div className='grid place-items-center font-medium text-muted-foreground p-[1ch] h-full'>
							<Activity className='size-7' />
							<p>No Recent Activity</p>
						</div>
					)}
				</CardContent>

				{conversations && conversations.length > 6 && (
					<CardFooter>
						<SheetTrigger asChild>
							<Button
								variant='link'
								size='sm'
							>
								View All
							</Button>
						</SheetTrigger>
					</CardFooter>
				)}
			</Card>

			<SheetContent className='overflow-y-scroll sm:max-w-md'>
				<SheetTitle>All Activity</SheetTitle>

				<FullConversationHistory
					companyId={companyId}
					contactId={contactId}
				/>
			</SheetContent>
		</Sheet>
	);
};

export default ConversationHistory;
