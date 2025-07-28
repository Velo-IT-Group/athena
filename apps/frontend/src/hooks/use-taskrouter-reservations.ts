import { delay } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Reservation, Supervisor } from "twilio-taskrouter";

interface UseTaskRouterReservationsProps {
  worker?: Supervisor;
  enabled?: boolean;
}

export const useTaskRouterReservations = (
  { worker, enabled = true }: UseTaskRouterReservationsProps,
) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const navigate = useNavigate();

  const updateReservations = useCallback(() => {
    if (!worker || !enabled) {
      setIsLoading(false);
      return;
    }

    console.log(worker.reservations.values());

    try {
      const currentReservations = Array.from(worker.reservations.values());
      setReservations(currentReservations);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to get reservations"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [worker, enabled]);

  // Generic reservation event handler
  const handleReservationEvent = useCallback(
    (
      reservation: Reservation,
      eventType: "created" | "updated" | "removed",
    ) => {
      console.log(`Reservation ${eventType}:`, reservation.sid);

      setReservations((prev) => {
        try {
          const reservationData = reservation;

          switch (eventType) {
            case "created":
              // Add new reservation if it doesn't exist
              if (!prev.some((r) => r.sid === reservation.sid)) {
                return [...prev, reservationData];
              }
              return prev;

            case "updated":
              // Update existing reservation or add if it doesn't exist
              const existingIndex = prev.findIndex((r) =>
                r.sid === reservation.sid
              );
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = reservationData;
                return updated;
              } else {
                // If reservation doesn't exist, add it
                return [...prev, reservationData];
              }

            case "removed":
              // Remove reservation from state
              return prev.filter((r) => r.sid !== reservation.sid);

            default:
              return prev;
          }
        } catch (err) {
          console.error(`Error handling reservation ${eventType}:`, err);
          setError(
            err instanceof Error
              ? err
              : new Error(`Failed to handle reservation ${eventType}`),
          );
          return prev;
        }
      });
    },
    [],
  );

  // Setup event listeners for individual reservations
  const setupReservationListeners = useCallback((reservation: Reservation) => {
    const handleCompleted = () =>
      handleReservationEvent(reservation, "removed");
    const handleAccepted = async (res: Reservation) => {
      handleReservationEvent(res, "updated");

      if (res.task.attributes.conference) {
        navigate({
          to: "/engagements/$taskSid/$reservationSid",
          params: {
            taskSid: res.task.sid,
            reservationSid: res.sid,
          },
        });
      } else {
        await delay(1000);
        const r = await res.fetchLatestVersion();
        navigate({
          to: "/engagements/$taskSid/$reservationSid",
          params: {
            taskSid: r.task.sid,
            reservationSid: r.sid,
          },
        });
      }
    };
    const handleWrapup = () => handleReservationEvent(reservation, "updated");
    const handleRejected = () => handleReservationEvent(reservation, "removed");
    const handleTimeout = () => handleReservationEvent(reservation, "removed");
    const handleCanceled = () => handleReservationEvent(reservation, "removed");

    reservation.on("accepted", handleAccepted);
    reservation.on("rejected", handleRejected);
    reservation.on("timeout", handleTimeout);
    reservation.on("canceled", handleCanceled);
    reservation.on("completed", handleCompleted);
    reservation.on("wrapup", handleWrapup);

    // Return cleanup function
    return () => {
      reservation.off("accepted", handleAccepted);
      reservation.off("rejected", handleRejected);
      reservation.off("timeout", handleTimeout);
      reservation.off("canceled", handleCanceled);
      reservation.off("completed", handleCompleted);
      reservation.off("wrapup", handleWrapup);
    };
  }, [handleReservationEvent]);

  useEffect(() => {
    if (!worker || !enabled) {
      setIsLoading(false);
      return;
    }

    // Initial load
    updateReservations();

    const cleanupFunctions: (() => void)[] = [];

    // Setup listeners for existing reservations
    worker.reservations.forEach((reservation) => {
      const cleanup = setupReservationListeners(reservation);
      cleanupFunctions.push(cleanup);
    });

    // Listen for new reservations being created
    const handleReservationCreated = (reservation: Reservation) => {
      handleReservationEvent(reservation, "created");
      // Setup listeners for the new reservation
      const cleanup = setupReservationListeners(reservation);
      cleanupFunctions.push(cleanup);
    };

    worker.on("reservationCreated", handleReservationCreated);

    return () => {
      worker.off("reservationCreated", handleReservationCreated);
      // Clean up all reservation listeners
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [
    worker,
    enabled,
    updateReservations,
    handleReservationEvent,
    setupReservationListeners,
  ]);

  return {
    reservations,
    isLoading,
    error,
    refetch: updateReservations,
  };
};
