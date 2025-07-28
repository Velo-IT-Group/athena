'use client';
import { useHotkeys } from 'react-hotkeys-hook';

import Search from '@/components/search/search';
import { SearchFooter } from '@/components/search/search-footer';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { useSearchStore } from '@/store/search';

export function SearchModal() {
	const { isOpen, setOpen } = useSearchStore();

	useHotkeys('meta+k', () => setOpen(), {
		enableOnFormTags: true,
	});

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setOpen}
		>
			<DialogContent
				className='overflow-hidden p-0 max-w-full w-full flex flex-col md:max-w-[740px] h-[535px] m-0 select-text bg-transparent border-none gap-0'
				hideClose
			>
				<Search />
				<SearchFooter />
			</DialogContent>
		</Dialog>
	);
}
