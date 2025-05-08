import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';
import React from 'react';

type Props = {
	activityName: string;
	hideName?: boolean;
	className?: string;
};

const activityColors: Map<string, string> = new Map();
activityColors.set('Available', 'bg-green-500');
activityColors.set('Unavailable', 'bg-red-500');
activityColors.set('Offline', 'bg-slate-500');
activityColors.set('Break', 'bg-purple-500');
activityColors.set('On-Site', 'bg-yellow-500');

const ActivityListItem = ({ activityName, hideName, className }: Props) => {
	return (
		<div className='flex items-center gap-1.5'>
			<Circle
				className={cn(
					'stroke-white dark:stroke-black rounded-full',
					activityColors.get(activityName),
					className
				)}
			/>

			<span className={cn(hideName && 'sr-only')}>{activityName}</span>
		</div>
	);
};

export default ActivityListItem;
