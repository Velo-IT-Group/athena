import { getTaskReservationQuery, getTaskReservationsQuery } from '@/lib/twilio/api';
import { updateTaskReservation } from '@/lib/twilio/update';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { ReservationContextUpdateOptions } from 'twilio/lib/rest/taskrouter/v1/workspace/task/reservation';

interface Props {
	taskSid: string;
	reservationSid: string;
}

const useReservations = ({ taskSid, reservationSid }: Props) => {
	const queryClient = useQueryClient();
	const query = getTaskReservationQuery(taskSid, reservationSid);
	const { queryKey } = query;
	const data = useQuery(query);

	const handleReservationUpdate = useMutation({
		mutationFn: (options: ReservationContextUpdateOptions) =>
			updateTaskReservation({ data: { taskSid, reservationSid, options } }),
		// onMutate: (options) => {
		// 	queryClient.setQueryData(queryKey, (old) => {
		// 		return {
		// 			...old,
		// 			...options,
		// 		};
		// 	});
		// },
		onError: (error) => {
			queryClient.setQueryData(queryKey, (old) => {
				return old;
			});
		},
		onSuccess: (data) => {
			queryClient.setQueryData(queryKey, data);
			queryClient.invalidateQueries({ queryKey });
			queryClient.invalidateQueries({ queryKey: ['reservations'] });
		},
	});

	return {
		...data,
		handleReservationUpdate,
	};
};

export default useReservations;
