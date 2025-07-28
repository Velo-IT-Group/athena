import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
	icon: LucideIcon;
}

const Widget = React.forwardRef<HTMLDivElement, Props>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(className, 'relative h-[86px]')}
				style={
					{
						// boxShadow: 'rgb(238, 239, 241) 0px 0px 0px 1px inset',
					}
				}
				{...props}
			>
				<div className='inset-shadow-[0px_0px_0px_1px_rgb(238,239,241)] rounded-lg bg-background min-h-[86px] max-h-[192px] flex flex-col absolute inset-0'>
					<div className='flex flex-col overflow-hidden flex-[1_1_auto] relative'>
						<div className='flex flex-row items-center justify-between px-3 pt-2.5 gap-2'>
							<div className='text-muted-foreground text-xs font-medium tracking-tight'>
								{props.title}
							</div>

							<props.icon className='h-3.5 w-3.5 text-muted-foreground' />
						</div>

						<div className='overflow-hidden relative flex-[0_1_auto] px-0 pb-2.5 pt-2.5 flex flex-col items-stretch border-none bg-none my-auto'>
							<div className='px-3 h-full relative flex flex-col items-stretch justify-end gap-0'>
								{props.children}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
);

export default Widget;
