import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const avatarStackVariants = cva('flex -space-x-4 -space-y-4', {
	variants: {
		orientation: {
			vertical: 'flex-row',
			horizontal: 'flex-col',
		},
	},
	defaultVariants: {
		orientation: 'vertical',
	},
});

export interface AvatarStackProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof avatarStackVariants> {
	avatars: { name: string; image: string }[];
	maxAvatarsAmount?: number;
	showDeletion?: boolean;
	avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const AvatarStack = ({
	className,
	orientation,
	avatars,
	maxAvatarsAmount = 3,
	avatarSize = 'sm',
	showDeletion = false,
	...props
}: AvatarStackProps) => {
	const shownAvatars = avatars.slice(0, maxAvatarsAmount);
	const hiddenAvatars = avatars.slice(maxAvatarsAmount);

	return (
		<div
			className={cn(
				avatarStackVariants({ orientation }),
				className,
				orientation === 'horizontal' ? '-space-x-0' : '-space-y-0'
			)}
			{...props}
		>
			{shownAvatars.map(({ name, image }, index) => (
				<Tooltip key={`${name}-${image}-${index}`}>
					<TooltipTrigger asChild>
						<Avatar
							className={cn(
								'hover:z-10 size-7 group',
								avatarSize === 'xs' && 'size-5',
								avatarSize === 'md' && 'size-9',
								avatarSize === 'lg' && 'size-12',
								avatarSize === 'xl' && 'size-16'
							)}
						>
							<AvatarImage src={image} />
							<AvatarFallback
								style={{
									backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
										Math.random() * 255
									)}, ${Math.floor(Math.random() * 255)})`,
								}}
								className={cn(
									'text-sm text-white',
									avatarSize === 'xs' && 'text-xs',
									avatarSize === 'md' && 'text-md',
									avatarSize === 'lg' && 'text-lg',
									avatarSize === 'xl' && 'text-xl'
								)}
							>
								{name
									?.split(' ')
									?.map((word) => word[0])
									?.join('')
									?.toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</TooltipTrigger>
					<TooltipContent>
						<p>{name}</p>
					</TooltipContent>
				</Tooltip>
			))}

			{hiddenAvatars.length ? (
				<Tooltip key='hidden-avatars'>
					<TooltipTrigger asChild>
						<Avatar
							className={cn(
								'hover:z-10 size-7 group',
								avatarSize === 'xs' && 'size-5',
								avatarSize === 'md' && 'size-9',
								avatarSize === 'lg' && 'size-12',
								avatarSize === 'xl' && 'size-16'
							)}
						>
							<AvatarFallback>
								+{avatars.length - shownAvatars.length}
							</AvatarFallback>
						</Avatar>
					</TooltipTrigger>
					<TooltipContent>
						{hiddenAvatars.map(({ name }, index) => (
							<p key={`${name}-${index}`}>{name}</p>
						))}
					</TooltipContent>
				</Tooltip>
			) : null}
		</div>
	);
};

export { AvatarStack, avatarStackVariants };
