import { useState, useEffect, useCallback, useRef, useMemo, Fragment } from 'react';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ModalPopoverContent, Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export interface Option {
	value: string;
	label: string;
	disabled?: boolean;
	description?: string;
	icon?: React.ReactNode;
}

export interface AsyncSelectProps<T> {
	/** Async function to fetch options */
	// fetcher: (query?: string) => Promise<T[]>;
	fetcher: (value?: string, page?: number) => Promise<T[]>;
	/** Preload all data ahead of time */
	preload?: boolean;
	/** Function to filter options */
	filterFn?: (option: T, query: string) => boolean;
	/** Function to render each option */
	renderOption: (option: T) => React.ReactNode;
	/** Function to get the value from an option */
	getOptionValue: (option: T) => string;
	/** Function to get the display value for the selected option */
	getDisplayValue: (option: T) => React.ReactNode;
	/** Custom not found message */
	notFound?: React.ReactNode;
	/** Custom loading skeleton */
	loadingSkeleton?: React.ReactNode;
	/** Currently selected value */
	value: string;
	/** Callback when selection changes */
	onChange: (value: T | null) => void;
	/** Label for the select field */
	label: string;
	/** Placeholder text when no selection */
	placeholder?: string;
	/** Disable the entire select */
	disabled?: boolean;
	/** Custom width for the popover */
	width?: string | number;
	/** Custom class names */
	className?: string;
	/** Custom trigger button class names */
	triggerClassName?: string;
	/** Custom no results message */
	noResultsMessage?: string;
	/** Allow clearing the selection */
	clearable?: boolean;
	/** Custom children */
	children?: React.ReactNode;
	/** Default open */
	defaultOpen?: boolean;
}

export function AsyncSelect<T>({
	fetcher,
	preload,
	renderOption,
	getOptionValue,
	notFound,
	loadingSkeleton,
	label,
	value,
	onChange,
	className,
	noResultsMessage,
	clearable = true,
	children,
	defaultOpen = false,
}: AsyncSelectProps<T>) {
	const [open, setOpen] = useState(defaultOpen);
	const [selectedValue, setSelectedValue] = useState(value);
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, preload ? 0 : 300);

	const {
		data,
		isLoading: loading,
		isFetching,
		isRefetching,
		error,
		fetchNextPage,
		hasNextPage,
	} = useInfiniteQuery({
		queryKey: ['async-select', label, debouncedSearchTerm],
		queryFn: ({ pageParam }) => fetcher(debouncedSearchTerm, pageParam),
		getNextPageParam: (lastPage, pages) => (lastPage.length > 0 ? pages.length + 1 : undefined),
		initialPageParam: 1,
		initialData: {
			pages: [],
			pageParams: [1],
		},
	});

	const options = useMemo(() => {
		return data?.pages.reduce((acc, page) => {
			console.log(page);

			return [...acc, ...(page ?? [])];
		}, []);
	}, [data]);

	const handleSelect = useCallback(
		(currentValue: string) => {
			const newValue = clearable && currentValue === selectedValue ? '' : currentValue;
			setSelectedValue(newValue);
			// setSelectedOption(options.find((option) => getOptionValue(option) === newValue) || null);
			console.log(options);
			onChange(options.find((option) => getOptionValue(option) === newValue) || null);
			setOpen(false);
		},
		[selectedValue, onChange, clearable, options, getOptionValue]
	);

	// Ref for the scrolling container
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// Intersection observer logic - target the last rendered *item* or a dedicated sentinel
	const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
	const observer = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		if (observer.current) observer.current.disconnect();

		observer.current = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetching) {
					fetchNextPage();
				}
			},
			{
				root: scrollContainerRef.current, // Use the scroll container for scroll detection
				threshold: 0.1, // Trigger when 10% of the target is visible
				rootMargin: '0px 0px 100px 0px', // Trigger loading a bit before reaching the end
			}
		);

		if (loadMoreSentinelRef.current) {
			observer.current.observe(loadMoreSentinelRef.current);
		}

		return () => {
			if (observer.current) observer.current.disconnect();
		};
	}, [isFetching, hasNextPage, fetchNextPage]);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
		>
			<PopoverTrigger asChild>{children}</PopoverTrigger>

			<ModalPopoverContent
				className={cn('p-0', className)}
				align='start'
			>
				<Command shouldFilter={false}>
					<div className='relative border-b w-full'>
						<CommandInput
							placeholder={`Search ${label.toLowerCase()}...`}
							value={searchTerm}
							onValueChange={(value) => {
								setSearchTerm(value);
							}}
						/>
						{loading && options.length > 0 && (
							<div className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center'>
								<Loader2 className='h-4 w-4 animate-spin' />
							</div>
						)}
					</div>
					<CommandList ref={scrollContainerRef}>
						{error && <div className='p-4 text-destructive text-center'>{error.message}</div>}
						{loading && options.length === 0 && (loadingSkeleton || <DefaultLoadingSkeleton />)}
						{!loading &&
							!isRefetching &&
							!isFetching &&
							!error &&
							options.length === 0 &&
							(notFound || (
								<CommandEmpty>{noResultsMessage ?? `No ${label.toLowerCase()} found.`}</CommandEmpty>
							))}
						<CommandGroup>
							{options.map((option) => (
								<Fragment key={getOptionValue(option)}>{renderOption(option)}</Fragment>
								// <CommandItem
								// 	key={getOptionValue(option)}
								// 	value={getOptionValue(option)}
								// 	onSelect={handleSelect}
								// >
								// 	<Check
								// 		className={cn(
								// 			'ml-auto h-3 w-3',
								// 			selectedValue === getOptionValue(option) ? 'opacity-100' : 'opacity-0'
								// 		)}
								// 	/>
								// </CommandItem>
							))}
							<div
								ref={loadMoreSentinelRef}
								style={{ height: '1px' }}
							/>
							{!hasNextPage && (
								<div className='text-center text-muted-foreground py-3 text-sm'>
									You&apos;ve reached the end.
								</div>
							)}
						</CommandGroup>
					</CommandList>
				</Command>
			</ModalPopoverContent>
		</Popover>
	);
}

function DefaultLoadingSkeleton() {
	return (
		<CommandGroup>
			{[1, 2, 3].map((i) => (
				<CommandItem
					key={i}
					disabled
				>
					<div className='flex items-center gap-2 w-full'>
						<div className='h-6 w-6 rounded-full animate-pulse bg-muted' />
						<div className='flex flex-col flex-1 gap-1'>
							<div className='h-4 w-24 animate-pulse bg-muted rounded' />
							<div className='h-3 w-16 animate-pulse bg-muted rounded' />
						</div>
					</div>
				</CommandItem>
			))}
		</CommandGroup>
	);
}
