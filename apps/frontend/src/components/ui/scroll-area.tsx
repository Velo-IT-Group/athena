import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { cn } from '@/lib/utils';

function ScrollArea({
	className,
	children,
	...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
	return (
		<ScrollAreaPrimitive.Root
			data-slot='scroll-area'
			className={cn('relative', className)}
			{...props}
		>
			<style>
				{`

[data-radix-scroll-area-viewport] {
scrollbar-width: none;
-ms-overflow-style: none;
-webkit-overflow-scrolling: touch;
}
[data-radix-scroll-area-viewport]::-webkit-scrollbar {
display: none;
}
:where([data-radix-scroll-area-viewport]) {
display: flex;
flex-direction: column;
align-items: stretch;
}
:where([data-radix-scroll-area-content]) {
flex-grow: 1;
}
					
				`}
			</style>
			<ScrollAreaPrimitive.Viewport
				data-slot='scroll-area-viewport'
				className='!flex !min-w-0 flex-col size-full max-h-100% scroll-pt-16'
				style={{ overflow: 'visible !important' }}
				asChild
			>
				<div data-radix-scroll-area-content=''>{children}</div>
			</ScrollAreaPrimitive.Viewport>
			{/* <ScrollBar /> */}
			{/* <ScrollAreaPrimitive.Corner /> */}
		</ScrollAreaPrimitive.Root>
	);
}

function ScrollBar({
	className,
	orientation = 'vertical',
	...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
	return (
		<ScrollAreaPrimitive.ScrollAreaScrollbar
			data-slot='scroll-area-scrollbar'
			orientation={orientation}
			className={cn(
				'flex touch-none p-px transition-colors select-none',
				orientation === 'vertical' &&
					'h-full w-2.5 border-l border-l-transparent',
				orientation === 'horizontal' &&
					'h-2.5 flex-col border-t border-t-transparent',
				className
			)}
			{...props}
		>
			<ScrollAreaPrimitive.ScrollAreaThumb
				data-slot='scroll-area-thumb'
				className='bg-border relative flex-1 rounded-full'
			/>
		</ScrollAreaPrimitive.ScrollAreaScrollbar>
	);
}

export { ScrollArea, ScrollBar };
