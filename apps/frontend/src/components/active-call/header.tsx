'use client';
import { PopoverClose } from '@radix-ui/react-popover';
import { Filter, Rocket, SquareArrowOutUpRight, X } from 'lucide-react';
import { getDateOffset } from '@/utils/date';
import Timer from '../timer';
import { Button, buttonVariants } from '../ui/button';
import { CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type Props = {
	queueName: string;
};

const ActiveCallHeader = ({ queueName }: Props) => {
	// if (!task) return null
	// const offsetTimestamp = getDateOffset(task.dateUpdated)

	return (
		<CardHeader className='flex-row items-center justify-between p-3 gap-3 space-y-0'>
			<CardTitle className='space-x-1.5 flex items-center'>
				<Rocket className='inline-block text-yellow-400' />

				<span className='text-sm font-normal'>{queueName}</span>

				{/* <Timer
					stopwatchSettings={{
						autoStart: true,
						// offsetTimestamp,
					}}
					className='text-sm text-muted-foreground'
				/> */}
			</CardTitle>

			<div className='flex items-center gap-1.5'>
				{/* <Link
                    href={`/?${searchParams.toString()}`}
                    className={buttonVariants({
                        variant: 'ghost',
                        size: 'icon',
                        className: 'p-0 w-9 h-9',
                    })}
                >
                    <Filter className="text-muted-foreground" />
                </Link> */}

				<Tooltip>
					<TooltipTrigger asChild>
						<PopoverClose asChild>
							<Button
								variant='ghost'
								size='smIcon'
							>
								<X />
							</Button>
						</PopoverClose>
					</TooltipTrigger>

					<TooltipContent>Dismiss</TooltipContent>
				</Tooltip>
			</div>
		</CardHeader>
	);
};

export default ActiveCallHeader;
