import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { NavItem, NavSection } from '@/types/nav';
import { Link, useLocation, useRouter } from '@tanstack/react-router';

export default function TabsList({
	tabs: sections,
	className,
}: {
	tabs: NavSection[];
	className?: string;
}) {
	const pathname = useLocation({ select: (l) => l.pathname });
	const router = useRouter();

	return (
		<div
			className={cn(
				'relative pb-2 flex-[0_0_auto] px-3 flex max-w-full after:absolute after:bottom-0 after:left-0 after:w-full after:block after:h-[1px] after:rounded-[2px] after:bg-muted',
				className
			)}
		>
			<ul className='flex max-w-full list-none items-center gap-3'>
				{sections.map((section, index) => (
					<>
						<div
							key={`section-${index}`}
							className='flex items-center gap-1'
						>
							{section.items.map((link) => {
								const resolvedLink = router.buildLocation(link);

								return (
									<TabItem
										key={link.title}
										tab={link}
										active={
											pathname === resolvedLink.pathname
										}
									/>
								);
							})}
						</div>

						<Separator
							orientation='vertical'
							className='data-[orientation=vertical]:h-4 last:hidden'
						/>
					</>
				))}
			</ul>
		</div>
	);
}

export const TabItem = ({ tab, active }: { tab: NavItem; active: boolean }) => (
	<Link
		className='after:content-[""] after:hidden after:w-full after:h-[1px] after:rounded-[2px] after:bg-foreground after:absolute after:-bottom-2 after:left-0 after:z-[1] data-[active=true]:after:block data-[active=true]:text-foreground rounded-md py-1 px-2 gap-1.5 transition-all flex items-center relative text-muted-foreground hover:text-foreground shadow-[0_0px_0px_1px_oklch(0.28 0.01 0)] data-[active=true]:inset-shadow-[0px_0px_0px_1px_var(--border)] data-[active=true]:bg-muted/25'
		tabIndex={0}
		{...tab}
		data-active={active}
	>
		{tab.icon && (
			<span className='flex items-center justify-center shrink-0'>
				<tab.icon className='transition-colors size-3.5' />
			</span>
		)}

		<span className='transition-colors overflow-hidden flex-[1_1_auto] max-w-full font-medium text-sm leading-5 text-ellipsis'>
			{tab.title}
		</span>

		{tab.badge && (
			<span
				className='relative gap-1 tabular-nums inline-flex items-center justify-center font-medium rounded font-weight text-[10px] leading-[14px] h-[14px] shadow px-1 bg-muted inset-shadow-[0px_0px_0px_1px_var(--border)]'
				style={
					{
						// boxShadow: 'rgb(238, 239, 241) 0px 0px 0px 1px inset',
						// color: 'rgb(80, 81, 84)',
						// backgroundColor: 'rgb(244, 245, 246)',
					}
				}
			>
				{tab.badge}
			</span>
		)}
	</Link>
);
