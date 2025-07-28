import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import ManageUserAvatar from '@/components/avatar/manage-user-avatar';

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

export interface ManageAvatarStackProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof avatarStackVariants> {
	avatars: { name: string; memberId?: number; contactId?: number }[];
	maxAvatarsAmount?: number;
	avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const ManageAvatarStack = ({
	className,
	orientation,
	avatars,
	maxAvatarsAmount = 3,
	avatarSize = 'sm',
	...props
}: ManageAvatarStackProps) => {
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
			{shownAvatars.map(({ name, memberId, contactId }, index) => (
				<Tooltip key={`${name}-${memberId}-${contactId}-${index}`}>
					<TooltipTrigger asChild>
						<ManageUserAvatar
							size={avatarSize}
							memberId={memberId}
							contactId={contactId}
							className='hover:z-10 group'
						/>
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
								avatarSize === 'md' && 'size-9',
								avatarSize === 'lg' && 'size-12',
								avatarSize === 'xl' && 'size-16'
							)}
						>
							<AvatarFallback>+{avatars.length - shownAvatars.length}</AvatarFallback>
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

export { ManageAvatarStack, avatarStackVariants };
