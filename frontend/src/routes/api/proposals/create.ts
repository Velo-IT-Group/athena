import { createClient } from '@/lib/supabase/server';
import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';

export const APIRoute = createAPIFileRoute('/api/proposals/create')({
	POST: async ({ request, params }) => {
		const supabase = createClient();
		const blankRows = new Array(1000).fill(null);

		const insertedProposal: ProposalInsert[] = blankRows.map((row) => ({
			name: `Proposal ${row}`,
			company: { id: 19297, identifier: 'XYZ', name: 'XYZ Test Company' },
			contact: { id: 6845, name: 'Mike Jones' },
			// labor_rate: 250,
		}));

		console.log(insertedProposal);

		return json(await supabase.from('proposals').insert(insertedProposal));
	},
});
