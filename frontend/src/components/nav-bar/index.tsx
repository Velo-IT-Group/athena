import React from 'react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type Props = {
	hideToggle?: boolean;
	className?: string;
	children?: React.ReactNode;
};

const Navbar = ({ className, hideToggle, children }: Props) => {
	return (
		<header
			className={cn(
				'sticky top-0 z-50 flex h-[var(--navbar-height)] w-full shrink-0 items-center justify-around gap-3 border-b bg-sidebar px-3',
				className
			)}
		>
			<div className='flex items-center gap-1.5'>
				{!hideToggle && <SidebarTrigger />}

				<img
					src='/VeloLogo-Black.png'
					className='h-[16px] object-contain dark:hidden'
				/>

				<img
					src='/VeloLogo-White.png'
					className='h-[16px] object-contain hidden dark:block'
				/>
			</div>

			{children}
		</header>
	);
};

export default Navbar;
