'use client';
import NumberFlow from '@number-flow/react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { formatDate } from 'date-fns';
import {
	Calendar1,
	CalendarMinus,
	CalendarPlus,
	Voicemail,
} from 'lucide-react';
import Metric from '@/components/metric-tracker-header/metric';
import { getTicketsCountQuery, getTicketsQuery } from '@/lib/manage/api';
import { getEngagementSummaryByPeriodQuery } from '@/lib/supabase/api';
import { createClient } from '@/lib/supabase/client';

const MetricTrackerHeader = () => {
	const now = new Date();
	const today = new Date(
		Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)
	);
	const todayStartString = today.toISOString();

	const [
		{ data, error },
		{ data: ticketCount, error: ticketCountError },
		{ data: handle_time_by_day, error: handleTimeError },
		{ data: voicemails_by_day, error: voicemailsError },
	] = useQueries({
		queries: [
			getTicketsQuery({
				conditions: {
					dateEntered: {
						value: ` [${todayStartString}]`,
						comparison: '>',
					},
					'board/id': 31,
					parentTicketId: null,
				},
				fields: [
					// @ts-ignore
					'respondMinutes',
					'respondedSkippedMinutes',
				],
			}),
			getTicketsQuery({
				conditions: {
					closedFlag: true,
					closedDate: {
						value: ` [${todayStartString}]`,
						comparison: '>',
					},
					dateEntered: {
						value: ` [${todayStartString}]`,
						comparison: '>',
					},
					'board/id': 31,
					parentTicketId: null,
				},
			}),
			{
				queryKey: ['handle_time_by_day', today],
				queryFn: async () => {
					const supabase = createClient();
					const date = formatDate(today, 'yyyy-MM-dd');
					const { data, error } = await supabase
						.schema('reporting')
						.from('handle_time_by_day_test')
						.select()
						.eq('conversation_date', date)
						.maybeSingle();

					if (error) {
						console.error(error);
						throw new Error(error.message);
					}

					return data;
				},
				retry: false,
			},
			{
				queryKey: ['voicemails_left_by_day', todayStartString],
				queryFn: async () => {
					const supabase = createClient();
					const { error, count } = await supabase
						.schema('reporting')
						.from('engagements')
						.select('id', { count: 'exact' })
						.eq('is_voicemail', true)
						.gte('created_at', todayStartString)
						.is('follow_up_engagement_id', null);

					if (error) {
						console.error(error);
						throw new Error(error.message);
					}

					return count;
				},
				retry: false,
			},
		],
	});

	const tickets = data?.data;
	const ticketsEnteredToday = data?.count;
	const sameDayCloseAmount = ticketCount?.count;

	const totalMinutes = tickets?.reduce(
		(acc, ticket) =>
			acc +
			(ticket.respondMinutes ?? 0) +
			(ticket.respondedSkippedMinutes ?? 0),
		0
	);

	const averageTimeToAnswerInMinutes =
		(totalMinutes ?? 0) / (ticketsEnteredToday ?? 0);
	const averageTimeToAnswerInHours = averageTimeToAnswerInMinutes / 60;

	const queryClient = useQueryClient();

	return (
		<section
			className='grid gap-2'
			style={
				{
					'--gap': '0.5rem',
					'--max-columns': 3,
					'--gap-count': 'calc(var(--max-columns) - 1)',
					'--total-gap-width': 'calc(var(--gap-count) * var(--gap))',
					'--grid-item-min-width': '168px',
					'--grid-item-max-width':
						'calc((100% - var(--total-gap-width)) / var(--max-columns))',
					gridTemplateColumns:
						'repeat(auto-fill, minmax(max(var(--grid-item-min-width), var(--grid-item-max-width)), 1fr))',
				} as React.CSSProperties
			}
		>
			{/* <Widget /> */}

			<Metric
				label='Opened Today'
				renderOption={(value) => (
					<NumberFlow value={value?.count ?? 0} />
				)}
				queryFn={getTicketsCountQuery({
					conditions: {
						dateEntered: {
							value: ` [${todayStartString}]`,
							comparison: '>',
						},
						'board/id': 31,
						parentTicketId: null,
					},
				})}
				// value={data?.count}
				icon={CalendarPlus}
			/>

			<Metric
				label='Closed Today'
				renderOption={(value) => (
					<NumberFlow value={value?.count ?? 0} />
				)}
				queryFn={getTicketsQuery({
					conditions: {
						closedFlag: true,
						closedDate: {
							value: ` [${todayStartString}]`,
							comparison: '>',
						},
						dateEntered: {
							value: ` [${todayStartString}]`,
							comparison: '>',
						},
						'board/id': 31,
						parentTicketId: null,
					},
				})}
				icon={CalendarMinus}
				// value={ticketCount?.count}
			/>

			<Metric
				label='Same Day Close'
				renderOption={() => (
					<NumberFlow
						value={
							(sameDayCloseAmount ?? 0) /
							(ticketsEnteredToday ?? 0)
						}
						locales='en-US'
						format={{
							style: 'percent',
							minimumFractionDigits: 1,
							maximumFractionDigits: 1,
						}}
					/>
					// <>
					// 	{(ticketsEnteredToday ?? 0) > 0
					// 		? new Intl.NumberFormat('en-US', {
					// 				style: 'percent',
					// minimumFractionDigits: 1,
					// maximumFractionDigits: 1,
					// 			}).format(
					// (sameDayCloseAmount ?? 0) /
					// 	(ticketsEnteredToday ?? 0)
					// 			)
					// 		: '0%'}
					// </>
				)}
				queryFn={getTicketsQuery({
					conditions: {
						closedFlag: true,
						closedDate: {
							value: ` [${todayStartString}]`,
							comparison: '>',
						},
						dateEntered: {
							value: ` [${todayStartString}]`,
							comparison: '>',
						},
						'board/id': 31,
						parentTicketId: null,
					},
				})}
				icon={Calendar1}
			/>

			<Metric
				label='Avg. Response Time Today'
				renderOption={() => (
					<NumberFlow
						value={
							Math.floor(averageTimeToAnswerInHours) > 0
								? Math.floor(averageTimeToAnswerInHours)
								: Math.floor(
										averageTimeToAnswerInMinutes % 60
									) ?? 0
						}
						format={{
							style: 'unit',
							unit:
								Math.floor(averageTimeToAnswerInHours) > 0
									? 'hour'
									: 'minute',
							unitDisplay: 'narrow',
						}}
					/>
					// <>
					// 	{Math.floor(averageTimeToAnswerInHours) > 0
					// 		? `${Math.floor(averageTimeToAnswerInHours)}h `
					// 		: ''}
					// {Number.isNaN(
					// 	Math.floor(averageTimeToAnswerInMinutes % 60)
					// )
					// 	? 0
					// 	: Math.floor(averageTimeToAnswerInMinutes % 60)}
					// 	m
					// </>
				)}
				queryFn={{
					...getTicketsQuery({
						conditions: {
							closedFlag: true,
							closedDate: {
								value: ` [${todayStartString}]`,
								comparison: '>',
							},
							dateEntered: {
								value: ` [${todayStartString}]`,
								comparison: '>',
							},
							'board/id': 31,
							parentTicketId: null,
						},
					}),
					refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
					placeholderData: (previousData) => previousData,
				}}
				icon={Calendar1}
			/>

			<Metric
				label='Avg. Time To Answer Today'
				renderOption={(v) => (
					<>
						{handle_time_by_day?.average_queue_time &&
						Math.ceil(handle_time_by_day.average_queue_time) > 0
							? `${Math.ceil(handle_time_by_day?.average_queue_time)}s`
							: '0s'}
					</>
				)}
				queryFn={getTicketsQuery({
					conditions: {
						closedFlag: true,
						closedDate: {
							value: ` [${todayStartString}]`,
							comparison: '>',
						},
						dateEntered: {
							value: ` [${todayStartString}]`,
							comparison: '>',
						},
						'board/id': 31,
						parentTicketId: null,
					},
				})}
				icon={Calendar1}
			/>

			<Metric
				label='Voicemails Left Today'
				renderOption={(value) => {
					const total =
						value?.reduce((acc, engagement) => {
							return acc + (engagement.voicemails ?? 0);
						}, 0) ?? 0;

					return <>{total}</>;
				}}
				queryFn={getEngagementSummaryByPeriodQuery({
					call_date: new Date(),
				})}
				icon={Voicemail}
			/>
		</section>
	);
};

export default MetricTrackerHeader;
