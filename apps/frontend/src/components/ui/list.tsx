'use client';

import { cn } from '@/lib/utils';

function List({ className, ...props }: React.ComponentProps<'ul'>) {
	return (
		<ul
			data-slot='list'
			className={cn('flex flex-col gap-1.5', className)}
			{...props}
		/>
	);
}

function ListGroup({
	className,
	...props
}: React.ComponentProps<'ul'> & { heading?: React.ReactNode }) {
	return (
		<ul
			role='group'
			data-slot='list-group'
			className={cn('flex flex-col', className)}
			{...props}
		>
			{props.heading && (
				<div
					role='presentation'
					aria-owns=':r2q:'
					className='top-8 flex gap-1 h-8 flex-[1_1_auto] px-4 py-2 bg-muted sticky z-[1] inset-shadow-[0_-1px_0px_0px_var(--border)]'
				>
					<div className='flex items-center justify-start gap-1 grow'>
						<div
							className='text-xs font-medium tracking-tight text-muted-foreground data-truncate:truncate date-numeric:tabular-nums data-uppercase:uppercase grow'
							data-truncate={false}
							data-numeric={false}
							data-uppercase={false}
						>
							<div
								className='text-xs font-medium tracking-tight text-muted-foreground data-truncate:truncate date-numeric:tabular-nums data-uppercase:uppercase'
								data-truncate={true}
								data-numeric={false}
								data-uppercase={false}
								// style='color: rgb(80, 81, 84);'
							>
								{props.heading}
							</div>
						</div>
						{/* <span
							data-variant='tertiary'
							data-size='14'
							className='text-[10px] leading-[14px] h-3.5 rounded-[4px] px-1 font-medium tracking-tight bg-muted/50 text-muted-foreground inset-ring-muted-foreground'
						>
							1
						</span> */}
					</div>
				</div>
			)}
			{props.children}
		</ul>
	);
}

function ListItem({ className, ...props }: React.ComponentProps<'li'>) {
	return (
		<li
			data-slot='list-item'
			className={cn('flex gap-1.5', className)}
			{...props}
		/>
	);
}

export { List, ListGroup, ListItem };
