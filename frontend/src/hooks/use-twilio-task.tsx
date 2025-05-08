import { updateTask } from '@/lib/twilio/taskrouter/task/update';
import { useMutation } from '@tanstack/react-query';
import type { TaskContextUpdateOptions } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { type Task } from 'twilio-taskrouter';

type Props = {
	sid: string;
	initialData?: Task;
};

const useEngagement = ({ sid, initialData }: Props) => {
	const queryKey = ['twilio-tasks', sid];

	// const { data: task } = useQuery({
	// 	queryKey,
	// 	queryFn: () => getTask({ data: { sid } }),
	// 	initialData,
	// });

	const { mutate: handleTaskUpdate } = useMutation({
		mutationFn: ({ params }: { params: TaskContextUpdateOptions }) => updateTask({ data: { sid, params } }),
	});

	return { task: initialData as Task, handleTaskUpdate };
};

export default useEngagement;
