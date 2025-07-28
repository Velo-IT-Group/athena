import {
	createFileRoute,
	type UseNavigateResult,
} from '@tanstack/react-router';
import { Calendar, Phone, Voicemail } from 'lucide-react';
import { PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { columns } from '@/components/table-columns/engagement';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { Suspense } from 'react';
import {
	getEngagementsQuery,
	getEngagementSummaryByPeriodQuery,
} from '@/lib/supabase/api';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import { useSuspenseQuery } from '@tanstack/react-query';
import { filterSchema, paginationSchema, sortSchema } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export const Route = createFileRoute('/_authed/coordinator-view/')({
	component: RouteComponent,
	validateSearch: zodValidator(
		z.object({
			filter: filterSchema.optional(),
			sort: sortSchema.optional(),
			pagination: paginationSchema.optional(),
		})
	),
});

function RouteComponent() {
	const { filter, sort, pagination } = Route.useSearch();
	const navigate = Route.useNavigate();

	const startDate = filter?.find(
		(f) =>
			f.id === 'created_at' &&
			f.value.operator === 'greater_than_or_equal_to'
	)?.value?.values;
	const endDate = filter?.find(
		(f) =>
			f.id === 'created_at' &&
			f.value.operator === 'less_than_or_equal_to'
	)?.value?.values;
	const inSla = filter?.find((f) => f.id === 'within_sla_hours')?.value
		?.values;

	const call_date =
		startDate && endDate
			? [
					new Date(new Date(startDate).setHours(inSla ? 8 : 0)),
					inSla
						? new Date(new Date(startDate).setHours(inSla ? 17 : 0))
						: endOfDay(new Date(endDate)),
				]
			: undefined;

	const queryFilter: EngagementQueryOptions = { call_date };

	const { data: engagements } = useSuspenseQuery(
		getEngagementSummaryByPeriodQuery(queryFilter)
	);

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

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
	});

	return (
		<div className='space-y-3'>
			<section className='grid grid-cols-4 gap-3 mt-6'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Calls
						</CardTitle>

						<Phone className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3'>
						<div className='text-2xl font-bold'>{totalCalls}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Inbound Calls
						</CardTitle>

						<PhoneIncoming className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3 '>
						<div className='text-2xl font-bold'>
							{totalInboundCalls}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Outbound Calls
						</CardTitle>

						<PhoneOutgoing className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3'>
						<div className='text-2xl font-bold'>
							{totalOutboundCalls}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Voicemails Left
						</CardTitle>

						<Voicemail className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3'>
						<div className='text-2xl font-bold'>
							{totalVoicemails}
						</div>
					</CardContent>
				</Card>
			</section>

			<section>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant='outline'>
							<Calendar />
							{startDate &&
								!endDate &&
								`After ${dateFormatter.format(new Date(startDate))}`}
							{startDate &&
								endDate &&
								`${dateFormatter.formatRange(new Date(startDate), new Date(endDate))}`}
							{!startDate &&
								endDate &&
								`Before ${dateFormatter.format(new Date(endDate))}`}
							{!startDate && !endDate && 'Date'}
							{/* {startDate ? `After ${formatDate(new Date(startDate), 'MMM d, yyyy')}` : 'Date'} */}
						</Button>
					</PopoverTrigger>

					<PopoverContent
						align='start'
						className='w-[500px] p-0'
					>
						<DateRangeDisplay
							defaultValues={filter}
							navigate={navigate}
						/>
					</PopoverContent>
				</Popover>
			</section>

			<Suspense fallback={<TableSkeleton columns={columns.length} />}>
				<DataTable
					columns={columns}
					options={getEngagementsQuery(queryFilter, sort, pagination)}
				/>
			</Suspense>
		</div>
	);
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	endOfDay,
	endOfMonth,
	endOfWeek,
	startOfMonth,
	startOfWeek,
	startOfYesterday,
	subWeeks,
} from 'date-fns';
import { start } from 'repl';
import type { EngagementQueryOptions } from '@/lib/supabase/read';

const formSchema = z.object({
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	within_sla_hours: z.boolean(),
});

