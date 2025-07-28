import { useQuery } from '@tanstack/react-query';
import { getWorkerReservationQuery } from '@/lib/twilio/api';

interface Props {
	workerSid: string;
	reservationSid: string;
}

const useEngagement = ({ workerSid, reservationSid }: Props) => {
	console.log(workerSid, reservationSid);
	const query = getWorkerReservationQuery(workerSid, reservationSid);
	const { queryKey } = query;

	const data = useQuery(query);

	console.log(data);

	return { ...data };
};

export default useEngagement;
