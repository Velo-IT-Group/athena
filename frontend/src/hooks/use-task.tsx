import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTask, duplicateTicket } from '@/lib/supabase/create';
import { deleteTask } from '@/lib/supabase/delete';
import { updateTask } from '@/lib/supabase/update';
import { getTasksQuery } from '@/lib/supabase/api';
import { getTaskQuery } from '@/lib/twilio/api';

interface Props {
	ticketId: string;
	initialData: Task[];
}

const useTask = ({ ticketId, initialData }: Props) => {
	const queryClient = useQueryClient();
	const query = getTasksQuery(ticketId);
	const { queryKey } = query;

	const { data } = useQuery({
		...query,
		initialData,
	});

	const { mutate: handleTaskUpdate } = useMutation({
		mutationFn: async ({ id, task }: { id: string; task: TaskUpdate }) =>
			await updateTask({ data: { id, task } }),
		onMutate: async ({ id, task }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousItems =
				queryClient.getQueryData<Task[]>(queryKey) ?? [];
			const updatedItem = previousItems?.find((s) => s.id === id);

			const newItem = { ...updatedItem, ...task };

			const newItems = [
				...previousItems.filter((s) => s.id !== id),
				newItem,
			];

			// console.log(previousItems, newItem, newItems)

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItems);

			// Return a context with the previous and new phases
			return { previousItems, newItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			queryClient.setQueryData(queryKey, context?.previousItems || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleTaskInsert } = useMutation({
		mutationFn: async ({ task }: { task: TaskInsert }) =>
			await createTask({ data: task }),
		onMutate: async ({ task }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousItems =
				queryClient.getQueryData<Task[]>(queryKey) ?? [];

			const newItems = [...previousItems, task];

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItems);

			// Return a context with the previous and new phases
			return { previousItems, newItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleTaskDeletion } = useMutation({
		mutationFn: async ({ id }: { id: string }) =>
			await deleteTask({ data: id }),
		onMutate: async ({ id }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousItems =
				queryClient.getQueryData<Task[]>(queryKey) ?? [];

			const newItems = [...previousItems.filter((s) => s.id !== id)];

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItems);

			// Return a context with the previous and new items
			return { previousItems, newItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTask, context) => {
			queryClient.setQueryData(queryKey, context?.previousItems || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleTaskDuplication } = useMutation({
		mutationFn: async ({ id }: { id: string }) =>
			await duplicateTicket({ data: id }),
		onMutate: async ({ id }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousItems =
				queryClient.getQueryData<Task[]>(queryKey) ?? [];
			const item = previousItems.find((s) => s.id === id);

			const newItems = [
				...previousItems.filter((s) => s.id !== id),
				{
					...item,
					id: useId(),
					order: previousItems.length + 1,
				},
			];

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItems);

			// Return a context with the previous and new items
			return { previousItems, newItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTask, context) => {
			queryClient.setQueryData(queryKey, context?.previousItems || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	return {
		data,
		handleTaskUpdate,
		handleTaskInsert,
		handleTaskDeletion,
		handleTaskDuplication,
	};
};

import type { TaskContextUpdateOptions } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { updateTask as updateTwilioTask } from '@/lib/twilio/update';
import { useId } from 'react';

export const useTwilioTask = (taskSid: string) => {
	const queryClient = useQueryClient();
	const query = getTaskQuery(taskSid);
	const { queryKey } = query;

	const data = useQuery(query);

	const handleTaskUpdate = useMutation({
		mutationFn: (options: TaskContextUpdateOptions) =>
			updateTwilioTask({ data: { taskSid, options } }),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			// queryClient.setQueryData(queryKey, context?.previousItems || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['tasks'],
			});
		},
	});

	// const { mutate: handleTaskInsert } = useMutation({
	// 	mutationFn: async ({ task }: { task: TaskInsert }) => await createTask({ data: task }),
	// 	onMutate: async ({ task }) => {
	// 		// Cancel any outgoing refetches
	// 		// (so they don't overwrite our optimistic update)
	// 		await queryClient.cancelQueries({
	// 			queryKey,
	// 		});

	// 		// Snapshot the previous value
	// 		const previousItems = queryClient.getQueryData<Task[]>(queryKey) ?? [];

	// 		const newItems = [...previousItems, task];

	// 		// Optimistically update to the new value
	// 		queryClient.setQueryData(queryKey, newItems);

	// 		// Return a context with the previous and new phases
	// 		return { previousItems, newItems };
	// 	},
	// 	// If the mutation fails,
	// 	// use the context returned from onMutate to roll back
	// 	onError: (err, newPhase, context) => {
	// 		queryClient.setQueryData(queryKey, context?.previousItems);
	// 	},
	// 	onSettled: async () => {
	// 		await queryClient.invalidateQueries({
	// 			queryKey,
	// 		});
	// 	},
	// });

	// const { mutate: handleTaskDeletion } = useMutation({
	// 	mutationFn: async ({ id }: { id: string }) => await deleteTask({ data: id }),
	// 	onMutate: async ({ id }) => {
	// 		// Cancel any outgoing refetches
	// 		// (so they don't overwrite our optimistic update)
	// 		await queryClient.cancelQueries({
	// 			queryKey,
	// 		});

	// 		// Snapshot the previous value
	// 		const previousItems = queryClient.getQueryData<Task[]>(queryKey) ?? [];

	// 		const newItems = [...previousItems.filter((s) => s.id !== id)];

	// 		// Optimistically update to the new value
	// 		queryClient.setQueryData(queryKey, newItems);

	// 		// Return a context with the previous and new items
	// 		return { previousItems, newItems };
	// 	},
	// 	// If the mutation fails,
	// 	// use the context returned from onMutate to roll back
	// 	onError: (err, newTask, context) => {
	// 		queryClient.setQueryData(queryKey, context?.previousItems || []);
	// 	},
	// 	onSettled: async () => {
	// 		await queryClient.invalidateQueries({
	// 			queryKey,
	// 		});
	// 	},
	// });

	// const { mutate: handleTaskDuplication } = useMutation({
	// 	mutationFn: async ({ id }: { id: string }) => await duplicateTicket({ data: id }),
	// 	onMutate: async ({ id }) => {
	// 		// Cancel any outgoing refetches
	// 		// (so they don't overwrite our optimistic update)
	// 		await queryClient.cancelQueries({
	// 			queryKey,
	// 		});

	// 		// Snapshot the previous value
	// 		const previousItems = queryClient.getQueryData<Task[]>(queryKey) ?? [];
	// 		const item = previousItems.find((s) => s.id === id);

	// 		const newItems = [
	// 			...previousItems.filter((s) => s.id !== id),
	// 			{
	// 				...item,
	// 				id: crypto.randomUUID(),
	// 				order: previousItems.length + 1,
	// 			},
	// 		];

	// 		// Optimistically update to the new value
	// 		queryClient.setQueryData(queryKey, newItems);

	// 		// Return a context with the previous and new items
	// 		return { previousItems, newItems };
	// 	},
	// 	// If the mutation fails,
	// 	// use the context returned from onMutate to roll back
	// 	onError: (err, newTask, context) => {
	// 		queryClient.setQueryData(queryKey, context?.previousItems || []);
	// 	},
	// 	onSettled: async () => {
	// 		await queryClient.invalidateQueries({
	// 			queryKey,
	// 		});
	// 	},
	// });

	return {
		...data,
		handleTaskUpdate,
		// handleTaskInsert,
		// handleTaskDeletion,
		// handleTaskDuplication,
	};
};

export default useTask;
