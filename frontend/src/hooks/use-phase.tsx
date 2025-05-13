import { getPhasesQuery } from '@/lib/supabase/api';
import { createPhase, newTemplate } from '@/lib/supabase/create';
import { deletePhase } from '@/lib/supabase/delete';
import { getPhases } from '@/lib/supabase/read';
import { updatePhase } from '@/lib/supabase/update';
import { updateArrayQueryCache } from '@/lib/utils';
import type { ProjectTemplate } from '@/types/manage';
import { createNestedPhaseFromTemplate } from '@/utils/helpers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type Props = {
	params: { id: string; version: string };
	initialData?: NestedPhase[];
};

export const usePhase = ({ params, initialData }: Props) => {
	const queryClient = useQueryClient();

	const { id, version } = params;
	const query = getPhasesQuery(id, version);
	const { queryKey } = query;

	const { data } = useQuery({ ...query, initialData });

	const { mutate: handlePhaseUpdate } = useMutation({
		mutationFn: async ({ id, phase }: { id: string; phase: PhaseUpdate }) =>
			await updatePhase({ data: { id, phase } }),
		onMutate: async ({ id, phase }) =>
			updateArrayQueryCache(queryClient, queryKey, phase, (item) => item.id === id),
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

	const { mutate: handlePhaseInsert } = useMutation({
		mutationFn: async ({
			newPhase,
			tickets,
		}: {
			newPhase: PhaseInsert;
			tickets: Array<TicketInsert>;
			tasks?: Array<TaskInsert>;
		}) => {
			return await createPhase({ data: { phase: newPhase, tickets } });
		},
		onMutate: async ({ newPhase, tickets }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousItems = queryClient.getQueryData<NestedPhase[]>(queryKey) ?? [];
			const updatedSection = previousItems?.find((s) => s.id === id);

			const updatedSect: NestedPhase = {
				...updatedSection,
				...newPhase,
				// @ts-expect-error types are not correct
				tickets,
			};

			const newPhases = [...previousItems.filter((s) => s.id !== id), updatedSect];

			console.log(newPhases);

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newPhases);

			// Return a context with the previous and new phases
			return { previousPhases: previousItems, newPhases };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			console.error(err);
			toast.error('Error creating phase ' + err.message);
			queryClient.setQueryData(queryKey, context?.previousPhases || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handlePhaseDeletion } = useMutation({
		mutationFn: async ({ id }: { id: string }) => await deletePhase({ data: id }),
		onMutate: async ({ id }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousPhases = queryClient.getQueryData<NestedPhase[]>(queryKey) ?? [];

			const newPhases = [...previousPhases.filter((s) => s.id !== id)];

			console.log(newPhases);

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newPhases);

			// Return a context with the previous and new phases
			return { previousPhases, newPhases };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			toast.error('Error deleting phase ' + err.message);
			queryClient.setQueryData(queryKey, context?.previousPhases || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleTemplateDrop } = useMutation({
		mutationFn: async ({
			template,
			destinationIndex = 0,
			version,
		}: {
			template: ProjectTemplate;
			destinationIndex: number;
			version: string;
		}) => await newTemplate({ data: { template, order: destinationIndex, version } }),
		onMutate: async ({ template, destinationIndex, version }) => {
			const { workplan } = template;

			if (!workplan) throw new Error('No workplan found');
			const previousItems = queryClient.getQueryData<NestedPhase[]>(queryKey);
			console.log(createNestedPhaseFromTemplate(workplan, version, destinationIndex), previousItems);

			return updateArrayQueryCache(
				queryClient,
				queryKey,
				createNestedPhaseFromTemplate(workplan, version, destinationIndex)
			);

			// // Cancel any outgoing refetches
			// // (so they don't overwrite our optimistic update)
			// await queryClient.cancelQueries({
			// 	queryKey,
			// });

			// // Snapshot the previous value
			// const previousPhases = queryClient.getQueryData<NestedPhase[]>(queryKey) ?? [];

			// // const updatedItem = previousPhases?.find((s) => s.id === id)

			// const createdPhases = createNestedPhaseFromTemplate(workplan, version, destinationIndex);
			// const slicedPhases = previousPhases ? [...previousPhases.slice(destinationIndex)] : [];
			// slicedPhases.forEach((phase, index) => (phase.order = createdPhases.length + destinationIndex + index + 1));
			// console.log(createdPhases, slicedPhases);

			// const newPhases = [...previousPhases.slice(0, destinationIndex), ...createdPhases, ...slicedPhases];

			// // Optimistically update to the new value
			// // queryClient.setQueryData(queryKey, newPhases);

			// // Return a context with the previous and new phases
			// return { previousPhases, newPhases };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			console.error(err);
			// queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	return {
		data,
		handlePhaseUpdate,
		handlePhaseInsert,
		handlePhaseDeletion,
		handleTemplateDrop,
	};
};
