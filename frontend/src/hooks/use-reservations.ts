import { useCallback, useEffect, useMemo, useState } from "react";
import type { Reservation } from "twilio-taskrouter";
import { useQuery } from "@tanstack/react-query";
import { useWorker } from "@/providers/worker-provider";
// import { useWorker } from './use-worker';

const useReservations = () => {
	const { worker } = useWorker();
	const [reservations, setReservations] = useState<Reservation[]>([]);

	const { data } = useQuery({
		queryKey: ["reservations", worker?.sid],
		queryFn: async () => {
			if (!worker) return [];
			const ress = Array.from(worker.reservations.values());
			return ress;
		},
		enabled: !!worker,
	});

	useEffect(() => {
		if (!worker) return;

		worker?.on("reservationCreated", addReservation);

		worker.on("error", (e) => {
			console.error(e.message);
		});

		return () => {
			worker?.off("reservationCreated", addReservation);
		};
	}, [worker]);

	const imcomingCalls = useMemo(() => {
		return reservations.filter(
			(r) =>
				(r.task.taskChannelUniqueName === "voice" ||
					r.task.taskChannelUniqueName === "default") &&
				r.task.attributes.taskType !== "voicemail",
		);
	}, [reservations]);

	const addReservation = useCallback(
		(res: Reservation) => {
			setReservations((prev) => [...prev, res]);
		},
		[reservations],
	);

	const removeReservation = useCallback(
		(res: Reservation) => {
			setReservations((
				prev,
			) => [...prev.filter((r) => r.sid !== res.sid)]);
		},
		[reservations],
	);

	const incompleteReservations = useMemo(
		() => reservations.filter((r) => r.status !== "completed"),
		[reservations],
	);

	return {
		reservations: incompleteReservations,
		addReservation,
		removeReservation,
	};
};

export default useReservations;
