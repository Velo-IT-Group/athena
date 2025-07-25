'use client';
import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useCallback,
} from 'react';
import { Device, Call, type TwilioError } from '@twilio/voice-sdk';
import { useDevice } from '@/hooks/use-device';
import { useWorker } from '@/hooks/use-worker';
import { Reservation, Supervisor, Worker } from 'twilio-taskrouter';
import {
	useMutation,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import z from 'zod';
import {
	attributeIdentifier,
	createEngagementSchema,
	Direction,
} from '@/types/twilio';
import { env } from '@/lib/utils';
import { lookupPhoneNumber } from '@/lib/twilio/phoneNumbers';
import { getAccessTokenQuery } from '@/lib/twilio/api';

interface TwilioVoiceContextType {
	device: Device | null;
	isRegistered: boolean;
	errors: TwilioError.TwilioError[];
	isTokenExpiring: boolean;
	calls: Call[];
	activeEngagement?: Engagement;
	setActiveEngagement: React.Dispatch<
		React.SetStateAction<Engagement | undefined>
	>;
	worker: Supervisor | null;
	createEngagement: UseMutationResult<
		string | undefined,
		Error,
		z.infer<typeof createEngagementSchema>,
		void
	>;
	runPreflightTest: () => void;
	isVoiceEnabled: boolean;
}

const TwilioVoiceContext = createContext<TwilioVoiceContextType | undefined>(
	undefined
);

interface TwilioProviderProps {
	token: string;
	workerSid: string;
	identity: string;
	children: ReactNode;
}

export type Engagement = {
	call?: Call;
	reservation: Reservation;
};

export const TwilioProvider = ({
	token,
	workerSid,
	identity,
	children,
}: TwilioProviderProps) => {
	const client = useQueryClient();
	const [activeEngagement, setActiveEngagement] = useState<Engagement>();
	const [waitingReservation, setWaitingReservation] = useState<Reservation>();
	const [shouldAutoAccept, setShouldAutoAccept] = useState<boolean>(false);

	const handleIncomingCall = useCallback(
		async (call: Call) => {
			if (shouldAutoAccept) {
				call.accept();
			}
			setActiveEngagement((prev) => ({ ...prev, call }));

			setShouldAutoAccept(false);

			device.device?.audio?.incoming(true);
		},
		[shouldAutoAccept]
	);

	const handleDeviceRegistration = useCallback(async () => {
		if (waitingReservation) {
			await handleReservationConference(waitingReservation);
		}
		device.device?.audio?.incoming(false);
	}, [waitingReservation]);

	const handleTokenExpiration = useCallback(
		async (device: Device) => {
			console.log('Token is expiring, updating device...');
			const query = getAccessTokenQuery({
				identity,
				workerSid,
			});
			const newToken = await client.fetchQuery(query);
			console.log('new token: ', newToken);
			client.invalidateQueries({ queryKey: query.queryKey });
			client.setQueryData(query.queryKey, newToken);
			device.updateToken(newToken);
		},
		[token, identity, workerSid]
	);

	const device = useDevice({
		token,
		onIncomingCall: handleIncomingCall,
		onDeviceRegistration: handleDeviceRegistration,
		onTokenExpiring: handleTokenExpiration,
	});

	const handleReservationConference = useCallback(
		async (res: Reservation) => {
			if (res.task.taskChannelUniqueName !== 'voice') return;
			if (!device.isRegistered) {
				setWaitingReservation(res);
				return;
			}

			setActiveEngagement({
				reservation: res,
			});

			const isOutbound =
				res.task.attributes.direction === Direction.Outbound;

			if (isOutbound) {
				device.device?.audio?.incoming(false);

				setShouldAutoAccept(true);
			}

			await res.conference({
				// beep: false,
				// record: 'record-from-start',
				// conferenceRecord: 'record-from-start',
				startConferenceOnEnter: true,
				endConferenceOnExit: true,
				endConferenceOnCustomerExit: true,
				// transcribe: true,
				// transcriptionConfiguration: 'Athena',
			});

			if (isOutbound) {
				device.device?.updateOptions({
					enableImprovedSignalingErrorPrecision: true,
					closeProtection: true,
					logLevel: 'debug',
					disableAudioContextSounds: undefined,
				});
			}
		},
		[device.isRegistered]
	);

	const handleWorkerReady = useCallback((worker: Worker) => {
		const wrappingReservation = Array.from(
			worker.reservations.values()
		).find((res) => ['accepted', 'wrapping'].includes(res.status));
		if (wrappingReservation) {
			setActiveEngagement({
				reservation: wrappingReservation,
			});
		}
	}, []);

	const { worker } = useWorker({
		token,
		onReservationRescinded: () => {
			activeEngagement?.call?.ignore();
		},
		onReservationAccepted: (res) =>
			setActiveEngagement((prev) => ({ ...prev, reservation: res })),
		onReservationCompleted: () => setActiveEngagement(undefined),
		onReservationCreated: handleReservationConference,
		onWorkerReady: handleWorkerReady,
	});

	const createEngagement = useMutation({
		mutationKey: ['create', 'engagements'],
		mutationFn: async (values: z.infer<typeof createEngagementSchema>) => {
			const result = await lookupPhoneNumber({
				data: values.to,
			});

			const attributes = attributeIdentifier.parse(result);

			return await worker?.createTask(
				values.to,
				values.from,
				env.VITE_TWILIO_WORKFLOW_SID,
				env.VITE_TWILIO_TASK_QUEUE_SID,
				{
					attributes: {
						...attributes,
						direction: 'outbound',
					},
					taskChannelUniqueName: 'voice',
				}
			);
		},
		onMutate: () => console.log('Creating engagement...'),
		onSuccess: (v) => {
			console.log('Engagement created: ', v);
			if (!v) return;
			if (worker?.reservations.get(v)) {
				setActiveEngagement({
					reservation: worker.reservations.get(v) as Reservation,
				});
			}
		},
	});

	return (
		<TwilioVoiceContext.Provider
			value={{
				...device,
				activeEngagement,
				setActiveEngagement,
				worker,
				createEngagement,
				isVoiceEnabled: device.isRegistered && !!worker?.available,
			}}
		>
			{children}
		</TwilioVoiceContext.Provider>
	);
};

export const useTwilio = () => {
	const context = useContext(TwilioVoiceContext);
	if (context === undefined) {
		throw new Error('useTwilio must be used within a TwilioProvider');
	}
	return context;
};