export default function DateRangeDisplay({
	defaultValues,
	navigate,
}: {
	defaultValues?: z.infer<typeof filterSchema>;
	navigate: UseNavigateResult<'/coordinator-view'>;
}) {
	const quickFilters = [
		{
			label: 'Today',
			start_date: new Date(),
			end_date: new Date(),
		},
		{
			label: 'Yesterday',
			start_date: startOfYesterday(),
			end_date: startOfYesterday(),
		},
		{
			label: 'This Week',
			start_date: startOfWeek(new Date()),
			end_date: endOfWeek(new Date()),
		},
		{
			label: 'Last Week',
			start_date: startOfWeek(subWeeks(new Date(), 1)),
			end_date: endOfWeek(subWeeks(new Date(), 1)),
		},
		{
			label: 'This Month',
			start_date: startOfMonth(new Date()),
			end_date: endOfMonth(new Date()),
		},
	];

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			start_date: defaultValues?.find(
				(f) =>
					f.id === 'created_at' &&
					f.value.operator === 'greater_than_or_equal_to'
			)?.value.values,
			end_date: defaultValues?.find(
				(f) =>
					f.id === 'created_at' &&
					f.value.operator === 'less_than_or_equal_to'
			)?.value.values,
			within_sla_hours:
				defaultValues?.find((f) => f.id === 'within_sla_hours')?.value
					.values ?? true,
		},
	});

	// defaultValues?.filter(f => f.id === 'created_at').map(f => f.value.values) ??

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		navigate({
			search: {
				filter: [
					values.start_date
						? {
								id: 'created_at',
								value: {
									values: new Date(values.start_date ?? ''),
									operator: 'greater_than_or_equal_to',
								},
							}
						: null,
					values.end_date
						? {
								id: 'created_at',
								value: {
									values: new Date(values.end_date ?? ''),
									operator: 'less_than_or_equal_to',
								},
							}
						: null,
				].filter(Boolean) as z.infer<typeof filterSchema>,
			},
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='grid grid-cols-[140px_1fr]'>
					<div className='border-r'>
						<h2 className='border-b p-3 text-sm font-semibold'>
							Date Range
						</h2>

						{quickFilters.map((filter) => {
							return (
								<Button
									key={filter.label}
									variant='ghost'
									className='w-full justify-start font-normal'
									type='button'
									onClick={() => {
										form.setValue(
											'start_date',
											filter.start_date?.toISOString()
										);
										form.setValue(
											'end_date',
											filter.end_date?.toISOString()
										);
										form.setValue(
											'within_sla_hours',
											form.getValues('within_sla_hours')
										);
									}}
								>
									{filter.label}
								</Button>
							);
						})}
					</div>

					<div className='py-6 px-3 space-y-6'>
						<FormField
							control={form.control}
							name='start_date'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='flex items-center justify-between'>
										<span>Start date</span>

										<Button
											variant='link'
											className='h-auto py-0'
											onClick={() =>
												form.setValue(
													'start_date',
													undefined
												)
											}
											type='button'
										>
											Clear
										</Button>
									</FormLabel>

									<FormControl>
										<Input
											className='w-full justify-between'
											type='date'
											placeholder='MM/DD/YYYY'
											{...field}
											value={
												field.value
													? new Date(field.value)
															.toISOString()
															.split('T')[0]
													: ''
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='end_date'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='flex items-center justify-between'>
										<span>End date</span>
										<Button
											variant='link'
											className='h-auto py-0'
											type='button'
											onClick={() =>
												form.setValue(
													'end_date',
													undefined
												)
											}
										>
											Clear
										</Button>
									</FormLabel>

									<FormControl>
										<Input
											className='w-full justify-between'
											type='date'
											placeholder='MM/DD/YYYY'
											{...field}
											value={
												field.value
													? new Date(field.value)
															.toISOString()
															.split('T')[0]
													: ''
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='within_sla_hours'
							render={({ field }) => (
								<FormItem className='flex flex-row items-center'>
									<FormLabel>Within SLA hours</FormLabel>

									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className='border-t p-3 flex items-center gap-3'>
					<Button
						variant='outline'
						type='button'
						onClick={() => {
							form.reset();
							form.handleSubmit(onSubmit)();
						}}
					>
						Clear
					</Button>

					<Button
						variant='outline'
						className='ml-auto'
						type='button'
					>
						Cancel
					</Button>

					<Button disabled={!form.formState.isValid}>Apply</Button>
				</div>
			</form>
		</Form>
	);
}
