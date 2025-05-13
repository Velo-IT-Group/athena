import { getWorkerStatsQuery } from '@/lib/twilio/api';
import { cn } from '@/lib/utils';
import type { ActivityDuration } from '@/types/twilio';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

type Props = {
	user: User;
	className?: string;
};

const HoursAvailableProgress = ({ user, className }: Props) => {
	const { data: timeEntries } = useQuery(getWorkerStatsQuery(user?.user_metadata.worker_sid ?? ''));

	const activities = timeEntries?.cumulative.activity_durations as ActivityDuration[];

	const availableSeconds = activities?.find((activity) => activity.friendly_name === 'Available')?.total ?? 0;

	const totalHours = Math.floor(availableSeconds / 60 / 60);

	const totalMinutes = Math.floor((availableSeconds / 60) % 60);

	return (
		<p className={cn('font-medium text-sm ml-4', className)}>
			Available Today: {totalHours}h {String(totalMinutes).padStart(2, '0')}m
		</p>
	);
};

export default HoursAvailableProgress;
