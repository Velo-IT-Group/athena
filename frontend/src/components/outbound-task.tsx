import { Phone, Rocket, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PopoverClose } from '@radix-ui/react-popover';
import { Reservation, Task } from 'twilio-taskrouter';
import { useDevice } from '@/providers/device-provider';

type Props = {
	reservation: Reservation;
	task: Task;
};

const OutboundTask = ({ task }: Props) => {
	const { activeCall } = useDevice();

	return (
		<Card className='shadow-none border-none'>
			<CardHeader className='flex-row items-center p-3 gap-3 border-b justify-between space-y-0'>
				<CardTitle className='flex items-center gap-1.5'>
					<Rocket className='inline-block mr-1.5 text-yellow-400' />
					<span className='text-sm font-normal text-nowrap'>{task?.queueName}</span>
				</CardTitle>

				<CardDescription className='flex items-center gap-1.5'>
					<span className='text-nowrap'>Outbound call</span>

					<PopoverClose>
						<X className='h-3.5 w-3.5 inline-block text-gray-400 cursor-pointer' />
					</PopoverClose>
				</CardDescription>
			</CardHeader>

			<CardContent className='flex flex-col items-center p-3 space-y-3'>
				<Avatar>
					<AvatarFallback>UC</AvatarFallback>
				</Avatar>

				<div className='text-center'>
					<p className='font-medium text-sm'>{task?.attributes?.outbound_to}</p>
					<p className='text-gray-400 text-xs'>{task?.queueName}</p>
				</div>
			</CardContent>

			<CardFooter className='flex justify-center space-x-3'>
				<Button
					variant='destructive'
					className='text-sm'
					onClick={() => activeCall?.disconnect()}
				>
					<Phone className='rotate-[135deg] mr-1.5' />
					End Call
				</Button>
			</CardFooter>
		</Card>
	);
};

export default OutboundTask;
