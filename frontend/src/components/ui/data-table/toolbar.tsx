'use client';
import React from 'react';

import { RefreshCcw, X } from 'lucide-react';
import type { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { DataTableViewOptions } from './view-options';

import { DataTableFacetedFilter } from './faceted-filter';
import type { Identifiable } from '@/types';
import BooleanFilter from './boolean-filter';
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export interface BooleanFilter<TData> {
	accessoryKey: keyof TData;
	title?: string;
	defaultValue: boolean;
}

export interface FacetedFilter<TData> {
	accessoryKey: keyof TData;
	items: Identifiable[];
}
interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	facetedFilters?: FacetedFilter<TData>[];
	booleanFilters?: BooleanFilter<TData>[];
	refetch: (options?: RefetchOptions) => Promise<
		QueryObserverResult<
			{
				data: TData[];
				count: number;
			},
			Error
		>
	>;
	isRefetching: boolean;
}

export function DataTableToolbar<TData>({
	table,
	facetedFilters,
	booleanFilters,
	refetch,
	isRefetching,
}: DataTableToolbarProps<TData>) {
	'use no memo';
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className='flex items-center justify-between gap-1.5 overflow-x-auto'>
			<div className='flex flex-1 items-center space-x-1.5'>
				{/* {table.options?.meta?.filterKey && (
                    <Search
                        placeholder="Filter..."
                        queryParam={table.options?.meta?.filterKey as string}
                        defaultValue={''}
                        className="h-9 w-[150px] lg:w-[250px] overflow-hidden"
                        setCondition={table.setCondition}
                        removeCondition={table.removeCondition}
                    />
                )} */}

				{facetedFilters?.map(({ accessoryKey, items }) => {
					const column = table.getColumn(accessoryKey as string);

					const defaultValues =
						// @ts-ignore
						table.getState()?.parameters?.conditions?.[
							(column?.columnDef?.meta?.filterKey as string) ?? ''
						] ?? [];

					return (
						<React.Fragment key={column?.id}>
							{column && (
								<DataTableFacetedFilter
									column={column}
									title={accessoryKey.toString()}
									options={items.map(({ name, id }) => {
										return { label: name, value: id };
									})}
									setCondition={table.setCondition}
									removeCondition={table.removeCondition}
									defaultValues={defaultValues as string[]}
								/>
							)}
						</React.Fragment>
					);
				})}

				{isFiltered && (
					<Button
						variant='ghost'
						onClick={() => {
							table.resetColumnFilters();
							table.resetConditions();
						}}
						className='h-9 px-2 lg:px-3'
					>
						Reset
						<X className='ml-2 h-3.5 w-3.5' />
					</Button>
				)}
			</div>

			<div className='ml-auto flex items-center gap-1.5'>
				{booleanFilters?.map(({ accessoryKey, defaultValue, title }) => (
					<BooleanFilter
						key={`${accessoryKey as string}-${title}`}
						accessoryKey={accessoryKey}
						title={title ?? accessoryKey.toString()}
						defaultValue={defaultValue}
						setCondition={table.setCondition}
						removeCondition={table.removeCondition}
					/>
				))}

				<Button
					size='icon'
					variant='ghost'
					onClick={async () => await refetch()}
					disabled={isRefetching}
				>
					<RefreshCcw className={cn(isRefetching && 'animate-spin')} />
				</Button>

				<DataTableViewOptions table={table} />
			</div>
		</div>
	);
}
