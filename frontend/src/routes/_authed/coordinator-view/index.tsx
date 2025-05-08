import { createFileRoute } from '@tanstack/react-router';
import { Phone, Voicemail } from 'lucide-react';
import { PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { columns } from '@/components/table-columns/engagement';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { Suspense } from 'react';
import { DataTable, dataTableFilterQuerySchema } from '@/components/ui/data-table';
import { getEngagementsQuery } from '@/lib/supabase/api';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getEngagementSummaryByPeriod } from '@/lib/supabase/read';

const coordinatorViewSearchParams = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

export const Route = createFileRoute('/_authed/coordinator-view/')({
	component: RouteComponent,
	validateSearch: zodValidator(z.object({ filter: dataTableFilterQuerySchema.optional() })),
});

function RouteComponent() {
	const { filter } = Route.useSearch();

	const queryFilter = { call_date: filter?.find((f) => f.id === 'created_at')?.value.values };

	const { data: engagements } = useSuspenseQuery({
		queryKey: ['engagements', 'call_summary_by_period', queryFilter],
		queryFn: () =>
			getEngagementSummaryByPeriod({
				data: queryFilter,
			}),
	});

	const totalCalls = engagements.reduce((acc, engagement) => {
		return acc + (engagement.total_engagements ?? 0);
	}, 0);

	const totalInboundCalls = engagements.reduce((acc, engagement) => {
		return acc + (engagement.inbound_engagements ?? 0);
	}, 0);

	const totalOutboundCalls = engagements.reduce((acc, engagement) => {
		return acc + (engagement.outbound_engagements ?? 0);
	}, 0);

	const totalVoicemails = engagements.reduce((acc, engagement) => {
		return acc + (engagement.voicemails ?? 0);
	}, 0);

	return (
		<div className='space-y-3'>
			<section className='grid grid-cols-4 gap-3 mt-6'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Calls</CardTitle>

						<Phone className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3'>
						<div className='text-2xl font-bold'>{totalCalls}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>Inbound Calls</CardTitle>

						<PhoneIncoming className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3 '>
						<div className='text-2xl font-bold'>{totalInboundCalls}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>Outbound Calls</CardTitle>

						<PhoneOutgoing className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3'>
						<div className='text-2xl font-bold'>{totalOutboundCalls}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>Voicemails Left</CardTitle>

						<Voicemail className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3'>
						<div className='text-2xl font-bold'>{totalVoicemails}</div>
					</CardContent>
				</Card>
			</section>

			<Suspense fallback={<TableSkeleton columns={columns.length} />}>
				<DataTable
					columns={columns}
					options={getEngagementsQuery(queryFilter)}
				/>
			</Suspense>
		</div>
	);
}
