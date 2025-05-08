import { Fragment } from 'react';
import ActivityItem from './activity-item';
import useSyncMap from '@/hooks/use-sync-map';
import { getActivities } from '@/lib/twilio/taskrouter/worker/helpers';
import { useQuery } from '@tanstack/react-query';
import type { ActivityInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/activity';

const ActivityList = ({ token, activities }: { token: string; activities: ActivityInstance[] }) => {
	// const { data: activities } = useQuery({
	// 	queryKey: ['activities'],
	// 	queryFn: getActivities,
	// });

	const order = new Map();
	order.set('Available', 1);
	order.set('Unavailable', 2);
	order.set('Break', 3);
	order.set('On-Site', 4);
	order.set('Offline', 5);

	const { items: conversations } = useSyncMap({
		token,
		mapKey: 'SyncTaskRouterTasks',
	});
	const { items: workers } = useSyncMap({
		token,
		mapKey: 'SyncTaskRouterWorkers',
	});

	return (
		<Fragment>
			{activities
				?.sort((a, b) => order.get(a.friendlyName) - order.get(b.friendlyName))
				.map((a) => (
					<ActivityItem
						key={a.sid}
						activity={a as ActivityInstance}
						token={token}
						conversations={conversations}
						workers={workers}
					/>
				))}
		</Fragment>
	);
};

export default ActivityList;
