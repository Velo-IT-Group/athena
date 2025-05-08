import { useContext, createContext, useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { Device, type Call } from '@twilio/voice-sdk';
import { ConferenceInstance } from 'twilio/lib/rest/api/v2010/account/conference';
import { Reservation, Worker, type ActivityOptions, Task, type Activity, type Supervisor } from 'twilio-taskrouter';
import { useMutation, type UseMutateFunction, type UseMutationResult } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Headset, Loader2, Phone } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { type Conversation } from '@twilio/conversations';
import {
	DialogStack,
	DialogStackBody,
	DialogStackContent,
	DialogStackFooter,
	DialogStackHeader,
	DialogStackNext,
	DialogStackOverlay,
	DialogStackPrevious,
	DialogStackTitle,
} from '@/components/ui/dialog-stack';
import { useDevice } from '@/hooks/use-device';
import { useWorker as useWorkerHook } from '@/hooks/use-worker';
import { toast } from 'sonner';
interface WorkerProviderProps {
	worker: Supervisor | null;
	attributes: Record<string, any> | undefined;
	activity: Activity | undefined;
	updateWorkerActivity: UseMutateFunction<
		Worker | undefined,
		Error,
		{ sid: string; options: ActivityOptions },
		unknown
	>;
	engagements: Engagement[];
	handleComplete: UseMutationResult<void, Error, Engagement, unknown> | undefined;
	handleWrapup: UseMutationResult<void, Error, Engagement, unknown> | undefined;
}

const initialValues: WorkerProviderProps = {
	worker: null,
	attributes: undefined,
	activity: undefined,
	updateWorkerActivity: () => {},
	engagements: [],
	handleComplete: undefined,
	handleWrapup: undefined,
};

type WithChildProps = {
	authToken: string;
	children: React.ReactNode;
};

const context = createContext(initialValues);
const { Provider } = context;

export type Engagement = {
	call?: Call;
	conference?: ConferenceInstance;
	task?: Task;
	reservation?: Reservation;
	device?: Device;
	channel?: string;
	conversation?: Conversation;
};

