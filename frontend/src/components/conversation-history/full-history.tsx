import { getContacts } from '@/lib/manage/read';
import ConversationItem from './conversation-item';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getConversations, getProfiles } from '@/lib/supabase/read';

type Props = {
	contactId?: number;
	companyId: number;
};

const FullConversationHistory = ({ contactId, companyId }: Props) => {
	const [
		{ data: profiles },
		{
			data: { data: contacts },
		},
		{ data: conversations },
	] = useSuspenseQueries({
		queries: [
			{
				queryKey: ['profiles'],
				queryFn: getProfiles,
			},
			{
				queryKey: ['companies', companyId, 'contacts'],
				queryFn: () =>
					getContacts({
						data: {
							conditions: {
								'company/id': companyId,
							},
							orderBy: {
								key: 'firstName',
							},
							pageSize: 1000,
							fields: ['id', 'firstName', 'lastName'],
						},
					}),
			},
			{
				queryKey: ['companies', companyId, 'conversations'],
				queryFn: () => getConversations({ data: { contactId, companyId, limit: 1000 } }),
			},
		],
	});

	return (
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
	);
};

export default FullConversationHistory;
