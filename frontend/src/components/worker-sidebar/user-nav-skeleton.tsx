import { SidebarMenuButton } from '../ui/sidebar';
import { Skeleton } from '../ui/skeleton';
import { ChevronsUpDown } from 'lucide-react';

const UserNavSkeleton = () => {
	return (
		<SidebarMenuButton
			size='lg'
			className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
		>
			<Skeleton className='size-7 rounded-lg' />

			<div className='grid flex-1 text-left text-sm leading-tight'>
				<Skeleton className='w-full h-4' />

				<Skeleton className='w-3/4 h-4' />
			</div>
			<ChevronsUpDown className='ml-auto size-4' />
		</SidebarMenuButton>
	);
};

export default UserNavSkeleton;
