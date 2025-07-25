import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Reservation } from 'twilio-taskrouter';
import { useNotifications } from '@/providers/notification-provider';
import { useAudio } from '@/providers/audio-provider';
import { toast } from 'sonner';
import { ReservationStatus, Direction } from '@/types/twilio';

interface ReservationProviderProps {
	status: ReservationStatus;
	reservation: Reservation;
	isVoicemail: boolean;
}

const initialValues: ReservationProviderProps = {
	status: 'pending',
	reservation: {} as Reservation,
	isVoicemail: false,
};

interface WithChildProps {
	reservation: Reservation;
	children: React.ReactNode;
}

const context = React.createContext(initialValues);
const { Provider } = context;

export const ReservationProvider = ({
	reservation,
	children,
	removeReservation,
	onMissedCall,
}: WithChildProps & {
	removeReservation: (res: Reservation) => void;
	onMissedCall: (res: Reservation) => void;
}) => {
	const { createNotification } = useNotifications();
	const { togglePlayback } = useAudio();
	const [status, setStatus] = useState<ReservationStatus>(reservation.status);
	const [_reservation, setReservation] = useState<Reservation>(reservation);
	// const router = useRouter();

	const isVoicemail = useMemo(() => reservation.task.attributes.taskType === 'voicemail', [reservation]);

	const toggleAudio = useCallback(
		(play: boolean) => {
			if (play && reservation.status !== 'pending') return;
			togglePlayback(play);
		},
		[reservation, togglePlayback]
	);

	useEffect(() => {
		if (!reservation) return;

		if (reservation.task.attributes.direction === Direction.Outbound && reservation.status === 'pending') {
			reservation.conference({
				beep: false,
				record: 'record-from-start',
				conferenceRecord: 'record-from-start',
				startConferenceOnEnter: true,
				endConferenceOnExit: false,
				endConferenceOnCustomerExit: true,
				transcribe: true,
				transcriptionConfiguration: 'Athena',
			});
		} else {
			createNotification(
				`New ${isVoicemail ? 'Voicemail' : 'Phone Call'} From ${reservation.task.attributes.name}`
			);
			toggleAudio(true);
		}

		reservation.on('accepted', async (reservation) => {
			setReservation(reservation);
			setStatus(reservation.status);

			// if (
			//     reservation.task.attributes.contactId ||
			//     reservation.task.attributes.userId
			// ) {
			//     router.push(
			//         `/contacts/${reservation.task.attributes.contactId ?? reservation.task.attributes.userId}`
			//     )
			// } else if (reservation.task.attributes.companyId) {
			//     router.push(
			//         `/companies/${reservation.task.attributes.companyId}`
			//     )
			// }
		});

		reservation.on('rescinded', async (reservation) => {
			try {
				setReservation(reservation);
				toggleAudio(false);
				setStatus(reservation.status);
				removeReservation(reservation);
			} catch (error) {
				console.error('No call pending', error);
				toast.error(JSON.stringify(error));
			}
		});

		reservation.on('rejected', async (reservation) => {
			try {
				setReservation(reservation);
				removeReservation(reservation);
				setStatus(reservation.status);
			} catch (error) {
				console.error('No call pending', error);
				toast.error(JSON.stringify(error));
			}
		});

		reservation.on('canceled', async (reservation) => {
			try {
				setReservation(reservation);
				toggleAudio(false);
				setStatus(reservation.status);
				removeReservation(reservation);
			} catch (error) {
				console.error('No call pending', error);
				toast.error(JSON.stringify(error));
			}
		});

		reservation.on('wrapup', async () => {
			try {
				setReservation(reservation);
				toggleAudio(false);
				setStatus(reservation.status);
			} catch (error) {
				toast.error(JSON.stringify(error));
			}
		});

		reservation.on('completed', async (reservation) => {
			try {
				removeReservation(reservation);
				setStatus(reservation.status);
				setReservation(reservation);
			} catch (error) {
				toast.error(JSON.stringify(error));
			}
		});

		reservation.on('timeout', async (reservation) => {
			try {
				onMissedCall(reservation);
				toggleAudio(false);
				setStatus(reservation.status);
				setReservation(reservation);
				removeReservation(reservation);
				// router.refresh();
			} catch (error) {
				console.error('No call pending', error);
				toast.error(JSON.stringify(error));
			}
		});

		return () => {
			toggleAudio(false);
		};
	}, [reservation, removeReservation]);

	return <Provider value={{ status, reservation: _reservation, isVoicemail }}>{children}</Provider>;
};

export const useReservation = () => {
	const state = useContext(context);

	return state;
};
