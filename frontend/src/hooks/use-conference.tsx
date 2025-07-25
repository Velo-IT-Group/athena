import { getConferenceParticipantsQuery } from '@/lib/twilio/api';
import { updateParticipant as updateParticipantMutation } from '@/lib/twilio/update';
import { createParticipant } from '@/lib/twilio/create';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
	ParticipantContextUpdateOptions,
	ParticipantInstance,
	ParticipantListInstanceCreateOptions,
} from 'twilio/lib/rest/api/v2010/account/conference/participant';
import { toast } from 'sonner';
import { deleteParticipant } from '@/lib/twilio/delete';

interface Props {
	sid?: string;
}

export const useConference = ({ sid }: Props) => {
	const query = getConferenceParticipantsQuery(sid ?? '');
	const { queryKey } = query;
	const queryClient = useQueryClient();

	const participantsQuery = useQuery({ ...query, enabled: !!sid });

	const handleParticipantUpdate = useMutation({
		mutationFn: ({
			participantSid,
			options,
		}: {
			participantSid: string;
			options: ParticipantContextUpdateOptions;
		}) =>
			updateParticipantMutation({
				data: { sid, participantSid, options },
			}),
		onMutate: async ({ participantSid, options }) => {
			let newItems: ParticipantInstance[] = [];
			const previousItems =
				queryClient.getQueryData<ParticipantInstance[]>(queryKey) ?? [];

			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			const updatedItem = previousItems?.find(
				(item) => item.callSid === participantSid
			);

			const newItemTest = { ...updatedItem, ...options };

			newItems = [
				...previousItems.filter(
					(item) => item.callSid !== participantSid
				),
				newItemTest as ParticipantInstance,
			];

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItems);

			/// Returning context for optimistic updates
			return { previousItems, newItems };
		},
		onError: (error, variables, context) => {
			console.error(error);
			queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSuccess: (x, y, z) => {
			queryClient.invalidateQueries(query);
		},
	});

	const handleParticipantCreation = useMutation({
		mutationFn: ({
			options,
		}: {
			options: ParticipantListInstanceCreateOptions;
		}) =>
			createParticipant({
				data: { sid, options },
			}),
		onMutate: async ({ options }) => {
			console.log(options);
			let newItems: ParticipantInstance[] = [];
			const previousItems =
				queryClient.getQueryData<ParticipantInstance[]>(queryKey) ?? [];

			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			newItems = [
				...previousItems,
				options as unknown as ParticipantInstance,
			];

			console.log(newItems);

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItems);

			/// Returning context for optimistic updates
			return { previousItems, newItems };
		},
		onError: (error, variables, context) => {
			console.error(error);
			toast.error(error.message);
			queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSuccess: (x, y, z) => {
			queryClient.invalidateQueries(query);
		},
	});

	const handleParticipantRemoval = useMutation({
		mutationFn: ({ participantSid }: { participantSid: string }) =>
			deleteParticipant({
				data: { sid, participantSid },
			}),
		onMutate: async ({ participantSid }) => {
			console.log(participantSid);
			const newItems: ParticipantInstance[] = [];
			const previousItems =
				queryClient.getQueryData<ParticipantInstance[]>(queryKey) ?? [];

			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Optimistically update to the new value
			queryClient.setQueryData(
				queryKey,
				previousItems.filter((item) => item.callSid !== participantSid)
			);

			/// Returning context for optimistic updates
			return { previousItems, newItems };
		},
		onError: (error, variables, context) => {
			console.error(error);
			toast.error(error.message);
			queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSuccess: (x, y, z) => {
			queryClient.invalidateQueries(query);
		},
	});

	return {
		participantsQuery,
		handleParticipantUpdate,
		handleParticipantCreation,
		handleParticipantRemoval,
	};
};
