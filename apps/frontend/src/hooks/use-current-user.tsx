import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useCurrentUser = () => {
	const { data } = useQuery({
		queryKey: ['current-user'],
		queryFn: async () => {
			const { data, error } = await createClient().auth.getSession();
			if (error) {
				throw new Error(error.message);
			}

			return data.session?.user;
		},
	});

	return { user: data };
};
