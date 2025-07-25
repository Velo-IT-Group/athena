import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/search';
import { Search } from 'lucide-react';

const SearchButton = ({ className }: { className?: string }) => {
	const { setOpen } = useSearchStore();

	return (
		<Button
			variant='outline'
			className={cn(
				'relative min-w-[250px] w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 border-0 p-0 hover:bg-transparent font-normal no-drag hidden md:flex',
				className
			)}
			onClick={() => setOpen()}
		>
			<Search className='mr-1.5' />

			<span>Find anything...</span>

			<kbd className='pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 border bg-accent px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex rounded'>
				<span className='text-xs'>⌘</span>K
			</kbd>
		</Button>
	);
};

export default SearchButton;
