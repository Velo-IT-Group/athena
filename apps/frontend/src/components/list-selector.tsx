'use client';
import { Check } from 'lucide-react';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface OtherProps<T> {
	items: T[];
	placeholder?: string;
	onSelect?: (e: T) => void;
	value?: (item: T) => string;
	itemView?: (item: T) => React.ReactNode;
	comparisonFn?: (item: T) => boolean;
	searchable?: boolean;
	groupedBy?: (item: T) => string;
}

export function ListSelector<T>({
	comparisonFn,
	searchable = true,
	items,
	placeholder,
	onSelect,
	value,
	itemView,
	groupedBy,
}: OtherProps<T>) {
	return (
		<Command shouldFilter={searchable}>
			{searchable && (
				<CommandInput
					placeholder={placeholder ?? 'Search...'}
					className='h-9'
				/>
			)}

			<CommandList>
				<CommandEmpty>No items found.</CommandEmpty>

				{groupedBy ? (
					<>
						{Object.entries(Object.groupBy(items, groupedBy)).map(
							([key, items]) => (
								<CommandGroup
									heading={key}
									key={key}
								>
									{items?.map((item, index) => (
										<CommandItem
											key={value?.(item) ?? index}
											value={value?.(item)}
											onSelect={() => onSelect?.(item)}
										>
											{comparisonFn && (
												<Check
													className={cn(
														'mr-1.5 opacity-0',
														comparisonFn?.(item) &&
															'opacity-100'
													)}
												/>
											)}
											{itemView?.(item)}
										</CommandItem>
									))}
								</CommandGroup>
							)
						)}{' '}
					</>
				) : (
					<CommandGroup>
						{items?.map((item, index) => (
							<CommandItem
								key={value?.(item) ?? index}
								value={value?.(item)}
								onSelect={() => onSelect?.(item)}
							>
								{comparisonFn && (
									<Check
										className={cn(
											'mr-1.5 opacity-0',
											comparisonFn?.(item) &&
												'opacity-100'
										)}
									/>
								)}
								{itemView?.(item)}
							</CommandItem>
						))}
					</CommandGroup>
				)}
			</CommandList>
		</Command>
	);
}
