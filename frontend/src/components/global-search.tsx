import React, { useEffect, useRef, useState } from 'react';
import { Popover } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle2, Loader2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { search } from '@/lib/manage/read';
import { useDebouncer } from '@tanstack/react-pacer/debouncer';
import { Separator } from '@/components/ui/separator';
import { Link } from '@tanstack/react-router';
import { getGlobalSearchQuery } from '@/lib/manage/api';

const GlobalSearch = () => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState<string>('');
	const [debouncedValue, setDebouncedValue] = useState(value);
	const [isOpen, setIsOpen] = useState(false);

	const setValueDebouncer = useDebouncer(setDebouncedValue, {
		wait: 300,
		// enabled: instantCount > 2, // optional, defaults to true
	});

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
				if (
					(e.target instanceof HTMLElement &&
						e.target.isContentEditable) ||
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLTextAreaElement ||
					e.target instanceof HTMLSelectElement
				) {
					return;
				}

				e.preventDefault();
				setIsOpen((open) => !open);
				if (document.activeElement === inputRef.current) {
					// do something
					inputRef.current?.blur();
				} else {
					inputRef.current?.focus();
				}
				// inputRef.current
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	const { data, isLoading } = useQuery(getGlobalSearchQuery(debouncedValue));

	return (
		<Popover
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<PopoverTrigger
				className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
				// disabled={isLoading}
			>
				<Input
					placeholder='Search...'
					className='h-8 w-96 px-6 bg-background'
					ref={inputRef}
					value={value}
					onChange={(event) => {
						setValue(() => {
							setValueDebouncer.maybeExecute(event.target.value); // debounced state update
							return event.target.value; // instant state update
						});
						// setValue(event.target.value);
					}}
					// disabled={isLoading}
				/>

				{isLoading ? (
					<Loader2 className='absolute top-1/2 left-1.5 -translate-y-1/2 text-sm text-muted-foreground animate-spin' />
				) : (
					<Search className='absolute top-1/2 left-1.5 -translate-y-1/2 text-sm text-muted-foreground' />
				)}

				<kbd className='pointer-events-none absolute top-1/2 right-1.5 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex'>
					<span className='text-xs'>⌘</span>/
				</kbd>
			</PopoverTrigger>

			<PopoverContent
				side='top'
				align='center'
				className='w-96 p-3'
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<div className='flex items-center gap-3'>
					<Badge>
						<CheckCircle2 />
						<span>Tasks</span>
					</Badge>
				</div>

				<Separator />

				<div className='flex flex-col gap-1 max-h-96 overflow-y-auto'>
					{data?.map((item) => (
						<Link
							key={item.id}
							{...item}
							className='p-1.5 border-b last:border-b-0'
						>
							<span>{item.title}</span>
						</Link>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default GlobalSearch;
