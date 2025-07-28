import { ScrollArea } from '@/components/ui/scroll-area';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/companies/$id/activity')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className='pl-5 w-full h-full'>
			<ScrollArea className='overflow-hidden w-full h-full flex flex-col'></ScrollArea>
		</div>
	);
}
