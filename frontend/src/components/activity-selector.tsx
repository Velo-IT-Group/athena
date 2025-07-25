import ActivityListItem from '@/components/activity-list-item';
import DevicePicker from '@/components/device-picker';
import { ListSelector } from '@/components/list-selector';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useTwilio } from '@/contexts/twilio-provider';
import { getActivitiesQuery } from '@/lib/twilio/api';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

type Props = {};

const ActivitySelector = () => {
	const [open, setOpen] = useState(false);
	const [hasDetectedAudio, setHasDetectedAudio] = useState(false);
	const { worker, device } = useTwilio();
	const { data, isLoading } = useQuery(getActivitiesQuery());
	const [attemptedActivity, setAttemptedActivity] = useState<string | null>(
		null
	);

	const handleInputVolume = useCallback((volume: number) => {
		if (volume < 0.2) return;
		setHasDetectedAudio(true);
	}, []);

	useEffect(() => {
		if (!device || hasDetectedAudio) return;

		device.audio?.on('inputVolume', handleInputVolume);

		return () => {
			device.audio?.off('inputVolume', handleInputVolume);
		};
	}, [device, hasDetectedAudio]);

	if (isLoading || !worker?.activity)
		return (
			<>
				<Button
					variant='outline'
					size='sm'
					disabled
				>
					<ActivityListItem activityName='Offline' />
				</Button>
			</>
		);

	return (
		<AlertDialog
			open={open}
			onOpenChange={setOpen}
		>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						size='sm'
					>
						<ActivityListItem
							activityName={worker?.activity?.name ?? ''}
						/>
					</Button>
				</PopoverTrigger>

				<PopoverContent
					className='w-80'
					align='center'
				>
					<ListSelector
						items={data ?? []}
						comparisonFn={(i) => i.sid === worker?.activity.sid}
						searchable={false}
						itemView={(a) => (
							<ActivityListItem activityName={a.friendlyName} />
						)}
						onSelect={(a) => {
							if (!worker) return;
							if (a.available && !hasDetectedAudio) {
								setOpen(true);
								setAttemptedActivity(a.sid);
								return;
							}
							worker.setWorkerActivity(worker.sid, a.sid);
						}}
					/>
				</PopoverContent>
			</Popover>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						No input volume detected.
					</AlertDialogTitle>

					<AlertDialogDescription>
						It appears no audio input is being detected. Please
						check your microphone settings. If you're okay with
						this, you can still set your activity to available.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<Card>
					<CardContent>
						<DevicePicker />
					</CardContent>
				</Card>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							if (!worker || !attemptedActivity) return;
							worker.setWorkerActivity(
								worker.sid,
								attemptedActivity
							);
							setAttemptedActivity(null);
						}}
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ActivitySelector;
