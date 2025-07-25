import { Button, buttonVariants } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

export interface RecordDetailProps {
	icon: LucideIcon;
	title: string;
	placeholder?: string;
	value?: string | number | React.ReactNode;
	children?: React.ReactNode;
}

const RecordDetail = ({
	title,
	value,
	placeholder,
	children,
	...props
}: RecordDetailProps) => {
	if (!children)
		return (
			<div className='flex flex-row items-center justify-start gap-1.5'>
				<div className='w-[clamp(80px,40%,125px)] min-h-8 shrink-0 flex items-center justify-start gap-1.5'>
					{props.icon && (
						<props.icon className='flex-[0_0_auto] size-3.5' />
					)}
					<div className='min-w-0 font-inter font-medium text-xs flex items-center w-full'>
						<div className='shrink-0 text-ellipsis overflow-hidden whitespace-nowrap'>
							{title}
						</div>
					</div>
				</div>

				<div className='flex flex-row items-center min-h-8 flex-[1_1_auto] overflow-hidden w-full'>
					<div
						className={cn(
							buttonVariants({
								variant: 'ghost',
								size: 'default',
								className:
									'truncate grow justify-start data-[state=open]:inset-shadow-[0_0px_0px_1px_rgb(238,239,241)]',
							})
						)}
					>
						{value}
					</div>
				</div>
			</div>
		);

	return (
		<Popover>
			<div className='flex flex-row items-center justify-start gap-1.5'>
				<div className='w-[clamp(80px,40%,125px)] min-h-8 shrink-0 flex items-center justify-start gap-1.5'>
					{props.icon && (
						<props.icon className='flex-[0_0_auto] size-3.5' />
					)}
					<div className='min-w-0 font-inter font-medium text-xs flex items-center w-full'>
						<div className='shrink-0 text-ellipsis overflow-hidden whitespace-nowrap'>
							{title}
						</div>
					</div>
				</div>

				<div className='flex flex-row items-center min-h-8 flex-[1_1_auto] overflow-hidden w-full'>
					<PopoverTrigger asChild>
						<div
							className={cn(
								buttonVariants({
									variant: 'ghost',
									size: 'default',
									className:
										'truncate grow justify-start data-[state=open]:inset-shadow-[0_0px_0px_1px_rgb(238,239,241)]',
								})
							)}
						>
							{value}
						</div>
					</PopoverTrigger>
				</div>
			</div>

			<PopoverContent
				align='start'
				className='w-[var(--radix-popover-trigger-width)]'
			>
				{children}
			</PopoverContent>
		</Popover>
	);
};

export default RecordDetail;
