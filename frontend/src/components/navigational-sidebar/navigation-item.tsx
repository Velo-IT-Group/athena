import type { NavItemWithChildren } from '@/types/nav';
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Link, useLocation } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

type Props = {
	item: NavItemWithChildren;
	actions?: {
		label: string;
		icon: LucideIcon;
		action: () => void;
	}[];
};

const NavigationItem = ({ item, actions }: Props) => {
	const { href } = useLocation();

	if (actions)
		return (
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<SidebarMenuItem>
						<SidebarMenuButton
							tooltip={item.title}
							isActive={href === item.href}
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
				</ContextMenuTrigger>

				<ContextMenuContent>
					{actions.map((action) => (
						<ContextMenuItem
							key={action.label}
							onSelect={action.action}
						>
							<action.icon />
							<span>{action.label}</span>
						</ContextMenuItem>
					))}
				</ContextMenuContent>
			</ContextMenu>
		);

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				tooltip={item.title}
				isActive={href === item.href}
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
	);
};

export default NavigationItem;
