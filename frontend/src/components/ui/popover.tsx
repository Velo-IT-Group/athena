import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

function Popover({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return (
		<PopoverPrimitive.Root
			data-slot='popover'
			{...props}
		/>
	);
}

function PopoverTrigger({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return (
		<PopoverPrimitive.Trigger
			data-slot='popover-trigger'
			{...props}
		/>
	);
}

function PopoverContent({
	className,
	align = 'center',
	sideOffset = 4,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-slot='popover-content'
				align={align}
				sideOffset={sideOffset}
				className={cn(
					'bg-popover flex flex-col gap-[1px] p-0 rounded-xl overflow-auto max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popper-available-width)] z-50',
					className
				)}
				style={{
					boxShadow:
						'rgba(24, 39, 75, 0.04) 0px 0px 0px 1px, rgba(24, 39, 75, 0.12) 0px 4px 8px -4px, rgba(24, 39, 75, 0.16) 0px 4px 12px -2px',
				}}
				// className={cn(
				// 	'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
				// 	className
				// )}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
}

const ModalPopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
	// <PopoverPrimitive.Portal>
	<PopoverPrimitive.Content
		ref={ref}
		align={align}
		sideOffset={sideOffset}
		className={cn(
			'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
			className
		)}
		{...props}
	/>
	// </PopoverPrimitive.Portal>
));
ModalPopoverContent.displayName = PopoverPrimitive.Content.displayName;

function PopoverAnchor({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
	return (
		<PopoverPrimitive.Anchor
			data-slot='popover-anchor'
			{...props}
		/>
	);
}

export {
	Popover,
	PopoverTrigger,
	PopoverContent,
	ModalPopoverContent,
	PopoverAnchor,
};
