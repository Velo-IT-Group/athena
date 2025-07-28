'use client';
import * as React from 'react';

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command';
import {
	useQuery,
	type DefinedInitialDataOptions,
	type UndefinedInitialDataOptions,
	type UseSuspenseQueryOptions,
} from '@tanstack/react-query';

export interface DataFetcher {
	options: UseSuspenseQueryOptions;
	itemView: (item: any) => React.ReactNode;
	// onSelect?: ((value: string) => void) | undefined;
}

export interface CommandItem {
	icon: React.ReactNode;
	label: string;
	value: string;
	description?: string;
	shortcut?: string;
	action?: (value: string) => void;
	options?: CommandItem[];
	testFetch?: DataFetcher;
	fetcher?: DataFetcher;
}

interface CommandSection {
	heading?: string;
	items: CommandItem[];
}

export function CommandMenu({ sections }: { sections: CommandSection[] }) {
	const [open, setOpen] = React.useState(false);
	const [selectedCommandItem, setSelectedCommandItem] =
		React.useState<CommandItem | null>(null);
	const [value, setValue] = React.useState<string>('');

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	return (
		<CommandDialog
			open={open}
			onOpenChange={(e) => {
				if (!e) {
					setSelectedCommandItem(null);
				}
				setOpen(e);
			}}
		>
			<CommandInput
				placeholder='Type a command or search...'
				value={value}
				onValueChange={setValue}
			/>

			<CommandList>
				{!selectedCommandItem &&
					sections?.map((section) => (
						<>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup
								key={React.useId()}
								heading={section.heading}
							>
								{section.items?.map((item) => (
									<CommandItem
										key={React.useId()}
										value={item.value}
										onSelect={() => {
											if (item.action) {
												item.action(item.value);
												setOpen(false);
											} else {
												setSelectedCommandItem(item);
											}
											setValue('');
										}}
									>
										{item.icon}
										<span>{item.label}</span>
									</CommandItem>
								))}
							</CommandGroup>

							<CommandSeparator
								key={React.useId()}
								className='last:hidden'
							/>
						</>
					))}

				{selectedCommandItem?.fetcher && (
					<CommandMenuOptionsWithQuery
						options={selectedCommandItem.fetcher.options}
						itemView={selectedCommandItem.fetcher.itemView}
						// onSelect={selectedCommandItem.fetcher.onSelect}
					/>
				)}

				{/* {options && options.length > 0 && (
					<CommandGroup>
						{options?.map((item) => (
							<CommandItem
								key={React.useId()}
								value={`${item.label}-${item.value}`}
								onSelect={() => {
									item.action?.(item.value);
									setOptions(undefined);
									setOpen(false);
								}}
							>
								{item.icon}
								<span>{item.label}</span>
							</CommandItem>
						))}
					</CommandGroup>
				)} */}
			</CommandList>
		</CommandDialog>
	);
}

const CommandMenuOptionsWithQuery = <T,>({
	options,
	itemView,
}: {
	options: DefinedInitialDataOptions | UndefinedInitialDataOptions;
	itemView: (item: T) => React.ReactNode;
}) => {
	const { data, isLoading } = useQuery(options);

	console.log(data);

	return (
		<CommandGroup>
			{isLoading && <CommandEmpty>Loading...</CommandEmpty>}
			{data?.data ? (
				data?.data?.map((item) => <>{itemView(item)}</>)
			) : (
				<>
					{data?.map((item) => (
						<>{itemView(item)}</>
					))}
				</>
			)}
		</CommandGroup>
	);
};
