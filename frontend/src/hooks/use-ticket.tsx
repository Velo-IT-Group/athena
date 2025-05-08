'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTicket, duplicateTicket } from '@/lib/supabase/create';

import { getTickets } from '@/lib/supabase/read';
import { updateTicket } from '@/lib/supabase/update';
import { deleteTicket } from '@/lib/supabase/delete';

type Props = {
	phaseId: string;
	initialData: NestedTicket[];
};

export const useTicket = ({ phaseId, initialData }: Props) => {
	const queryClient = useQueryClient();
	const queryKey = ['phases', phaseId];

	const { data } = useQuery({
		queryKey,
		queryFn: () => getTickets(phaseId),
		initialData,
	});

	const { mutate: handleTicketUpdate } = useMutation({
		mutationFn: async ({ id, ticket }: { id: string; ticket: TicketUpdate }) =>
			await updateTicket({ data: { id, ticket } }),
		onMutate: async ({ id, ticket }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousItems = queryClient.getQueryData<NestedTicket[]>(queryKey) ?? [];
			const updatedItem = previousItems?.find((s) => s.id === id);

			console.log(previousItems);

			const newItem = { ...updatedItem, ...ticket };

			const newItems = [...previousItems.filter((s) => s.id !== id), newItem];

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
				queryKey: queryKey,
			});
		},
	});

	const { mutate: handleTicketInsert } = useMutation({
		mutationFn: async ({ ticket, tasks }: { ticket: TicketInsert; tasks: Array<TaskInsert> }) =>
			await createTicket({ data: { ticket, tasks } }),
		onMutate: async ({ ticket, tasks }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousPhases = queryClient.getQueryData<NestedTicket[]>(queryKey) ?? [];

			// @ts-ignore
			const updatedSect: NestedTicket = { ...ticket, tasks };

			const newPhases = [...previousPhases, updatedSect];

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newPhases);

			// Return a context with the previous and new phases
			return { previousPhases, newPhases };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			queryClient.setQueryData(queryKey, context?.previousPhases);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKey,
			});
		},
	});

	const { mutate: handleTicketDeletion } = useMutation({
		mutationFn: async ({ id }: { id: string }) => await deleteTicket({ data: id }),
		onMutate: async ({ id }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousPhases = queryClient.getQueryData<NestedPhase[]>(queryKey) ?? [];

			const newPhases = [...previousPhases.filter((s) => s.id !== id)];

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newPhases);

			// Return a context with the previous and new phases
			return { previousPhases, newPhases };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			queryClient.setQueryData(queryKey, context?.previousPhases || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKey,
			});
		},
	});

	const { mutate: handleTicketDuplication } = useMutation({
		mutationFn: async ({ id }: { id: string }) => await duplicateTicket({ data: id }),
		onMutate: async ({ id }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousPhases = queryClient.getQueryData<NestedTicket[]>(queryKey) ?? [];
			const item = previousPhases.find((s) => s.id === id);

			const newPhases = [
				...previousPhases.filter((s) => s.id !== id),
				{
					...item,
					id: crypto.randomUUID(),
					order: previousPhases.length + 1,
					tasks: item?.tasks?.map((t) => ({ ...t, id: crypto.randomUUID() })),
				},
			];

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newPhases);

			// Return a context with the previous and new phases
			return { previousPhases, newPhases };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			queryClient.setQueryData(queryKey, context?.previousPhases || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: queryKey,
			});
		},
	});

	return {
		data,
		handleTicketUpdate,
		handleTicketInsert,
		handleTicketDeletion,
		handleTicketDuplication,
	};
};
