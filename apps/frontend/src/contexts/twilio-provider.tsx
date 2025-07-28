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
import { attributeIdentifier, Direction } from '@/types/twilio';
import { lookupPhoneNumber } from '@/lib/twilio/phoneNumbers';
import { getAccessTokenQuery } from '@/lib/twilio/api';
import { toast } from 'sonner';
import { createEngagementSchema } from '@athena/utils';

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
		Call | undefined,
		Error,
		z.infer<typeof createEngagementSchema>,
		void
	>;
	runPreflightTest: () => void;
	isVoiceEnabled: boolean;
	hasDetectedAudio: boolean;
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
			console.log('handleTokenExpiration NEW TOKEN: ', newToken);
			client.invalidateQueries({ queryKey: query.queryKey });
			client.setQueryData(query.queryKey, newToken);
			device.updateToken(newToken);
			console.log('handleTokenExpiration AFTER UPDATE: ', device.token);
			toast.success('Token successfully updated');
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
			if (
				res.task.taskChannelUniqueName !== 'voice' ||
				res.task.attributes.taskType === 'voicemail'
			)
				return;
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
				record: 'record-from-start',
				conferenceRecord: 'record-from-start',
				startConferenceOnEnter: true,
				endConferenceOnExit: false,
				endConferenceOnCustomerExit: true,
				transcribe: true,
				transcriptionConfiguration: 'Athena',
				recordingStatusCallback:
					'https://qqfkxhqzsbqgydssvfss.supabase.co/functions/v1/process-recording',
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
		const reservations = Array.from(worker.reservations.values());
		if (reservations.length) {
			setActiveEngagement({
				reservation: reservations[0],
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
		onReservationCreated: (reservation) => {
			console.log(reservation.task.attributes);
			if (reservation.task.attributes.direction === Direction.Outbound) {
				reservation.accept();
				setActiveEngagement((prev) => ({
					...prev,
					reservation,
				}));
				return;
			}
			if (
				reservation.task.taskChannelUniqueName !== 'voice' ||
				reservation.task.attributes.taskType === 'voicemail'
			) {
				setActiveEngagement((prev) => ({ ...prev, reservation }));
				return;
			}
			handleReservationConference(reservation);
		},
		onWorkerReady: handleWorkerReady,
	});

	const createEngagement = useMutation({
		mutationKey: ['create', 'engagements'],
		mutationFn: async (values: z.infer<typeof createEngagementSchema>) => {
			const result = await lookupPhoneNumber({
				data: values.to,
			});

			const attributes = attributeIdentifier.parse(result);

			return await device.device?.connect({
				params: {
					direction: 'outbound',
					workerSid: worker?.sid ?? '',
					channel: 'voice',
					from: values.from,
					name: attributes.name,
					to: values.to,
					To: values.to,
					territoryName: attributes.territoryName,
					companyId: String(attributes.companyId),
					userId: String(attributes.userId),
				},
			});
		},
		onMutate: () => console.log('Creating engagement...'),
		onSuccess: (call) => {
			console.log('Engagement created: ', call);
			if (!call) return;
			setActiveEngagement({
				call,
				// @ts-ignore
				reservation: {},
			});
			// if (worker?.reservations.get(v)) {
			// 	setActiveEngagement({
			// 		reservation: worker.reservations.get(v) as Reservation,
			// 	});
			// }
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
				hasDetectedAudio: device.hasDetectedAudio,
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
