import { cn } from '@/lib/utils';
import React from 'react';

type Props = {
	title: string;
	description?: string;
	className?: string;
	children: React.ReactNode;
};

const SettingPageWrap = ({ title, description, className, children }: Props) => {
	return (
		<div className={cn('max-w-[640px] px-9 mx-auto w-full py-12', className)}>
			<section className='flex flex-col gap-1.5'>
				<h1 className='text-2xl font-medium'>{title}</h1>

				{description && <p className='text-sm text-muted-foreground leading-6'>{description}</p>}
			</section>

			{children}
		</div>
	);
};

export default SettingPageWrap;
