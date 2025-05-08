import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Conditions } from '@/utils/manage/params';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

type MetricProps<TData> = {
	label: string;
	value?: number | string;
	params?: Conditions<TData>;
	queryFn?: (conditions?: Conditions<TData>) => Promise<{
		count: number;
	}>;
};

const numberFormatter = new Intl.NumberFormat('en-US');

const Metric = <TData,>({ label, value, params, queryFn }: MetricProps<TData>) => {
	const { data: fn, isLoading } = useSuspenseQuery({
		queryKey: [params ?? label],
		queryFn: async ({ queryKey }) =>
			// @ts-ignore
			await queryFn?.({ ...(queryKey?.[0] ?? {}) }),
	});

	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 p-3'>
				<CardTitle className='text-sm font-medium truncate'>{label}</CardTitle>
			</CardHeader>

			<CardContent className='pb-3 px-3'>
				{isLoading ? (
					<Skeleton className='w-1/4 h-8' />
				) : (
					<div className='text-2xl font-bold'>
						{fn?.count && numberFormatter.format(fn.count)}

						{!!!fn?.count && typeof value === 'number'
							? numberFormatter.format(fn?.count ?? value ?? 0)
							: value}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
export default Metric;
