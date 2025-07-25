'use client';
import { env } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Supervisor } from 'twilio-taskrouter';

import type { Reservation, Worker, WorkerOptions } from 'twilio-taskrouter';

interface Props {
	token: string;
	options?: WorkerOptions;
	onReservationAccepted?: (res: Reservation) => void;
	onReservationCanceled?: (res: Reservation) => void;
	onReservationCreated?: (res: Reservation) => void;
	onReservationCompleted?: (res: Reservation) => void;
	onReservationFailed?: (res: Reservation) => void;
	onReservationRejected?: (res: Reservation) => void;
	onReservationRescinded?: (res: Reservation) => void;
	onReservationTimeout?: (res: Reservation) => void;
	onReservationWrapup?: (res: Reservation) => void;
	onWorkerReady?: (w: Worker) => void;
}

export const useWorker = ({
	token,
	options = {
		closeExistingSessions: true,
		setWorkerOfflineIfDisconnected: true,
		connectActivitySid: env.VITE_TWILIO_DEFAULT_ACTIVITY_SID,
	},
	onReservationAccepted,
	onReservationCanceled,
	onReservationCompleted,
	onReservationCreated,
	onReservationFailed,
	onReservationRescinded,
	onReservationRejected,
	onReservationTimeout,
	onReservationWrapup,
	onWorkerReady,
}: Props) => {
	const workerRef = useRef<Supervisor>(null);
	const worker = workerRef.current;

	const [isReady, setIsReady] = useState(false);
	const [attributes, setAttributes] = useState(worker?.attributes);
	const [activity, setActivity] = useState(worker?.activity);

	const [reservations, setReservations] = useState<Reservation[]>([]);

	const handleReservationAccepted = useCallback(
		async (reservation: Reservation) => {
			setReservations((prev) =>
				prev.map((r) => (r.sid === reservation.sid ? reservation : r))
			);
			onReservationAccepted?.(reservation);
		},
		[onReservationAccepted]
	);

	const handleReservationRescinded = useCallback(
		async (reservation: Reservation) => {
			setReservations((prev) =>
				prev.filter((r) => r.sid === reservation.sid)
			);

			onReservationRescinded?.(reservation);
		},
		[onReservationRescinded]
	);

	const handleReservationRejected = useCallback(
		async (reservation: Reservation) => {
			setReservations((prev) =>
				prev.filter((r) => r.sid === reservation.sid)
			);
			onReservationRejected?.(reservation);
		},
		[onReservationRejected]
	);

	const handleReservationTimeout = useCallback(
		async (reservation: Reservation) => {
			setReservations((prev) =>
				prev.filter((r) => r.sid === reservation.sid)
			);
			onReservationTimeout?.(reservation);
		},
		[onReservationTimeout]
	);

	const handleReservationCanceled = useCallback(
		async (reservation: Reservation) => {
			setReservations((prev) =>
				prev.filter((r) => r.sid === reservation.sid)
			);
			onReservationCanceled?.(reservation);
		},
		[onReservationCanceled]
	);

	const handleReservationWrapup = useCallback(
		async (reservation: Reservation) => {
			setReservations((prev) =>
				prev.map((r) => (r.sid === reservation.sid ? reservation : r))
			);
			onReservationWrapup?.(reservation);
		},
		[onReservationWrapup]
	);

	const handleReservationCompleted = useCallback(
		async (reservation: Reservation) => {
			setReservations((prev) =>
				prev.filter((r) => r.sid === reservation.sid)
			);
			onReservationCompleted?.(reservation);
		},
		[]
	);

	const handleReservationEvents = useCallback((res: Reservation) => {
		res.on('accepted', handleReservationAccepted);
		res.on('canceled', handleReservationCanceled);
		res.on('completed', handleReservationCompleted);
		res.on('rejected', handleReservationRejected);
		res.on('rescinded', handleReservationRescinded);
		res.on('timeout', handleReservationTimeout);
		res.on('wrapup', handleReservationWrapup);
	}, []);

	const handleReservationCreation = useCallback(
		async (reservation: Reservation) => {
			setReservations((prev) =>
				prev.map((r) => (r.sid === reservation.sid ? reservation : r))
			);

			onReservationCreated?.(reservation);
			handleReservationEvents(reservation);
		},
		[onReservationCreated, handleReservationEvents]
	);

	const handleReservationFailed = useCallback(
		async (reservation: Reservation) => {
			setReservations((prev) =>
				prev.filter((r) => r.sid === reservation.sid)
			);
			onReservationFailed?.(reservation);
		},
		[onReservationFailed]
	);

	const handleWorkerReady = useCallback((worker: Worker) => {
		onWorkerReady?.(worker);
		setIsReady(true);

		// Convert already created reservations into an array
		const reservations = Array.from(worker.reservations.values());

		// Setup event listeners for each reservation
		reservations.forEach((res) => handleReservationEvents(res));

		// Set the reservations to state
		setReservations(reservations);
	}, []);

	useEffect(() => {
		const supervisor = workerRef.current || new Supervisor(token, options);

		supervisor.on('activityUpdated', (w) => setActivity(w.activity));
		supervisor.on('attributesUpdated', (w) => setAttributes(w.attributes));
		supervisor.on('disconnected', (error) => {});
		supervisor.on('error', (error) => {
			console.error('Worker error:', error);
		});
		supervisor.on('ready', handleWorkerReady);
		supervisor.on('reservationCreated', handleReservationCreation);
		supervisor.on('reservationFailed', handleReservationFailed);
		supervisor.on('tokenExpired', () => {});
		supervisor.on('tokenUpdated', () => {
			console.log('Token updated');
		});

		workerRef.current = supervisor;

		return () => {
			supervisor.off('ready', handleWorkerReady);
			supervisor.off('reservationCreated', handleReservationCreation);
			supervisor.off('reservationFailed', handleReservationFailed);
			supervisor.off('attributesUpdated', (w) =>
				setAttributes(w.attributes)
			);
			supervisor.off('activityUpdated', (w) => setActivity(w.activity));
		};
	}, [
		token,
		handleReservationCreation,
		handleReservationFailed,
		handleWorkerReady,
	]);

	return {
		worker,
		attributes,
		activity,
		isReady,
		reservations,
	};
};
