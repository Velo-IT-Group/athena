import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Supervisor, type Reservation, type Worker } from 'twilio-taskrouter';

type Props = {
	token: string;
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
};

export const useWorker = ({
	token,
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
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [attributes, setAttributes] = useState(worker?.attributes);
	const [activity, setActivity] = useState(worker?.activity);

	const handleReservationAccepted = useCallback(
		(reservation: Reservation) => {
			onReservationAccepted?.(reservation);
		},
		[onReservationAccepted]
	);

	const handleReservationRescinded = useCallback(
		(reservation: Reservation) => {
			onReservationRescinded?.(reservation);
		},
		[onReservationRescinded]
	);

	const handleReservationRejected = useCallback(
		(reservation: Reservation) => {
			onReservationRejected?.(reservation);
		},
		[onReservationRejected]
	);

	const handleReservationTimeout = useCallback(
		(reservation: Reservation) => {
			onReservationTimeout?.(reservation);
		},
		[onReservationTimeout]
	);

	const handleReservationCanceled = useCallback(
		(reservation: Reservation) => {
			onReservationCanceled?.(reservation);
		},
		[onReservationCanceled]
	);

	const handleReservationWrapup = useCallback(
		(reservation: Reservation) => {
			onReservationWrapup?.(reservation);
		},
		[onReservationWrapup]
	);

	const handleReservationCompleted = useCallback((reservation: Reservation) => {
		onReservationCompleted?.(reservation);
	}, []);

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
		(reservation: Reservation) => {
			onReservationCreated?.(reservation);
			handleReservationEvents(reservation);
		},
		[onReservationCreated, handleReservationEvents]
	);

	const handleReservationFailed = useCallback(
		(reservation: Reservation) => {
			onReservationFailed?.(reservation);
		},
		[onReservationFailed]
	);

	const handleWorkerReady = useCallback((worker: Worker) => {
		console.log('handleWorkerReady', worker);
		onWorkerReady?.(worker);
		setIsReady(true);
		setReservations(Array.from(worker.reservations.values()));
		worker.reservations.forEach(handleReservationEvents);
	}, []);

	useEffect(() => {
		const supervisor = new Supervisor(token, { closeExistingSessions: true, setWorkerOfflineIfDisconnected: true });

		supervisor.on('ready', handleWorkerReady);
		supervisor.on('reservationCreated', handleReservationCreation);
		supervisor.on('reservationFailed', handleReservationFailed);
		supervisor.on('attributesUpdated', (w) => setAttributes(w.attributes));
		supervisor.on('activityUpdated', (w) => setActivity(w.activity));

		workerRef.current = supervisor;

		return () => {
			supervisor.off('ready', handleWorkerReady);
			supervisor.off('reservationCreated', handleReservationCreation);
			supervisor.off('reservationFailed', handleReservationFailed);
		};
	}, [
		token,
		handleReservationCreation,
		// handleReservationFailed,
		// handleWorkerReady
	]);

	return {
		worker,
		attributes,
		activity,
		isReady,
		reservations,
	};
};
