import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

function Progress({
	className,
	value,
	indicatorClassName,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
	indicatorClassName?: string;
}) {
	return (
		<ProgressPrimitive.Root
			data-slot='progress'
			className={cn('relative h-3.5 w-full overflow-hidden rounded-full bg-secondary', className)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot='progress-indicator'
				className={cn('h-full w-full flex-1 bg-primary transition-all', indicatorClassName)}
				style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
