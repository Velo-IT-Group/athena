'use client';
import { cn } from '@/lib/utils';
import { useLocation } from '@tanstack/react-router';
import React from 'react';
import { Button } from '@/components/ui/button';
import type { NavItem } from '@/types/nav';
import { Link } from '@tanstack/react-router';

const NavigationTabs = ({ tabs, children }: { tabs: NavItem[]; children?: React.ReactNode }) => {
	const pathname = useLocation({
		select: (location) => location.pathname,
	});

	return (
		<div className='w-full border-b bg-background'>
			{/* <div className='flex items-center px-3'>
				{tabs.map((path) => (
					<Link
						key={path.href}
						to={path.href}
						className={cn(
							'relative pb-2 transition-colors ease-in-out',
							pathname === path.href ? '' : 'border-b-2 border-none text-muted-foreground'
						)}
					>
						{pathname === path.href && (
							<div className='block absolute h-0 left-2 right-2 bottom-0 border-b-2 border-primary duration-200' />
						)}
						<Button
							variant='ghost'
							className='font-light'
						>
							{path.icon && <path.icon className='mr-1.5 size-3' />}
							<span className='text-sm'>{path.title}</span>
						</Button>
					</Link>
				))}
				{children}
			</div> */}
		</div>
	);
};

export default NavigationTabs;
