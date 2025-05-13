'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTicket, duplicateTicket } from '@/lib/supabase/create';

import { updateTicket } from '@/lib/supabase/update';
import { deleteTicket } from '@/lib/supabase/delete';
import { getPhasesQuery, getProposalTotalsQuery, getSectionsQuery, getTicketsQuery } from '@/lib/supabase/api';
import { useCallback } from 'react';

type Props = {
	proposalId: string;
	versionId: string;
	phaseId: string;
	initialData: NestedTicket[];
};

export const useTicket = ({ proposalId, versionId, phaseId, initialData }: Props) => {
	const queryClient = useQueryClient();
	const query = getTicketsQuery(phaseId);
	const { queryKey } = query;

	const { data } = useQuery(query);

	const updateProposalTotals = useCallback(
		(phases: NestedPhase[]) => {
			const previousTotals = queryClient.getQueryData<ProposalTotals>(
				getProposalTotalsQuery(proposalId, versionId).queryKey
			);

			if (!previousTotals) return;

			const laborCost = phases.reduce((acc, p) => acc + (p.hours ?? 0) * (previousTotals.labor_rate ?? 0), 0);

			const newTotals: ProposalTotals = {
				...previousTotals,
				labor_cost: laborCost,
				total_price:
					(previousTotals.non_recurring_product_total ?? 0) +
					(previousTotals.recurring_total ?? 0) +
					(previousTotals.non_recurring_product_total ?? 0) +
					laborCost,
			};

			queryClient.setQueryData(getProposalTotalsQuery(proposalId, versionId).queryKey, newTotals);
		},
		[phaseId, proposalId, versionId]
	);

	const updatePhaseHours = useCallback(
		(newTicket: NestedTicket) => {
			const phases = queryClient.getQueryData<NestedPhase[]>(getPhasesQuery(proposalId, versionId).queryKey);
			const phase = phases?.find((p) => p.id === phaseId);
			const previousTickets = phase?.tickets;
			const updatedTickets = [...(previousTickets?.filter((t) => t.id !== newTicket.id) ?? []), newTicket];

			if (!phase) return;

			const updatePhase: NestedPhase = {
				...phase,
				hours: updatedTickets.reduce((acc, t) => acc + (t.budget_hours ?? 0), 0),
			};

			const updatedPhases = phases?.map((p) => (p.id === phaseId ? updatePhase : p));

			if (!updatedPhases) return;

			updateProposalTotals(updatedPhases);

			queryClient.setQueryData(getPhasesQuery(proposalId, versionId).queryKey, updatedPhases);
		},
		[phaseId, proposalId, versionId]
	);

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

			if (!updatedItem) return;

			const newItem: NestedTicket = { ...updatedItem, ...ticket };

			const newItems = [...previousItems.filter((s) => s.id !== id), newItem];

			// console.log(previousItems, newItem, newItems)

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItems);

			console.log(newItem);

			updatePhaseHours(newItem);

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
				queryKey,
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
				queryKey,
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
				queryKey,
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
