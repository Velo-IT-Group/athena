'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { Conditions } from '@/utils/manage/params';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { HeartHandshake, LucideIcon, RefreshCcw } from 'lucide-react';
import {
	DefaultError,
	QueryKey,
	NonUndefinedGuard,
	QueryFunction,
	InitialDataFunction,
	DataTag,
	OmitKeyof,
	SkipToken,
} from '@tanstack/query-core';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from 'date-fns';
import { Button } from '@/components/ui/button';

interface MetricProps<TQueryFnData = unknown> {
	label: string;
	icon: LucideIcon;
	value?: TQueryFnData;
	params?: Conditions<TQueryFnData>;
	queryFn: UseQueryOptions<TQueryFnData> &
		(
			| {
					queryFn?: Exclude<
						UseQueryOptions<TQueryFnData>['queryFn'],
						SkipToken | undefined
					>;
			  }
			| {
					initialData:
						| NonUndefinedGuard<TQueryFnData>
						| (() => NonUndefinedGuard<TQueryFnData>);
					queryFn?: QueryFunction<TQueryFnData>;
			  }
		);
	renderOption: (value?: TQueryFnData) => React.ReactNode;
}

const Metric = <TData,>({
	label,
	value,
	params,
	queryFn,
	renderOption,
	...props
}: MetricProps<TData>) => {
	const { data, isLoading, dataUpdatedAt, refetch, isRefetching } =
		useQuery(queryFn);

	return (
		<Collapsible className='relative h-20'>
			<Card className='rounded-lg bg-background min-h-20 max-h-48 flex flex-col absolute inset-shadow-[0px_0px_0px_1px_var(--border)] shadow-none border-none p-0 inset-0 group/metric'>
				<div
					className='rounded-inherit absolute -z-[1px] opacity-0 '
					style={{
						boxShadow:
							'rgba(255, 255, 255, 0) 0px 0px 0px 1px inset, rgba(28, 40, 64, 0.04) 0px 0px 0px 1px, rgba(28, 40, 64, 0.12) 0px 4px 8px -4px, rgba(24, 41, 75, 0.16) 0px 4px 12px -2px',
					}}
				/>
				<div className='absolute opacity-20' />

				<div className='overflow-hidden flex-[1_1_auto] flex flex-col relative'>
					<CardHeader className='flex-row gap-2 items-center justify-between space-y-0'>
						<CardTitle className='tracking-tight font-medium text-xs truncate text-muted-foreground'>
							<div className='flex items-center max-w-full min-w-0 tracking-[0px] w-full'>
								<div className='truncate shrink-0'>{label}</div>
							</div>
						</CardTitle>

						<props.icon />
					</CardHeader>

					<CardContent
						className='mt-auto flex-[0_1_auto] flex flex-col items-stretch py-2.5 overflow-hidden px-0 relative border-none'
						style={{
							background: 'none',
						}}
					>
						<div className='gap-1 flex flex-col items-stretch justify-start flex-[1_1_auto]'>
							<div className='flex flex-col items-stretch justify-end px-3 relative h-full'>
								<div className='tracking-tight text-sm font-medium truncate text-muted-foreground/60'>
									{isLoading ? (
										<Skeleton className='w-1/4 h-5' />
									) : (
										<>{renderOption(data)}</>
									)}
								</div>
							</div>
						</div>
						<div className='absolute z-10 p-2 backdrop-blur-xs rounded-tr-md rounded-tl-md inset-[1px] flex justify-end items-end opacity-0 select-none group-hover/metric:opacity-100 transition-all duration-300 animate'>
							<div>
								<Badge
									variant='outline'
									className='capitalize'
								>
									{formatRelative(
										new Date(dataUpdatedAt),
										new Date(),
										{}
									)}
								</Badge>

								<Button
									onClick={() => refetch()}
									variant='outline'
									size='icon'
									className='[&>svg]:data-[isRefetching=true]:animate-spin'
									disabled={isRefetching}
									data-refetching={isRefetching}
								>
									<RefreshCcw />
								</Button>
							</div>
						</div>
					</CardContent>
				</div>
			</Card>
		</Collapsible>
	);
};
export default Metric;

export function Widget() {
	return (
		<Collapsible className='relative h-20'>
			<Card className='rounded-lg bg-background min-h-20 max-h-48 flex flex-col absolute inset-shadow-[0px_0px_0px_1px_var(--border)] shadow-none border-none p-0 inset-0'>
				<div
					className='rounded-inherit absolute -z-[1px] opacity-0 '
					style={{
						boxShadow:
							'rgba(255, 255, 255, 0) 0px 0px 0px 1px inset, rgba(28, 40, 64, 0.04) 0px 0px 0px 1px, rgba(28, 40, 64, 0.12) 0px 4px 8px -4px, rgba(24, 41, 75, 0.16) 0px 4px 12px -2px',
					}}
				/>
				<div className='absolute opacity-20' />

				<div className='overflow-hidden flex-[1_1_auto] flex flex-col relative'>
					<CardHeader className='flex-row gap-2 items-center justify-between space-y-0'>
						<CardTitle className='tracking-tight font-medium text-xs truncate text-muted-foreground'>
							<div className='flex items-center max-w-full min-w-0 tracking-[0px] w-full'>
								<div className='truncate shrink-0'>
									​Employee range
								</div>
							</div>
						</CardTitle>

						<HeartHandshake />
					</CardHeader>

					<CardContent
						className='mt-auto flex-[0_1_auto] flex flex-col items-stretch py-2.5 overflow-hidden px-0 relative border-none'
						style={{
							background: 'none',
						}}
					>
						<div className='gap-1 flex flex-col items-stretch justify-start flex-[1_1_auto]'>
							<div className='flex flex-col items-stretch justify-end px-3 relative h-full'>
								<div
									className='tracking-tight text-sm font-medium truncate text-muted-foreground'
									// style={{
									// 	boxSizing: 'border-box',
									// 	fontStyle: 'normal',
									// 	textAlign: 'left',
									// 	fontFamily: 'Inter',
									// 	letterSpacing: '-0.02em',
									// 	fontWeight: 500,
									// 	lineHeight: '20px',
									// 	fontSize: '14px',
									// 	overflow: 'hidden',
									// 	whiteSpace: 'nowrap',
									// 	textOverflow: 'ellipsis',
									// 	color: 'rgba(0, 0, 0, 0.4)',
									// }}
								>
									No Employee range
								</div>
							</div>
						</div>
					</CardContent>
				</div>
			</Card>
		</Collapsible>
	);
}
