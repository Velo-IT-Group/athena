import { cn } from '@/lib/utils';
import type { NavItem } from '@/types/nav';
import { Link, useLocation, useRouter } from '@tanstack/react-router';

export default function TabsList({ links, className }: { links: NavItem[]; className?: string }) {
	const pathname = useLocation({ select: (l) => l.pathname });
	const router = useRouter();

	return (
		<nav
			className={cn(
				'flex align-baseline relative flex-[0_0_auto] whitespace-nowrap w-full border-bg-background',
				className
			)}
		>
			<ul className='flex max-w-full list-none items-center'>
				{links.map((link) => {
					let resolvedLink = router.buildLocation(link);

					return (
						<Link
							key={link.title}
							className='relative'
							{...link}
						>
							<li className='whitespace-nowrap text-sm font-medium'>
								<div className='rounded-md px-1.5 py-3 h-5 flex items-center justify-center relative mb-1.5'>
									{link.icon && <link.icon className='size-3.5 mr-1.5' />}

									<span className='whitespace-nowrap overflow-hidden max-w-48 text-sm'>
										{link.title}
									</span>

									<div
										className={cn(
											'border-b-2 w-[calc(100%-9px)] absolute bottom-[-6px] border-primary rounded-se-2xl rounded-ss-2xl opacity-0 transition-opacity',
											pathname === resolvedLink.pathname && 'opacity-100'
										)}
									/>
								</div>
							</li>
						</Link>
					);
				})}
			</ul>
		</nav>
	);
}
