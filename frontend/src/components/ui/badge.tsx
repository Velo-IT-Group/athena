import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
	'inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
				secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
				destructive:
					'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : 'span';

	return (
		<Comp
			data-slot='badge'
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

const coloredBadgeVariants = cva(
	'inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium ring-1 ring-inset',
	{
		variants: {
			variant: {
				gray: 'bg-gray-50 text-gray-600 fill-gray-600 ring-gray-500/10',
				red: 'bg-red-50 text-red-700 fill-red-700 ring-red-600/10',
				yellow: 'bg-yellow-50 text-yellow-800 fill-yellow-800 ring-yellow-600/20',
				green: 'bg-green-50 text-green-700 fill-green-700 ring-green-600/20',
				blue: 'bg-blue-50 text-blue-700 fill-blue-700 ring-blue-700/10',
				indigo: 'bg-indigo-50 text-indigo-700 fill-indigo-700 ring-indigo-700/10',
				purple: 'bg-purple-50 text-purple-700 fill-purple-700 ring-purple-700/10',
				pink: 'bg-pink-50 text-pink-700 fill-pink-700 ring-pink-700/10',
			},
		},
		defaultVariants: {
			variant: 'gray',
		},
	}
);

export interface ColoredBadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof coloredBadgeVariants> {}

const ColoredBadge = React.forwardRef<HTMLDivElement, ColoredBadgeProps>(({ className, variant, ...props }, ref) => {
	return (
		<div
			className={cn(coloredBadgeVariants({ variant }), className)}
			{...props}
		/>
	);
});

export { Badge, badgeVariants, ColoredBadge, coloredBadgeVariants };
