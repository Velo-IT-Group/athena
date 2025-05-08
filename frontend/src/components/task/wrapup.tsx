import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Task } from 'twilio-taskrouter';
import { PopoverClose } from '@radix-ui/react-popover';
import { useTaskContext } from '../active-call/context';

type Props = {
	task: Task;
};

const TaskWrapup = ({ task }: Props) => {
	const { completeTask } = useTaskContext();

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
					onClick={() => completeTask?.mutate()}
				>
					Complete
				</Button>
			</CardFooter>
		</Card>
	);
};

export default TaskWrapup;
