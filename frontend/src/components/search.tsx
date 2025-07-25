'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { cn, filterSchema } from '@/lib/utils';
import { SearchIcon, RefreshCcw } from 'lucide-react';
// import { usePathname, useRouter, useSearchParams } from '@tanstack/route'
// import { useDebounce } from 'use-debounce'
import { Button } from '@/components/ui/button';
import { parseAsJson, useQueryState } from 'nuqs';

interface Props {
	baseUrl: string;
	placeholder: string;
	className?: string;
	queryParam?: string;
	defaultValue?: string;
}

const Search = ({ baseUrl, placeholder, className, queryParam = 'search', defaultValue }: Props) => {
	const { pending } = useFormStatus();
	const [text, setText] = useState(defaultValue || '');
	const [queryFilters, setQueryFilters] = useQueryState('filter', parseAsJson(filterSchema.parse).withDefault([]));

	useEffect(() => {
		if (!queryFilters) return;

		// setText(queryFilters?.[0]?.value?.values?.[0] || '');
	}, [queryFilters]);

	return (
		<form
			className={cn(
				'flex h-9 items-center w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden ring-0',
				className
			)}
			onSubmit={(e) => {
				e.preventDefault();
				setQueryFilters([{ id: 'fts', value: { operator: 'ilike', values: [text] } }]);
			}}
		>
			{pending ? (
				<RefreshCcw className='shrink-0 animate-spin' />
			) : (
				<SearchIcon className='shrink-0 opacity-50' />
			)}

			<Input
				placeholder={placeholder}
				value={text}
				onChange={(event) => {
					setText(event.target.value);
					setQueryFilters([{ id: 'fts', value: { operator: 'ilike', values: [event.target.value] } }]);
				}}
				className='border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent'
				defaultValue={defaultValue}
			/>

			<Button className='hidden' />
		</form>
	);
};

export default Search;
