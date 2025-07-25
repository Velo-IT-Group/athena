import ActivityListItem from '@/components/activity-list-item';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getActivitiesQuery } from '@/lib/twilio/api';
import { getActivities } from '@/lib/twilio/taskrouter/worker/helpers';
import { cn } from '@/lib/utils';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import type { ActivityInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/activity';

export const activityOrder = new Map();
activityOrder.set('Available', 1);
activityOrder.set('Unavailable', 2);
activityOrder.set('Break', 3);
activityOrder.set('On-Site', 4);
activityOrder.set('Offline', 5);

const ActivityList = ({
	currentActivityName,
	onSelect,
}: {
	currentActivityName?: string;
	onSelect?: (activity: ActivityInstance) => void;
}) => {
	const { data: activities } = useQuery(getActivitiesQuery());

	return (
		<Command>
			<CommandInput
				placeholder='Search activities...'
				className='h-9'
			/>

			<CommandList>
				<CommandEmpty>No activity found.</CommandEmpty>

				<CommandGroup>
					{activities
						?.sort((a, b) => activityOrder.get(a.friendlyName) - activityOrder.get(b.friendlyName))
						?.map((activity) => (
							<CommandItem
								key={activity.sid}
								value={activity.friendlyName}
								onSelect={() => onSelect?.(activity as ActivityInstance)}
							>
								<Check
									className={cn(
										'mr-1.5 opacity-0',
										currentActivityName === activity.friendlyName && 'opacity-100'
									)}
								/>
								<ActivityListItem activityName={activity.friendlyName} />
							</CommandItem>
						))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
};

export default ActivityList;
