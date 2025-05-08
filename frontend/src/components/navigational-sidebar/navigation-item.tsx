import type { NavItemWithChildren } from '@/types/nav';
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Link, useLocation } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = { item: NavItemWithChildren };

const NavigationItem = ({ item }: Props) => {
	const { href } = useLocation();

	return (
		<Dialog>
			<SidebarMenuItem>
				<SidebarMenuButton
					tooltip={item.title}
					isActive={href === item.href}
					asChild
				>
					<Link {...item}>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
					</Link>
				</SidebarMenuButton>

				{item.items && item.items.length > 0 && (
					<SidebarMenuSub>
						{item.items.map((subItem) => (
							<SidebarMenuSubItem key={subItem.href}>
								<SidebarMenuSubButton
									isActive={href === subItem.href}
									asChild
								>
									<Link {...subItem}>
										{subItem.icon && <subItem.icon />}
										<span>{subItem.title}</span>
									</Link>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				)}
			</SidebarMenuItem>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>{item.title}</DialogTitle>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};

export default NavigationItem;
