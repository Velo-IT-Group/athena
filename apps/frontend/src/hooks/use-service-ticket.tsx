import { getTicketQuery } from '@/lib/manage/api';
import { updateTicket } from '@/lib/manage/update';
import type { PatchOperation } from '@/types';
import type { ServiceTicket } from '@/types/manage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Props {
	id: number;
	initialData?: ServiceTicket;
}

const useServiceTicket = ({ id, initialData }: Props) => {
	const queryClient = useQueryClient();
	const query = getTicketQuery(id);
	const { queryKey } = query;

	const { data } = useQuery({
		...query,
		initialData,
	});

	const { mutate: handleTicketUpdate } = useMutation({
		mutationFn: async ({ operation }: { operation: PatchOperation<ServiceTicket>[] }) =>
			await updateTicket({ data: { id, operation } }),
		onMutate: async ({ operation }) => {
			const previousItem = queryClient.getQueryData<ServiceTicket>(queryKey);

			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey,
			});

			// Create a deep copy of the data to avoid mutating the original
			const newItem = JSON.parse(JSON.stringify(data));

			operation.forEach((op) => {
				// Split the path and remove empty strings
				const objectPath = op.path.split('/').filter((segment) => segment !== '');

				// Special case for board/id update - update the entire board object
				if (objectPath.length === 2 && objectPath[0] === 'board' && objectPath[1] === 'id') {
					// Find the board with the matching id and replace the entire board object
					// const newBoard = BOARDS_LIST.find((board) => board.id === op.value);
					// if (newBoard) {
					// 	newItem.board = newBoard;
					// }
				} else {
					// Handle normal path updates
					let current = newItem;

					// Navigate to the parent object
					for (let i = 0; i < objectPath.length - 1; i++) {
						if (!current[objectPath[i]]) {
							current[objectPath[i]] = {};
						}
						current = current[objectPath[i]];
					}

					// Set the value at the final path segment
					const lastSegment = objectPath[objectPath.length - 1];

					// Apply the value based on operation type
					if (op.op === 'replace' || !op.op) {
						current[lastSegment] = op.value;
					} else if (op.op === 'add') {
						if (Array.isArray(current[lastSegment])) {
							current[lastSegment].push(op.value);
						} else {
							current[lastSegment] = op.value;
						}
					} else if (op.op === 'remove') {
						if (Array.isArray(current[lastSegment])) {
							current[lastSegment] = current[lastSegment].filter((item) => item.id !== op.value);
						} else {
							delete current[lastSegment];
						}
					}
				}
			});

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItem);

			// Returning context for optimistic updates
			return { previousItem, newItem };
		},
		onError: (err, newPhase, context) => {
			toast.error('Error updating ticket' + ' ' + err.message);
			queryClient.setQueryData(queryKey, context?.previousItem || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});

			toast.success('Ticket updated');
		},
	});

	return { data, handleTicketUpdate };
};

export default useServiceTicket;
