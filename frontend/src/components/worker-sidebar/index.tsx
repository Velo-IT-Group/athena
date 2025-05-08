import { ComponentProps } from 'react';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import QueueStatus from '@/components/worker-sidebar/queue-status';
import TaskList from '@/components/worker-sidebar/task-list';
import ActivityList from '@/components/worker-sidebar/activity-list';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { getActivities } from '@/lib/twilio/taskrouter/worker/helpers';
import { getSafeSession } from '@/lib/supabase/server';
import type { ActivityInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/activity';
import HoursAvailableProgress from '@/components/hours-available-progress';
import { getActivitiesQuery } from '@/lib/twilio/api';

const WorkerSidebar = ({ token, ...props }: ComponentProps<typeof Sidebar> & { token: string }) => {
	const [{ data: activities }, { data: user }] = useSuspenseQueries({
		queries: [
			getActivitiesQuery(),
			{
				queryKey: ['user'],
				queryFn: async () => {
					const { user } = await getSafeSession();

					return user;
				},
			},
		],
	});

	return (
		<Sidebar
			collapsible='none'
			defaultValue='open'
			className='sticky top-0 border-l h-svh flex-shrink-0'
			{...props}
		>
			<SidebarHeader>
				<QueueStatus token={token} />
			</SidebarHeader>

			<SidebarContent>
				{/* <TaskList isCollapsed={false} /> */}

				<ActivityList
					token={token}
					activities={activities as ActivityInstance[]}
				/>

				<HoursAvailableProgress user={user!} />
			</SidebarContent>
		</Sidebar>
	);
};

export default WorkerSidebar;
