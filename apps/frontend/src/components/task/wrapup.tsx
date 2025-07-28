'use client';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Reservation, Task } from 'twilio-taskrouter';
import { PopoverClose } from '@radix-ui/react-popover';
import { useMutation } from '@tanstack/react-query';

type Props = {
	reservation: Reservation;
};

const TaskWrapup = ({ reservation }: Props) => {
	const completeReservation = useMutation({
		mutationKey: ['reservation', 'complete'],
		mutationFn: async () => reservation.complete(),
	});

	return (
		<Card className='border-none'>
			<CardHeader className='flex-row justify-between items-center p-3 gap-12 '>
				<CardTitle className='text-lg'>Wrapping</CardTitle>

				<CardDescription>
					<PopoverClose asChild>
						<Button
							variant='ghost'
							size='icon'
							className='p-0 w-9 h-9'
						>
							<X className='inline-block text-gray-400 cursor-pointer' />
						</Button>
					</PopoverClose>
				</CardDescription>
			</CardHeader>

			<CardFooter className='pt-0'>
				<Button
					className='w-full'
					disabled={completeReservation.isPending}
					onClick={() => completeReservation.mutate()}
				>
					{completeReservation.isPending
						? 'Completing...'
						: 'Complete'}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default TaskWrapup;
