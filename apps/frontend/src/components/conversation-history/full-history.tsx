import { getContacts } from '@/lib/manage/read';
import ConversationItem from './conversation-item';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getConversations, getProfiles } from '@/lib/supabase/read';
import { getCompanyContactsQuery, getContactsQuery } from '@/lib/manage/api';
import { getConversationsQuery, getProfilesQuery } from '@/lib/supabase/api';

interface Props {
	contactId?: number;
	companyId: number;
}

const FullConversationHistory = ({ contactId, companyId }: Props) => {
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
			getConversationsQuery({ contactId, companyId, limit: 1000 }),
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
