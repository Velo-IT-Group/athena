import {
	voiceAttributesSchema,
	voicemailAttributesSchema,
} from '@athena/utils';
import { PopoverClose } from '@radix-ui/react-popover';
import { Call } from '@twilio/voice-sdk';
import { Loader2, Rocket, User, Voicemail, X } from 'lucide-react';
import type { Reservation } from 'twilio-taskrouter';
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
import { useCall } from '@/hooks/use-call';
import { env } from '@/lib/utils';

type Props = {
	reservation: Reservation;
	call?: Call;
};

const PendingReservation = ({ reservation, call }: Props) => {
	const { data: voiceAttributes } = voiceAttributesSchema.safeParse(
		reservation.task.attributes
	);

	const { acceptCall, rejectCall, status } = useCall({ call });

	if (voiceAttributes && voiceAttributes.direction === 'inbound') {
		return (
			<Card className='shadow-none border-none'>
				<CardHeader className='flex-row justify-between space-y-0 items-center p-3 gap-3'>
					<CardTitle className='flex items-center'>
						<Rocket className='h-3.5 w-3.5 inline-block mr-1.5 text-yellow-400' />
						<span className='text-sm font-normal'>
							{reservation.task.queueName}
						</span>
					</CardTitle>

					<CardDescription className='flex items-center gap-1.5'>
						<span className='text-nowrap text-xs'>
							Incoming call
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

					<p className='ext-center font-medium text-sm'>
						{voiceAttributes.name}{' '}
						<span className='text-muted-foreground text-xs'>
							is calling {reservation.task.queueName}
						</span>
					</p>
				</CardContent>

				<CardFooter className='flex justify-center space-x-3'>
					<Button
						variant='destructive'
						className='text-sm'
						onClick={async () => rejectCall?.mutate()}
						disabled={
							rejectCall.isPending ||
							status === Call.State.Connecting
						}
					>
						{rejectCall.isPending ? 'Declining...' : 'Decline'}
					</Button>

					<Button
						variant='accepting'
						size={'sm'}
						className='text-sm'
						onClick={() => acceptCall.mutate()}
						disabled={
							acceptCall.isPending ||
							status === Call.State.Connecting
						}
					>
						{acceptCall.isPending ||
							(status === Call.State.Connecting && (
								<Loader2 className='animate-spin' />
							))}
						{acceptCall.isPending ||
						status === Call.State.Connecting
							? 'Accepting...'
							: 'Accept'}
					</Button>
				</CardFooter>
			</Card>
		);
	}

	const { data: voicemailAttributes } = voicemailAttributesSchema.safeParse(
		reservation.task.attributes
	);

	if (voicemailAttributes)
		return (
			<Card className='shadow-none border-none'>
				<CardHeader className='flex-row justify-between space-y-0 items-center p-3 gap-3'>
					<CardTitle className='flex items-center'>
						<Voicemail className='mr-1.5 inline-block text-yellow-400' />
					</CardTitle>

					<CardDescription className='flex items-center gap-1.5'>
						<span className='text-nowrap text-xs'>
							Incoming Voicemail
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

					<p className='ext-center font-medium text-sm'>
						{voicemailAttributes.name}{' '}
						<span className='text-muted-foreground text-xs'>
							left a voicemail
						</span>
					</p>
				</CardContent>

				<CardFooter className='flex justify-center space-x-3'>
					<Button
						variant='destructive'
						className='text-sm'
						onClick={async () =>
							await reservation?.reject({
								activitySid:
									env.VITE_TWILIO_DEFAULT_ACTIVITY_SID,
							})
						}
					>
						Decline
					</Button>

					<Button
						variant='accepting'
						size={'sm'}
						className='text-sm'
						onClick={async () => await reservation?.accept()}
					>
						Accept
					</Button>
				</CardFooter>
			</Card>
		);
	return null;
};

export default PendingReservation;
