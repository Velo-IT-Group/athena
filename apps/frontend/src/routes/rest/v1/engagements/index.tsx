import { createFileRoute } from '@tanstack/react-router';
import { createServerFileRoute } from '@tanstack/react-start/server';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/utils';

type ReturnType<T> = {
	// The single "page" data to be rendered
	data: T[];
	// The timestamp to be used for the next page on _load more_
	nextCursor?: number | null;
	// The timestamp to be used for the previous page on _live mode_
	prevCursor?: number | null;
};

export const ServerRoute = createServerFileRoute(
	'/rest/v1/engagements/'
).methods({
	GET: async ({ request }) => {
		const supabase = createClient();
		const searchParams = new URL(request.url).searchParams;
		const cursor = searchParams.get('cursor');
		const direction = searchParams.get('direction');

		// Live mode
		if (direction === 'prev') {
			const prevCursor = new Date();
			const test = supabase
				.schema('reporting')
				.from('engagements')
				.select('*, reservations:engagement_reservations(*)')
				.gt('created_at', cursor ? cursor : prevCursor.toISOString())
				.lte('created_at', prevCursor.toISOString())
				.eq('workspace', env.VITE_TWILIO_WORKSPACE_SID)
				.order('created_at', { ascending: false })
				.throwOnError();

			const res: ReturnType<NestedEngagement> = {
				data,
				prevCursor,
				nextCursor: null,
			};
			return Response.json(res);
			// Load more
		} else {
			const { data } = await supabase
				.schema('reporting')
				.from('engagements')
				.select('*, reservations:engagement_reservations(*)')
				.lt('created_at', cursor ? cursor : new Date().toISOString())
				.order('created_at', { ascending: false })
				.limit(40)
				.throwOnError();

			const nextCursor =
				data.length > 0 ? data[data.length - 1].created_at : null;

			const res: ReturnType<NestedEngagement> = {
				data,
				nextCursor,
				prevCursor: null,
			};
			return Response.json(res);
		}
	},
});
