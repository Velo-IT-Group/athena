import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Call } from '@twilio/voice-sdk';
import { toast } from 'sonner';
import type {
	ParticipantContextUpdateOptions,
	ParticipantInstance,
	ParticipantListInstanceCreateOptions,
} from 'twilio/lib/rest/api/v2010/account/conference/participant';
import { getConferenceParticipantsQuery } from '@/lib/twilio/api';
import { createParticipant } from '@/lib/twilio/create';
import { deleteParticipant } from '@/lib/twilio/delete';
import { updateParticipant as updateParticipantMutation } from '@/lib/twilio/update';

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
				data: { sid: sid ?? '', participantSid, options },
			}),
		onMutate: async ({ participantSid, options }) => {
			let newItems: ParticipantInstance[] = [];
			const previousItems =
				queryClient.getQueryData<ParticipantInstance[]>(queryKey) ?? [];

			console.log(previousItems);

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

			console.log(newItems);

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItems);

			/// Returning context for optimistic updates
			return { previousItems, newItems };
		},
		onError: (error, variables, context) => {
			console.error(error);
			queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
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
			let newItems: ParticipantInstance[] = [];
			const previousItems =
				queryClient.getQueryData<ParticipantInstance[]>(queryKey) ?? [];

			console.log(previousItems);

			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			newItems = [
				...previousItems,
				{
					label: options.label ?? '',
					hold: false,
					callSid: '',
				} as ParticipantInstance,
			];

			console.log(newItems);

			// Optimistically update to the new value
			console.log(queryClient.setQueryData(queryKey, newItems));

			/// Returning context for optimistic updates
			return { previousItems, newItems };
			// let newItems: ParticipantInstance[] = [];
			// const previousItems =
			// 	queryClient.getQueryData<ParticipantInstance[]>(queryKey) ?? [];

			// // Cancel any outgoing refetches
			// // (so they don't overwrite our optimistic update)
			// await queryClient.cancelQueries({
			// 	queryKey,
			// });

			// newItems = [
			// 	...previousItems,
			// 	{
			// 		label: options.label ?? '',
			// 		callSid: '',
			// 		hold: false,
			// 	} as unknown as ParticipantInstance,
			// ];

			// console.log(newItems);

			// // Optimistically update to the new value
			// queryClient.setQueryData(queryKey, newItems);

			// /// Returning context for optimistic updates
			// return { previousItems, newItems };
		},
		onError: (error, variables, context) => {
			console.error(error);
			toast.error(error.message);
			queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSettled: async (d, e, v, context) => {
			await queryClient.invalidateQueries({
				queryKey,
			});
			queryClient.setQueryData(queryKey, context?.newItems);
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
