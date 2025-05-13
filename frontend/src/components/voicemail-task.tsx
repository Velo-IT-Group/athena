import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Voicemail, X } from 'lucide-react';
import { PopoverClose } from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';
import { Task } from 'twilio-taskrouter';
import { useWorker } from '@/providers/worker-provider';
import { env } from '@/lib/utils';

type Props = {
	task: Task;
};

const VoicemailTask = ({ task }: Props) => {
	const { worker } = useWorker();

	return (
		<Card className='shadow-none border-none'>
			<CardHeader className='flex-row justify-between space-y-0 items-center p-3 gap-3 border-b'>
				<CardTitle className='flex items-center'>
					<Voicemail className='inline-block mr-1.5 text-yellow-400' />
					<span className='text-sm font-normal text-nowrap'>New Voicemail</span>
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
					data-s='recording-instance-player'
					className='w-full'
					src={task.attributes.conversations.segment_link}
					controls
				/>
			</CardContent>

			<CardFooter className='flex justify-center space-x-3'>
				<Button
					variant='destructive'
					className='text-sm'
					onClick={async () => {
						worker?.createTask(
							task.attributes.from,
							task.attributes.to ?? env.VITE_TWILIO_PHONE_NUMBER,
							env.VITE_TWILIO_WORKFLOW_SID!,
							env.VITE_TWILIO_TASK_QUEUE_SID!,
							{
								attributes: {
									direction: 'outbound',
									name: task.attributes.name,
									companyId: task.attributes.companyId,
									userId: task.attributes.userId,
								},
								taskChannelUniqueName: 'voice',
							}
						);
					}}
				>
					<Phone className='mr-1.5' />
					<span>Call</span>
				</Button>

				<Button
					variant='destructive'
					className='text-sm'
					onClick={() => {
						task?.wrapUp({ reason: 'Wrapped up' });
					}}
				>
					<span>Wrapup Voicemail</span>
				</Button>
			</CardFooter>
		</Card>
	);
};

export default VoicemailTask;
