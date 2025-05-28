import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface OtherProps<T> {
	currentValue?: T | T[];
	items: T[];
	placeholder?: string;
	onSelect?: (e: T) => void;
	value?: (item: T) => string;
	itemView?: (item: T) => React.ReactNode;
}

export function ListSelector<T>({ currentValue, items, placeholder, onSelect, value, itemView }: OtherProps<T>) {
	return (
		<Command>
			<CommandInput
				placeholder={placeholder ?? 'Search...'}
				className='h-9'
			/>

			<CommandList>
				<CommandEmpty>No items found.</CommandEmpty>

				<CommandGroup>
					{items?.map((item) => (
						<CommandItem
							key={value ? value(item) : crypto.randomUUID()}
							value={value?.(item)}
							onSelect={() => onSelect?.(item)}
						>
							<Check
								className={cn(
									'mr-1.5 opacity-0',
									currentValue && Array.isArray(currentValue)
										? currentValue.some((v) => v === item)
										: currentValue === item && 'opacity-100'
								)}
							/>
							{itemView?.(item)}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
