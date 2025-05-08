import * as React from 'react';
import { Check, CirclePlus } from 'lucide-react';
import type { Column } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { PopoverContent } from '@/components/ui/popover';
import type { KeyValue } from '@/utils/manage/params';
import type { QueryFunction } from '@tanstack/react-query';

interface DataTableFacetedFilterProps<TData, TValue> {
	column?: Column<TData, TValue>;
	title?: string;
	options: {
		label: string;
		value: string | number;
		icon?: React.ComponentType<{ className?: string }>;
	}[];
	defaultValues: string[];
	setCondition: (condition: KeyValue) => void;
	removeCondition: (keyToRemove: string) => void;
	queryFn?: QueryFunction;
}

export function DataTableFacetedFilter<TData, TValue>({
	column,
	title,
	options,
	defaultValues,
	setCondition,
	removeCondition,
}: DataTableFacetedFilterProps<TData, TValue>) {
	const facets = column?.getFacetedUniqueValues();
	const defaults = defaultValues && Array.isArray(defaultValues) ? [...defaultValues].map(String) : [];
	const filterValue = column?.getFilterValue() ? (column?.getFilterValue() as string[]) : [];
	let selectedValues = new Set([...filterValue, ...defaults]);

	React.useEffect(() => {
		if (!defaultValues) return;
		const defaults = defaultValues && Array.isArray(defaultValues) ? [...defaultValues].map(String) : [];

		selectedValues = new Set([...filterValue, ...defaults]);
	}, [defaultValues]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					size='sm'
					className='h-9 border-dashed capitalize'
					// disabled={isFetching}
				>
					<CirclePlus className='mr-2 h-3.5 w-3.5' />
					{title}
					{selectedValues?.size > 0 && (
						<>
							<Separator
								orientation='vertical'
								className='mx-2 h-3.5'
							/>
							<Badge
								variant='secondary'
								className='rounded-sm px-1 font-normal lg:hidden'
							>
								{selectedValues.size}
							</Badge>
							<div className='hidden space-x-1 lg:flex'>
								{selectedValues.size > 2 ? (
									<Badge
										variant='secondary'
										className='rounded-sm px-1 font-normal'
									>
										{selectedValues.size} selected
									</Badge>
								) : (
									options
										.filter((option) => selectedValues.has(String(option.value)))
										.map((option) => (
											<Badge
												variant='secondary'
												key={option.value}
												className='rounded-sm px-1 font-normal'
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className='w-72 p-0'
				align='start'
			>
				<Command>
					<CommandInput placeholder={`Filter by ${title}...`} />
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandList>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedValues.has(String(option.value));
								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											if (isSelected) {
												selectedValues.delete(String(option.value));
											} else {
												selectedValues.add(String(option.value));
											}
											const filterValues = Array.from(selectedValues);
											column?.setFilterValue(filterValues.length ? filterValues : undefined);
											if (filterValues.length) {
												// @ts-ignore
												setCondition({
													[column?.columnDef.meta?.filterKey as string]: filterValues,
												});
											} else {
												// @ts-ignore
												removeCondition(column?.columnDef.meta?.filterKey as string);
											}
										}}
									>
										<div
											className={cn(
												'mr-2 flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary',
												isSelected
													? 'bg-primary text-primary-foreground'
													: 'opacity-50 [&_svg]:invisible'
											)}
										>
											<Check />
										</div>

										{option.icon && (
											<option.icon className='mr-2 h-3.5 w-3.5 text-muted-foreground' />
										)}

										<span>{option.label}</span>

										{facets?.get(option.value) && (
											<span className='ml-auto flex h-3.5 w-3.5 items-center justify-center font-mono text-xs'>
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								);
							})}
						</CommandGroup>

						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => {
											column?.setFilterValue(undefined);
											removeCondition(
												// @ts-ignore
												column?.columnDef.meta?.filterKey
											);
										}}
										className='justify-center text-center'
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
