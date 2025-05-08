import NavigationalSidebar from '@/components/navigational-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { linksConfig } from '@/config/links';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/')({
	component: RouteComponent,
});

function RouteComponent() {
	return <div></div>;
}
