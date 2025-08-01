import { PopoverClose } from '@radix-ui/react-popover';
import { Phone, Voicemail, X } from 'lucide-react';
import type { Reservation } from 'twilio-taskrouter';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useTwilio } from '@/contexts/twilio-provider';
import { env } from '@/lib/utils';

interface Props {
	reservation: Reservation;
}

const VoicemailTask = ({ reservation }: Props) => {
	const { createEngagement } = useTwilio();

	return (
		<Card className='shadow-none border-none'>
			<CardHeader className='flex-row justify-between space-y-0 items-center p-3 gap-3 border-b'>
				<CardTitle className='flex items-center'>
					<Voicemail className='inline-block mr-1.5 text-yellow-400' />
					<span className='text-sm font-normal text-nowrap'>
						New Voicemail
					</span>
				</CardTitle>

				<CardDescription className='flex items-center gap-1.5'>
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
				<audio
					className='w-full'
					src={reservation.task.attributes.conversations.segment_link}
					controls
				/>
			</CardContent>

			<CardFooter className='flex justify-center space-x-3'>
				<Button
					variant='destructive'
					className='text-sm'
					onClick={async () => {
						await Promise.all([
							createEngagement.mutateAsync({
								to: reservation.task.attributes?.from,
								from:
									reservation.task.attributes.to ??
									env.VITE_TWILIO_PHONE_NUMBER,
								channel: 'voice',
								direction: 'outbound',
								name: reservation.task.attributes?.name,
								territoryName: '',
								companyId:
									reservation.task.attributes?.companyId,
								userId: reservation.task.attributes?.userId,
							}),
							reservation.complete(),
						]);
					}}
				>
					<Phone className='mr-1.5' />
					<span>Call</span>
				</Button>

				<Button
					variant='destructive'
					className='text-sm'
					onClick={() => {
						reservation.task?.wrapUp({ reason: 'Wrapped up' });
					}}
				>
					<span>Wrapup Voicemail</span>
				</Button>
			</CardFooter>
		</Card>
	);
};

export default VoicemailTask;
