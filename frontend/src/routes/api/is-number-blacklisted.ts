// import supabase from '@/utils/supabase';
// import { createClient } from '@/utils/twilio';
import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';

export const APIRoute = createAPIFileRoute('/api/is-number-blacklisted')({
	GET: async (props) => {
		console.log(props);
		const from = props;
		// if (!from) {
		// 	return json(
		// 		{
		// 			error: 'No phone number found',
		// 		},
		// 		{ status: 400, statusText: 'No phone number found' }
		// 	);
		// }

		// const client = await createClient();
		// const { phoneNumber } = await client.lookups.v2.phoneNumbers(from).fetch();

		// const { data: phoneNumbers } = await supabase
		// 	.schema('taskrouter')
		// 	.from('blacklisted_phone_numbers')
		// 	.select('*')
		// 	.eq('number', phoneNumber);

		// return json({ isBlacklisted: phoneNumbers && phoneNumbers.length > 0 }, { status: 200 });
		return new Response('Hello, World! from ' + request.url);
	},
});
