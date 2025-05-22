import { useCallback } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTicket, duplicateTicket } from '@/lib/supabase/create';

import { updateTicket } from '@/lib/supabase/update';
import { deleteTicket } from '@/lib/supabase/delete';

import { getPhasesQuery, getProposalTotalsQuery, getTicketsQuery } from '@/lib/supabase/api';

import { addCacheItem, deleteCacheItem, updateArrayCacheItem } from '@/lib/utils';

type Props = {
	proposalId: string;
	versionId: string;
	phaseId: string;
	initialData: NestedTicket[];
};

export const useTicket = ({ proposalId, versionId, phaseId, initialData }: Props) => {
	const queryClient = useQueryClient();
	const phasesQuery = getPhasesQuery(proposalId, versionId);

	const query = getTicketsQuery(phaseId);
	const { queryKey } = query;

	const { data } = useQuery({ ...query, enabled: !!phaseId });

	const updateProposalTotals = (phases: NestedPhase[]) => {
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
	};

	const updatePhaseHours = (updatedTickets: NestedTicket[]) => {
		const phases = queryClient.getQueryData<NestedPhase[]>(phasesQuery.queryKey);
		const phase = phases?.find((p) => p.id === phaseId);
		// const previousTickets = phase?.tickets;
		// const updatedTickets = [...(previousTickets?.filter((t) => t.id !== newTicket.id) ?? []), newTicket];

		if (!phase) return;

		const updatePhase: NestedPhase = {
			...phase,
			hours: updatedTickets.reduce((acc, t) => acc + (t.budget_hours ?? 0), 0),
		};

		const updatedPhases = phases?.map((p) => (p.id === phaseId ? updatePhase : p));

		if (!updatedPhases) return;

		updateProposalTotals(updatedPhases);

		queryClient.setQueryData(phasesQuery.queryKey, updatedPhases);
	};

	const { mutate: handleTicketUpdate } = useMutation({
		mutationFn: async ({ id, ticket }: { id: string; ticket: TicketUpdate }) =>
			await updateTicket({ data: { id, ticket } }),
		onMutate: async ({ id, ticket }) => {
			const cachedData = await updateArrayCacheItem<NestedTicket>(
				queryClient,
				queryKey,
				ticket,
				(item) => item.id === id
			);

			updatePhaseHours(cachedData.newItems);

			return cachedData;
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => queryClient.setQueryData(queryKey, context?.previousItems! ?? []),
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleTicketInsert } = useMutation({
		mutationFn: async ({ ticket, tasks }: { ticket: TicketInsert; tasks: Array<TaskInsert> }) =>
			await createTicket({ data: { ticket, tasks } }),
		onMutate: async ({ ticket, tasks }) =>
			// @ts-ignore
			await addCacheItem<NestedTicket>(queryClient, queryKey, { ...ticket, tasks }),
		onError: (err, newPhase, context) => {
			queryClient.setQueryData(queryKey, context?.previousItems || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleTicketDeletion } = useMutation({
		mutationFn: async ({ id }: { id: string }) => await deleteTicket({ data: id }),
		onMutate: async ({ id }) =>
			await deleteCacheItem<NestedTicket>(queryClient, queryKey, (item) => item.id === id),
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

	const { mutate: handleTicketDuplication } = useMutation({
		mutationFn: async ({ id }: { id: string }) => await duplicateTicket({ data: id }),
		onMutate: async ({ id }) => {
			const previousTickets = queryClient.getQueryData<NestedTicket[]>(queryKey) ?? [];
			const item = previousTickets.find((s) => s.id === id);
			return await addCacheItem(queryClient, queryKey, {
				...item,
				id: crypto.randomUUID(),
				order: item?.order ?? 0,
				budget_hours: item?.budget_hours ?? 0,
				created_at: item?.created_at ?? new Date().toISOString(),
				phase: item?.phase ?? '',
				reference_id: item?.reference_id ?? null,
				summary: item?.summary ?? '',
				visible: item?.visible === undefined ? true : item?.visible,
			});
		},
		// 	// Cancel any outgoing refetches
		// 	// (so they don't overwrite our optimistic update)
		// 	await queryClient.cancelQueries({
		// 		queryKey,
		// 	});

		// 	// Snapshot the previous value
		// 	const previousPhases = queryClient.getQueryData<NestedTicket[]>(queryKey) ?? [];
		// 	const item = previousPhases.find((s) => s.id === id);

		// 	console.log(item);

		// 	const newPhases = [
		// 		...previousPhases,
		// 		{
		// 			...item,
		// 			id: crypto.randomUUID(),
		// 			order: previousPhases.length + 1,
		// 			tasks: item?.tasks?.map((t) => ({ ...t, id: crypto.randomUUID() })),
		// 		},
		// 	];

		// 	console.log(newPhases);

		// 	// Optimistically update to the new value
		// 	queryClient.setQueryData(queryKey, newPhases);

		// 	// Return a context with the previous and new phases
		// 	return { previousPhases, newPhases };
		// },
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			queryClient.setQueryData(queryKey, context?.previousItems ?? ([] as NestedTicket[]));
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