export const WorkerProvider = ({ authToken, children }: WithChildProps) => {
	const navigate = useNavigate();
	const [engagements, setEngagements] = useState<Engagement[]>([]);
	const [openEngagementDialog, setOpenEngagementDialog] = useState(false);

	const handleIncomingCall = useCallback(
		(call: Call) => {
			const engagement = engagements.find((engagement) =>
				['voice', 'default'].includes(engagement.task?.taskChannelUniqueName ?? '')
			);
			console.log(engagements, engagement, call);
			const newEngagement = { ...engagement, call };
			console.log(newEngagement);
			const newEngagements = [...engagements.filter((e) => engagement?.task?.sid !== e.task?.sid), newEngagement];
			setEngagements(newEngagements);
			// setOpenEngagementDialog(true);
		},
		[engagements]
	);

	const handleReservationEvents = useCallback(
		(reservation: Reservation) => {
			setEngagements((prev) => [
				...prev.filter((e) => e.task?.sid !== reservation.task.sid),
				{ reservation, task: reservation.task },
			]);
			if (reservation.status === 'pending') {
				setOpenEngagementDialog(true);
			}
			if (reservation.task.taskChannelUniqueName === 'voice') {
				handleConference(reservation);
			}
		},
		[engagements]
	);

	const handleWorkerReady = useCallback(
		(worker: Worker) => {
			toast.success('Worker ready');
			Array.from(worker.reservations.values()).map((reservation) => {
				setEngagements((prev) => [
					...prev.filter((e) => e.task?.sid !== reservation.task.sid),
					{ reservation, task: reservation.task },
				]);
				if (reservation.status === 'pending') {
					setOpenEngagementDialog(true);
				}
				if (reservation.task.taskChannelUniqueName === 'voice') {
					handleConference(reservation);
				}
			});
		},
		[engagements]
	);

	const { device } = useDevice({
		token: authToken,
		onIncomingCall: handleIncomingCall,
		onDeviceRegistration: () => {
			toast.success('Device registered');
		},
	});

	const { worker, attributes, activity } = useWorkerHook({
		token: authToken,
		onReservationCreated: handleReservationEvents,
		// onWorkerReady: handleWorkerReady,
	});

	// /// Register the device when the user first clicks the page
	// useEffect(() => {
	// 	const device = new Device(authToken, {
	// 		disableAudioContextSounds: true,
	// 		enableImprovedSignalingErrorPrecision: true,
	// 		closeProtection: true,
	// 		// logLevel: 1,
	// 	});

	// 	device.register();

	// 	device.on('incoming', handleIncomingCall);

	// 	return () => {
	// 		device.off('incoming', handleIncomingCall);
	// 	};
	// }, [device, engagements]);

	const { mutate: updateWorkerActivity } = useMutation({
		mutationFn: async ({ sid, options }: { sid: string; options: ActivityOptions }) =>
			worker?.setWorkerActivity(worker.sid, sid, options),
	});

	// const handleReservationEvents = useCallback((res: Reservation) => {
	// 	res.on('accepted', (reservation) => {
	// 		console.log('reservation accepted');
	// 		setEngagements((prev) => [
	// 			...prev.filter((e) => e.reservation?.sid !== reservation.sid),
	// 			{ ...prev.find((e) => e.reservation?.sid === reservation.sid), reservation },
	// 		]);
	// 	});

	// 	res.on('rescinded', (reservation) => {
	// 		console.log('reservation rescinded');
	// 		const engagement = engagements.find((e) => e.reservation?.sid === reservation.sid);
	// 		if (engagement) {
	// 			engagement.call?.reject();
	// 			setEngagements((prev) => [...prev.filter((e) => e.reservation?.sid !== reservation.sid)]);
	// 		}
	// 	});

	// 	res.on('rejected', (reservation) => {
	// 		console.log('reservation rejected');
	// 		const engagement = engagements.find((e) => e.reservation?.sid === reservation.sid);
	// 		setEngagements((prev) => [
	// 			...prev.filter((e) => e.reservation?.sid !== reservation.sid),
	// 			{ ...engagement, reservation, task: reservation.task },
	// 		]);
	// 	});

	// 	res.on('timeout', (reservation) => {
	// 		console.log('reservation timeout');
	// 		const engagement = engagements.find((e) => e.reservation?.sid === reservation.sid);
	// 		if (engagement) {
	// 			engagement.call?.reject();
	// 			setEngagements((prev) => [...prev.filter((e) => e.reservation?.sid !== reservation.sid)]);
	// 		}
	// 	});

	// 	res.on('canceled', (reservation) => {
	// 		console.log('reservation canceled');
	// 		const engagement = engagements.find(
	// 			(engagement) => engagement.reservation?.task.taskChannelUniqueName === 'voice'
	// 		);
	// 		if (engagement) {
	// 			engagement.call?.reject();
	// 			setEngagements((prev) => [
	// 				...prev.filter((e) => e.reservation?.sid !== reservation.sid),
	// 				{ ...engagement, reservation, task: reservation.task },
	// 			]);
	// 		}
	// 	});

	// 	res.on('wrapup', (reservation) => {
	// 		console.log('reservation wrapup');
	// 		const engagement = engagements.find((engagement) => engagement.reservation?.sid === reservation.sid);
	// 		if (engagement) {
	// 			engagement.call?.reject();
	// 			setEngagements((prev) => [
	// 				...prev.filter((e) => e.reservation?.sid !== reservation.sid),
	// 				{ ...engagement, reservation, task: reservation.task },
	// 			]);
	// 		}
	// 	});
	// }, []);

	// useEffect(() => {
	// 	const supervisor = new Supervisor(authToken);

	// 	supervisor.on('reservationCreated', (reservation) => {
	// setEngagements((prev) => [
	// 	...prev.filter((e) => e.task?.sid !== reservation.task.sid),
	// 	{ reservation, task: reservation.task },
	// ]);
	// if (reservation.status === 'pending') {
	// 	setOpenEngagementDialog(true);
	// }
	// if (reservation.task.taskChannelUniqueName === 'voice') {
	// 	handleConference(reservation);
	// }
	// handleReservationEvents(reservation);
	// 	});

	// 	supervisor.on('ready', (w) =>
	// Array.from(w.reservations.values()).map((reservation) => {
	// 	setEngagements((prev) => [
	// 		...prev.filter((e) => e.task?.sid !== reservation.task.sid),
	// 		{ reservation, task: reservation.task },
	// 	]);
	// 	if (reservation.status === 'pending') {
	// 		setOpenEngagementDialog(true);
	// 	}
	// 	if (reservation.task.taskChannelUniqueName === 'voice') {
	// 		handleConference(reservation);
	// 	}
	// 	handleReservationEvents(reservation);
	// })
	// 	);

	// 	workerRef.current = supervisor;

	// 	return () => {
	// 		supervisor.removeAllListeners();
	// 	};
	// }, [authToken]);

	const { mutate: handleAccept, isPending: isAccepting } = useMutation({
		mutationFn: async ({ reservation, call }: { reservation?: Reservation; call?: Call }) => {
			if (call) {
				call?.accept();
			} else {
				reservation?.accept();
			}
		},
		onSuccess: (data, { reservation }) => {
			setOpenEngagementDialog(false);
			navigate({
				to: '/engagements/$sid',
				params: {
					sid: reservation?.task?.sid ?? '',
				},
			});
		},
	});

	const { mutate: handleConference } = useMutation({
		mutationFn: async (reservation: Reservation) => {
			await reservation?.conference({
				beep: false,
				record: 'record-from-start',
				conferenceRecord: 'record-from-start',
				startConferenceOnEnter: true,
				endConferenceOnExit: true,
				endConferenceOnCustomerExit: true,
				transcribe: true,
				transcriptionConfiguration: 'Athena',
				timeout: 18,
				recordingStatusCallback:
					'https://ad17-2600-1700-89c1-1670-987d-dd7e-8262-7b25.ngrok-free.app/functions/v1/process-recording',
			});

			// const engagement = engagements.find((engagement) => engagement.reservation?.sid === reservation.sid);
			// setEngagements((prev) => [
			// 	...prev.filter((e) => e.reservation?.sid !== reservation.sid),
			// 	{ ...(engagement ?? {}), reservation },
			// ]);

			// setIncomingEngagement((prev) => ({ ...prev, reservation: res }));
		},
		onError: (e, v, c) => {
			console.log('reservation', e, v, c);
		},
	});

	const handleComplete = useMutation({
		mutationFn: async (engagement: Engagement) => {
			await engagement.reservation?.complete();
		},
		onSuccess(data, variables, context) {
			setEngagements((prev) => prev.filter((e) => e.reservation?.sid !== variables.reservation?.sid));
		},
	});

	const handleWrapup = useMutation({
		mutationFn: async (engagement: Engagement) => {
			await engagement.reservation?.wrap();
			if (engagement.call) {
				engagement.call?.disconnect();
			}
		},
		onMutate(variables) {
			const engagement = engagements.find((e) => e.reservation?.sid === variables.reservation?.sid);

			setEngagements((prev) => [
				...prev.filter((e) => e.reservation?.sid !== variables.reservation?.sid),
				{ ...engagement, reservation: { ...variables.reservation, status: 'wrapping' } },
			]);
		},
	});

	const handleReject = useCallback(async (engagement: Engagement) => {
		await worker?.setWorkerActivity(worker?.sid ?? '', worker?.sid ?? '', {
			rejectPendingReservations: true,
		});
		engagement.call?.reject();
		setEngagements((prev) => [...prev.filter((e) => e.reservation?.sid !== engagement.reservation?.sid)]);
	}, []);

	return (
		<>
			<Provider
				value={{
					worker,
					attributes,
					activity,
					updateWorkerActivity,
					engagements,
					handleComplete,
					handleWrapup,
				}}
			>
				{children}
			</Provider>

			<DialogStack
				open={openEngagementDialog}
				onOpenChange={setOpenEngagementDialog}
			>
				<DialogStackOverlay />
				<DialogStackBody>
					{engagements.map((engagment) => (
						<DialogStackContent key={engagment?.reservation?.sid}>
							<DialogStackHeader>
								<DialogStackTitle className='flex items-center gap-1.5'>
									<Headset className='size-5' />
									<span className='capitalize'>
										{engagment?.reservation?.task.taskChannelUniqueName}
									</span>
								</DialogStackTitle>
							</DialogStackHeader>

							<div className='flex flex-col items-center gap-3 py-6'>
								<Avatar className='size-12 rounded-lg'>
									<AvatarImage src='https://github.com/shadcn.png' />
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>

								<h2 className='text-2xl font-semibold'>
									{engagment?.task?.attributes?.name} {engagment?.task?.attributes?.companyName}
								</h2>

								<p>to {engagment?.task?.queueName}</p>
							</div>

							<div className='flex items-center justify-around'>
								<div className='flex flex-col items-center gap-1.5'>
									<Button
										variant='destructive'
										size='icon'
										className='rounded-full size-12'
										onClick={() => handleReject(engagment)}
									>
										<Phone className='size-5 text-white fill-white stroke-0 rotate-135' />
									</Button>
									<p className='text-xs'>Reject</p>
								</div>

								<div className='flex flex-col items-center gap-1.5'>
									<Button
										size='icon'
										className='size-12 rounded-full'
										onClick={() =>
											handleAccept({
												reservation: engagment?.reservation,
												call: engagment?.call,
											})
										}
										disabled={isAccepting}
									>
										{isAccepting ? (
											<Loader2 className='size-5 animate-spin' />
										) : (
											<Phone className='size-5 text-white fill-white stroke-0' />
										)}
									</Button>
									<p className='text-xs'>Accept</p>
								</div>
							</div>

							<DialogStackFooter className='justify-between'>
								<DialogStackPrevious asChild>
									<Button variant='outline'>Previous</Button>
								</DialogStackPrevious>
								<DialogStackNext asChild>
									<Button variant='outline'>Next</Button>
								</DialogStackNext>
							</DialogStackFooter>
						</DialogStackContent>
					))}
				</DialogStackBody>
			</DialogStack>
		</>
	);
};

export const useWorker = () => {
	const state = useContext(context);

	if (!state) {
		throw new Error('WorkerProvider not found');
	}

	return state;
};
