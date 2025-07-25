import DevicePicker from '@/components/device-picker';
import { Dialpad } from '@/components/dialpad';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { useTwilio } from '@/contexts/twilio-provider';
import { useCall } from '@/hooks/use-call';
import { Call } from '@twilio/voice-sdk';
import { Grip, Headset, Loader2, Mic, MicOff, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Reservation } from 'twilio-taskrouter';

type Props = {
	call: Call;
	reservation?: Reservation;
};

const CallCard = ({ call, reservation }: Props) => {
	const { setActiveEngagement } = useTwilio();
	const {
		status,
		acceptCall,
		rejectCall,
		toggleMute,
		disconnectCall,
		sendDigits,
	} = useCall({
		call,
		onDisconnect: () =>
			setActiveEngagement((prev) => ({ ...prev, call: undefined })),
		onCancel: () =>
			setActiveEngagement((prev) => ({ ...prev, call: undefined })),
		onReject: () =>
			setActiveEngagement((prev) => ({ ...prev, call: undefined })),
		onVolume(inputVolume, outputVolume) {
			// setInputVolume(inputVolume);
			// setOutputVolume(outputVolume);
		},
	});

	return (
		<div className='flex items-center gap-3'>
			{/* <Progress
				aria-orientation='vertical'
				value={inputVolume * 100}
				className='h-full w-3.5'
			/>
			<Progress
				aria-orientation='vertical'
				value={outputVolume * 100}
				className='h-full w-3.5'
			/> */}

			<Card className='dark w-[356px]'>
				<CardHeader className='flex-row items-center justify-between pt-0'>
					<div>
						<CardTitle>{call.parameters.From}</CardTitle>
					</div>

					{status === Call.State.Pending && (
						<Button
							variant='ghost'
							size='sm'
						>
							<X />
						</Button>
					)}
				</CardHeader>

				<CardContent>
					{/* <p>{status}</p> */}

					{status === Call.State.Reconnecting && (
						<div>Reconnecting...</div>
					)}
				</CardContent>

				<CardFooter className='flex-row gap-2 px-0 pb-0'>
					{(status === Call.State.Pending ||
						status === Call.State.Ringing) && (
						<>
							<Button
								variant='accepting'
								onClick={() => acceptCall.mutate()}
								disabled={acceptCall.isPending}
							>
								{acceptCall.isPending ? (
									<Loader2 className='animate-spin' />
								) : (
									<Phone />
								)}
								<span>Accept</span>
							</Button>

							<Button
								variant='destructive'
								onClick={() => {
									rejectCall.mutate();
									// toast.dismiss(toastId);
								}}
								disabled={rejectCall.isPending}
							>
								<Phone className='rotate-[135deg] mr-1.5' />
								<span>Reject</span>
							</Button>
						</>
					)}

					{status === Call.State.Open && (
						<div className='flex-1 flex justify-between'>
							<Button
								size='icon'
								variant={
									!call.isMuted()
										? 'accepting'
										: 'destructive'
								}
								onClick={() => toggleMute.mutate()}
							>
								{!call.isMuted() ? <Mic /> : <MicOff />}
							</Button>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										size='icon'
										variant='outline'
									>
										<Headset />
									</Button>
								</PopoverTrigger>

								<PopoverContent>
									<DevicePicker />
								</PopoverContent>
							</Popover>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										size='icon'
										variant='outline'
									>
										<Grip />
									</Button>
								</PopoverTrigger>

								<PopoverContent>
									<Dialpad
										onValueChange={(value) =>
											sendDigits.mutate(value)
										}
									/>
								</PopoverContent>
							</Popover>

							<Button
								size='icon'
								variant='destructive'
								onClick={() => disconnectCall.mutate()}
								disabled={disconnectCall.isPending}
							>
								<Phone className='rotate-[135deg]' />
							</Button>
						</div>
					)}
				</CardFooter>
			</Card>
		</div>
	);
};

export default CallCard;
