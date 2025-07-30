'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Reservation, Worker, WorkerOptions } from 'twilio-taskrouter';
import { Supervisor } from 'twilio-taskrouter';
import { env } from '@/lib/utils';

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
		[onReservationCompleted]
	);

	const handleReservationEvents = useCallback(
		(res: Reservation) => {
			res.on('accepted', handleReservationAccepted);
			res.on('canceled', handleReservationCanceled);
			res.on('completed', handleReservationCompleted);
			res.on('rejected', handleReservationRejected);
			res.on('rescinded', handleReservationRescinded);
			res.on('timeout', handleReservationTimeout);
			res.on('wrapup', handleReservationWrapup);
		},
		[
			handleReservationAccepted,
			handleReservationCanceled,
			handleReservationCompleted,
			handleReservationRejected,
			handleReservationRescinded,
			handleReservationTimeout,
			handleReservationWrapup,
		]
	);

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

	const handleWorkerReady = useCallback(
		(worker: Worker) => {
			onWorkerReady?.(worker);
			setIsReady(true);

			// Convert already created reservations into an array
			const reservations = Array.from(worker.reservations.values());

			// Setup event listeners for each reservation
			reservations.forEach((res) => handleReservationEvents(res));

			// Set the reservations to state
			setReservations(reservations);
		},
		[handleReservationEvents, onWorkerReady]
	);

	const handleActivityUpdated = useCallback((worker: Worker) => {
		setActivity(worker.activity);
	}, []);

	const handleAttributesUpdated = useCallback((worker: Worker) => {
		setActivity(worker.activity);
	}, []);

	const handleDisconnection = useCallback((worker: Worker) => {
		console.log(worker);
	}, []);

	const handleError = useCallback((error: Error) => {
		console.error('Worker error:', error);
	}, []);

	const handleTokenExpiration = useCallback(() => {
		console.error('Worker token expired');
	}, []);

	const handleTokenUpdate = useCallback(() => {
		console.error('Worker token updated');
	}, []);

	useEffect(() => {
		const supervisor = workerRef.current || new Supervisor(token, options);

		supervisor.on('activityUpdated', handleActivityUpdated);
		supervisor.on('attributesUpdated', handleAttributesUpdated);

		supervisor.on('disconnected', handleDisconnection);
		supervisor.on('error', handleError);

		supervisor.on('ready', handleWorkerReady);
		supervisor.on('reservationCreated', handleReservationCreation);
		supervisor.on('reservationFailed', handleReservationFailed);

		supervisor.on('tokenExpired', handleTokenExpiration);
		supervisor.on('tokenUpdated', handleTokenUpdate);

		workerRef.current = supervisor;

		return () => {
			supervisor.off('activityUpdated', handleActivityUpdated);
			supervisor.off('attributesUpdated', handleAttributesUpdated);

			supervisor.off('disconnected', handleDisconnection);
			supervisor.off('error', handleError);

			supervisor.off('ready', handleWorkerReady);
			supervisor.off('reservationCreated', handleReservationCreation);
			supervisor.off('reservationFailed', handleReservationFailed);

			supervisor.off('tokenExpired', handleTokenExpiration);
			supervisor.off('tokenUpdated', handleTokenUpdate);
		};
	}, [
		token,
		options,
		handleReservationCreation,
		handleReservationFailed,
		handleActivityUpdated,
		handleDisconnection,
		handleError,
		handleTokenExpiration,
		handleTokenUpdate,
		handleAttributesUpdated,
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
