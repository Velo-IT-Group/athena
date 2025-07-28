import type { NavItemWithChildren } from '@/types/nav';
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Link, useLocation, useRouter } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface Props {
	item: NavItemWithChildren;
	actions?: {
		label: string;
		icon: LucideIcon;
		action: () => void;
	}[];
}

const NavigationItem = ({ item, actions }: Props) => {
	const pathname = useLocation({ select: (l) => l.pathname });
	const router = useRouter();
	const resolvedLink = router.buildLocation(item);
	// if (actions)
	// 	return (
	// 		<ContextMenu>
	// 			<ContextMenuTrigger asChild>
	// 				<SidebarMenuItem>
	// 					<SidebarMenuButton
	// 						tooltip={item.title}
	// 						isActive={pathname.startsWith(
	// 							resolvedLink.pathname
	// 						)}
	// 						asChild
	// 					>
	// 						{item.href ? (
	// 							<a
	// 								href={item.href}
	// 								target='_blank'
	// 							>
	// 								{item.icon && <item.icon />}
	// 								<span>{item.title}</span>
	// 							</a>
	// 						) : (
	// 							<Link {...item}>
	// 								{item.icon && <item.icon />}
	// 								<span>{item.title}</span>
	// 							</Link>
	// 						)}
	// 					</SidebarMenuButton>

	// 					{item.badge && (
	// 						<SidebarMenuBadge className='bg-primary text-white text-xs px-1 rounded-sm min-w-4 h-4 top-2'>
	// 							{item.badge}
	// 						</SidebarMenuBadge>
	// 					)}

	// 					{item.items && item.items.length > 0 && (
	// 						<SidebarMenuSub>
	// 							{item.items.map((subItem) => {
	// 								const resolvedLink =
	// 									router.buildLocation(subItem);

	// 								return (
	// 									<SidebarMenuSubItem key={subItem.href}>
	// 										<SidebarMenuSubButton
	// 											isActive={
	// 												resolvedLink.pathname ===
	// 												'/'
	// 													? true
	// 													: pathname.startsWith(
	// 															resolvedLink.pathname
	// 														)
	// 											}
	// 											asChild
	// 										>
	// 											<Link {...subItem}>
	// 												{subItem.icon && (
	// 													<subItem.icon />
	// 												)}
	// 												<span>{subItem.title}</span>
	// 											</Link>
	// 										</SidebarMenuSubButton>
	// 									</SidebarMenuSubItem>
	// 								);
	// 							})}
	// 						</SidebarMenuSub>
	// 					)}
	// 				</SidebarMenuItem>
	// 			</ContextMenuTrigger>

	// 			<ContextMenuContent>
	// 				{actions.map((action) => (
	// 					<ContextMenuItem
	// 						key={action.label}
	// 						onSelect={action.action}
	// 					>
	// 						<action.icon />
	// 						<span>{action.label}</span>
	// 					</ContextMenuItem>
	// 				))}
	// 			</ContextMenuContent>
	// 		</ContextMenu>
	// 	);

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				tooltip={item.title}
				isActive={
					item.to === '/'
						? pathname === '/'
						: pathname.startsWith(resolvedLink.pathname)
				}
				size='sm'
				asChild
			>
				{item.href ? (
					<a
						href={item.href}
						target='_blank'
					>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
					</a>
				) : (
					<Link {...item}>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
					</Link>
				)}
			</SidebarMenuButton>

			{item.badge && (
				<SidebarMenuBadge className='bg-primary text-white text-xs px-1 rounded-sm min-w-4 h-4 top-2'>
					{item.badge}
				</SidebarMenuBadge>
			)}

			{/* {item.items && item.items.length > 0 && (
				<SidebarMenuSub>
					{item.items.map((subItem) => {
						const resolvedLink = router.buildLocation(subItem);

						return (
							<SidebarMenuSubItem key={subItem.href}>
								<SidebarMenuSubButton
									isActive={
										resolvedLink.pathname === '/'
											? true
											: pathname.startsWith(
													resolvedLink.pathname
												)
									}
									asChild
								>
									<Link {...subItem}>
										{subItem.icon && <subItem.icon />}
										<span>{subItem.title}</span>
									</Link>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						);
					})}
				</SidebarMenuSub>
			)} */}
		</SidebarMenuItem>
	);
};

export default NavigationItem;
