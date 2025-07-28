import { Rocket, User, Voicemail, X } from 'lucide-react';
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
import { useTwilio } from '@/contexts/twilio-provider';
import { useCall } from '@/hooks/use-call';
import { VoiceAttributes } from '@athena/utils';

const IncomingTask = ({
	attributes,
}: {
	attributes: VoiceAttributes & {
		direction: 'inbound';
	};
}) => {
	const { activeEngagement } = useTwilio();
	const { call, acceptCall, rejectCall } = useCall({
		call: activeEngagement?.call,
	});

	if (!activeEngagement) return null;

	const { task } = activeEngagement.reservation;

	const isVoicemail = attributes.taskType === 'voicemail';

	return (
		<Card className='shadow-none border-none'>
			<CardHeader className='flex-row justify-between space-y-0 items-center p-3 gap-3'>
				<CardTitle className='flex items-center'>
					{isVoicemail ? (
						<Voicemail className='mr-1.5 inline-block text-yellow-400' />
					) : (
						<Rocket className='h-3.5 w-3.5 inline-block mr-1.5 text-yellow-400' />
					)}
					<span className='text-sm font-normal'>
						{task.queueName}
					</span>
				</CardTitle>

				<CardDescription className='flex items-center gap-1.5'>
					<span className='text-nowrap text-xs'>
						{isVoicemail ? 'Incoming Voicemail' : 'Incoming call'}
					</span>

					<PopoverClose asChild>
						<Button
							variant='ghost'
							size='smIcon'
						>
							<X className='inline-block text-gray-400 cursor-pointer' />
						</Button>
					</PopoverClose>
				</CardDescription>
			</CardHeader>

			<CardContent className='flex flex-col items-center p-3 space-y-3'>
				<Avatar>
					<AvatarFallback className='text-muted-foreground'>
						<User className='size-5' />
					</AvatarFallback>
				</Avatar>

				<div className='text-center'>
					<p className='font-medium text-sm'>{attributes.name}</p>

					<p className='text-gray-400 text-xs'>
						{isVoicemail
							? 'left voicemail'
							: `is calling ${task.queueName}`}
					</p>
				</div>
			</CardContent>

			<CardFooter className='flex justify-center space-x-3'>
				<Button
					variant='destructive'
					className='text-sm'
					onClick={async () => {
						if (call) {
							rejectCall.mutate();
						}
					}}
					disabled={rejectCall.isPending}
				>
					{rejectCall.isPending ? 'Declining...' : 'Decline'}
				</Button>

				<Button
					variant='accepting'
					size={'sm'}
					className='text-sm'
					onClick={async () => {
						if (call) {
							acceptCall.mutate();
						}
					}}
					disabled={acceptCall.isPending}
				>
					{acceptCall.isPending ? 'Accepting...' : 'Accept'}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default IncomingTask;
