import { Loader2, Phone, Rocket, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { PopoverClose } from '@radix-ui/react-popover';
import { Reservation, Task } from 'twilio-taskrouter';
import { useTwilio } from '@/contexts/twilio-provider';
import { useCall } from '@/hooks/use-call';
import { VoiceAttributes } from '@/types/twilio';

interface Props {
	reservation: Reservation;
	attributes: VoiceAttributes & {
		direction: 'outbound';
	};
}

const OutboundTask = ({ reservation, attributes }: Props) => {
	const { activeEngagement } = useTwilio();

	const { disconnectCall } = useCall({ call: activeEngagement?.call });

	const initials = attributes.name
		?.split(' ')
		?.map((word) => word[0])
		?.join('')
		?.toUpperCase();

	return (
		<Card className='shadow-none border-none'>
			<CardHeader className='flex-row items-center p-3 gap-3 justify-between space-y-0'>
				<CardTitle className='flex items-center gap-1.5'>
					<Rocket className='inline-block mr-1.5 text-yellow-400' />
					<span className='text-sm font-normal text-nowrap'>
						{reservation.task?.queueName}
					</span>
				</CardTitle>

				<CardDescription className='flex items-center gap-1.5'>
					<span className='text-nowrap'>Outbound call</span>

					<PopoverClose>
						<X />
					</PopoverClose>
				</CardDescription>
			</CardHeader>

			<CardContent className='flex flex-col items-center p-3 space-y-3'>
				<Avatar>
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>

				<div className='text-center'>
					<p className='font-medium text-sm'>
						{attributes?.outbound_to}
					</p>
					<p className='text-gray-400 text-xs'>
						{reservation.task?.queueName}
					</p>
				</div>
			</CardContent>

			<CardFooter className='flex justify-center space-x-3'>
				<Button
					variant='destructive'
					className='text-sm'
					onClick={() => disconnectCall.mutate()}
					disabled={disconnectCall.isPending}
				>
					{disconnectCall.isPending ? (
						<Loader2 className='animate-spin' />
					) : (
						<Phone className='rotate-[135deg]' />
					)}
					<span>
						{disconnectCall.isPending
							? 'Ending Call...'
							: 'End Call'}
					</span>
				</Button>
			</CardFooter>
		</Card>
	);
};

export default OutboundTask;
