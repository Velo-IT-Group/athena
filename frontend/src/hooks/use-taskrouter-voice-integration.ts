import { useMemo, useCallback, useEffect } from 'react';
import { useTaskRouterReservations } from './use-taskrouter-reservations';
import { useGlobalTwilioVoice } from '@/hooks/use-global-twilio-voice';
import { Call } from '@twilio/voice-sdk';
import { Reservation } from 'twilio-taskrouter';

interface ReservationWithCall {
  reservation: Reservation;
  call?: Call;
  hasActiveCall: boolean;
  isVoiceReservation: boolean;
}

interface UseTaskRouterVoiceIntegrationProps {
  worker?: any;
  voiceAccessToken?: string;
  enabled?: boolean;
  autoConference?: boolean;
}

export const useTaskRouterVoiceIntegration = ({
  worker,
  voiceAccessToken,
  enabled = true,
  autoConference = true,
}: UseTaskRouterVoiceIntegrationProps) => {
  const {
    reservations,
    isLoading: reservationsLoading,
    error: reservationsError,
  } = useTaskRouterReservations({
    worker,
    enabled,
  });

  const {
    activeCalls,
    isReady: voiceReady,
    isLoading: voiceLoading,
    error: voiceError,
    acceptCall,
    rejectCall,
    hangupCall,
    muteCall,
  } = useGlobalTwilioVoice({
    accessToken: voiceAccessToken,
    enabled,
  });

  // Check if a reservation is a voice reservation
  const isVoiceReservation = useCallback((reservation: Reservation) => {
    return reservation.task?.taskChannelUniqueName?.toLowerCase() === 'voice' ||
           reservation.task?.attributes?.channel?.toLowerCase() === 'voice';
  }, []);

  // Find related call using CallSid from worker participants (only available after conferencing)
  const findRelatedCall = useCallback((reservation: Reservation) => {
    if (!reservation?.task?.attributes?.conference?.participants?.worker) {
      return null;
    }

    const workerCallSid = reservation.task.attributes.conference.participants.worker;
    
    // Find the call with matching CallSid
    const relatedCall = activeCalls.find(call => call.parameters.CallSid === workerCallSid);
    
    if (relatedCall) {
      console.log('Found related call:', relatedCall.parameters.CallSid, 'for reservation:', reservation.sid);
    } else {
      console.log('No related call found for reservation:', reservation.sid, 'looking for CallSid:', workerCallSid);
    }
    
    return relatedCall;
  }, [activeCalls]);

  // Check if a call might be related to a pending voice reservation (before conferencing)
  const findPendingVoiceReservationForCall = useCallback((call: Call) => {
    // Look for pending voice reservations that don't have conference info yet
    return reservations.find(reservation => 
      isVoiceReservation(reservation) && 
      reservation.status === 'pending' &&
      !reservation.task?.attributes?.conference?.participants?.worker
    );
  }, [reservations, isVoiceReservation]);

  // Conference a reservation and wait for updated task attributes
  const conferenceReservation = useCallback(async (reservationSid: string) => {
    if (!worker) {
      console.error('Worker not available for conferencing');
      return;
    }

    try {
      const reservation = worker.reservations.get(reservationSid);
      if (!reservation) {
        console.error('Reservation not found:', reservationSid);
        return;
      }

      console.log('Conferencing reservation:', reservationSid);
      console.log('Task attributes before conference:', reservation.task.attributes);

      await reservation.conference({
        beep: false,
        record: 'record-from-start',
        conferenceRecord: 'record-from-start',
        startConferenceOnEnter: true,
        endConferenceOnExit: false,
        endConferenceOnCustomerExit: true,
        transcribe: true,
        transcriptionConfiguration: 'Athena',
      });

      console.log('Reservation successfully conferenced:', reservationSid);

      // Wait a moment for the task attributes to be updated
      setTimeout(() => {
        const updatedReservation = worker.reservations.get(reservationSid);
        if (updatedReservation) {
          console.log('Updated task attributes after conference:', updatedReservation.task.attributes);
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to conference reservation:', reservationSid, error);
    }
  }, [worker]);

  // Listen for task updates after conferencing
  useEffect(() => {
    if (!worker || !enabled) return;

    const handleTaskUpdated = (task: any) => {
      console.log('Task updated:', task.sid);
      console.log('Updated task attributes:', task.attributes);
      
      // This will trigger a re-render and update our call matching
    };

    worker.on('taskUpdated', handleTaskUpdated);

    return () => {
      worker.off('taskUpdated', handleTaskUpdated);
    };
  }, [worker, enabled]);

  // Listen for new reservations and auto-conference voice reservations
  useEffect(() => {
    if (!worker || !autoConference || !enabled) return;

    const handleReservationCreated = (reservation: Reservation) => {
      console.log('New reservation created:', reservation.sid);
      console.log('Reservation task attributes:', reservation.task?.attributes);
      
      if (isVoiceReservation(reservation)) {
        console.log('Voice reservation detected, auto-conferencing:', reservation.sid);
        
        // Small delay to ensure reservation is fully initialized
        setTimeout(() => {
          conferenceReservation(reservation.sid);
        }, 100);
      } else {
        console.log('Non-voice reservation, no conferencing needed:', reservation.sid);
      }
    };

    worker.on('reservationCreated', handleReservationCreated);

    return () => {
      worker.off('reservationCreated', handleReservationCreated);
    };
  }, [worker, autoConference, enabled, conferenceReservation, isVoiceReservation]);

  // Smart accept function that handles voice vs non-voice reservations
  const smartAcceptReservation = useCallback(async (reservationSid: string) => {
    if (!worker) return;

    const reservation = worker.reservations.get(reservationSid);
    if (!reservation) {
      console.error('Reservation not found:', reservationSid);
      return;
    }

    if (isVoiceReservation(reservation)) {
      console.log('Accepting voice reservation - finding related call');
      
      // For pending voice reservations, look for any incoming call
      if (reservation.status === 'pending') {
        const incomingCall = activeCalls.find(call => call.status() === 'ringing');
        if (incomingCall) {
          console.log('Found incoming call, accepting call:', incomingCall.parameters.CallSid);
          await acceptCall(incomingCall.parameters.CallSid);
        }
      } else {
        // For accepted reservations, find the related call using conference info
        const relatedCall = findRelatedCall(reservation);
        if (relatedCall) {
          console.log('Found related call, accepting call:', relatedCall.parameters.CallSid);
          await acceptCall(relatedCall.parameters.CallSid);
        }
      }
      
      // Also accept the reservation to update its status
      await reservation.accept();
    } else {
      console.log('Non-voice reservation, accepting normally');
      // For non-voice reservations, just accept the reservation
      await reservation.accept();
    }
  }, [worker, isVoiceReservation, findRelatedCall, acceptCall, activeCalls]);

  // Smart reject function
  const smartRejectReservation = useCallback(async (reservationSid: string) => {
    if (!worker) return;

    const reservation = worker.reservations.get(reservationSid);
    if (!reservation) {
      console.error('Reservation not found:', reservationSid);
      return;
    }

    if (isVoiceReservation(reservation)) {
      console.log('Rejecting voice reservation - finding related call');
      
      // For pending voice reservations, look for any incoming call
      if (reservation.status === 'pending') {
        const incomingCall = activeCalls.find(call => call.status() === 'ringing');
        if (incomingCall) {
          console.log('Found incoming call, rejecting call:', incomingCall.parameters.CallSid);
          await rejectCall(incomingCall.parameters.CallSid);
        }
      } else {
        // For accepted reservations, find the related call using conference info
        const relatedCall = findRelatedCall(reservation);
        if (relatedCall) {
          console.log('Found related call, rejecting call:', relatedCall.parameters.CallSid);
          await rejectCall(relatedCall.parameters.CallSid);
        }
      }
      
      // Also reject the reservation
      await reservation.reject();
    } else {
      console.log('Non-voice reservation, rejecting normally');
      // For non-voice reservations, just reject the reservation
      await reservation.reject();
    }
  }, [worker, isVoiceReservation, findRelatedCall, rejectCall, activeCalls]);

  // Manual conference function for existing reservations
  const manualConference = useCallback(async (reservationSid: string) => {
    await conferenceReservation(reservationSid);
  }, [conferenceReservation]);

  // Transfer reservation to another worker
  const transferReservation = useCallback(async (reservationSid: string, targetWorkerSid: string) => {
    if (!worker) return;

    try {
      const reservation = worker.reservations.get(reservationSid);
      if (reservation) {
        await reservation.transfer(targetWorkerSid);
        console.log('Reservation transferred:', reservationSid, 'to worker:', targetWorkerSid);
      }
    } catch (error) {
      console.error('Failed to transfer reservation:', error);
    }
  }, [worker]);

  // Complete reservation (wrap up)
  const completeReservation = useCallback(async (reservationSid: string, attributes?: any) => {
    if (!worker) return;

    try {
      const reservation = worker.reservations.get(reservationSid);
      if (reservation) {
        await reservation.complete(attributes);
        console.log('Reservation completed:', reservationSid);
      }
    } catch (error) {
      console.error('Failed to complete reservation:', error);
    }
  }, [worker]);

  // Combine reservations with their related calls using the correct CallSid matching
  const reservationsWithCalls = useMemo((): ReservationWithCall[] => {
    return reservations
      .filter(reservation => {
        // Hide voice reservations that are pending and don't have conference info yet
        if (isVoiceReservation(reservation) && 
            reservation.status === 'pending' && 
            !reservation.task?.attributes?.conference) {
          console.log('Hiding pending voice reservation without conference info:', reservation.sid);
          return false;
        }
        return true;
      })
      .map(reservation => {
        const isVoice = isVoiceReservation(reservation);
        
        // Only find matching calls for accepted/conferenced reservations
        let relatedCall = null;
        if (reservation.status !== 'pending') {
          relatedCall = findRelatedCall(reservation);
        }

        return {
          reservation,
          call: relatedCall,
          hasActiveCall: !!relatedCall,
          isVoiceReservation: isVoice,
        };
      });
  }, [reservations, isVoiceReservation, findRelatedCall]);

  // Find calls that should be shown separately (orphaned or pending voice calls)
  const orphanedCalls = useMemo(() => {
    activeCalls.forEach(console.log)
    console.log('Calculating orphaned calls...');
    console.log('Active calls:', activeCalls.map(call => ({
      sid: call.parameters.CallSid,
      status: call.status(),
      from: call.parameters.From
    })));
    console.log('Reservations:', reservations.map(res => ({
      sid: res.sid,
      status: res.status,
      isVoice: isVoiceReservation(res),
      hasConference: !!res.task?.attributes?.conference?.participants?.worker
    })));

    const filtered = activeCalls.filter(call => {
      // Don't show calls that have matching accepted/conferenced reservations
      const hasMatchingAcceptedReservation = reservations.some(reservation => {
        if (reservation.status === 'pending') return false; // Don't count pending reservations
        const workerCallSid = reservation.task?.attributes?.conference?.participants?.worker;
        return workerCallSid === call.parameters.CallSid;
      });
      
      if (hasMatchingAcceptedReservation) {
        console.log('Call has matching accepted reservation, hiding:', call.parameters.CallSid);
        return false; // Don't show as orphaned if it has an accepted reservation
      }

      // For incoming/ringing calls, hide them if there's ANY pending voice reservation
      // This prevents showing both the reservation and the call for the same interaction
      if (call.status() === Call.State.Ringing) {
        const hasPendingVoiceReservation = reservations.some(reservation => 
          isVoiceReservation(reservation) && 
          reservation.status === 'pending'
        );
        
        if (hasPendingVoiceReservation) {
          console.log('Hiding ringing call because there is a pending voice reservation:', call.parameters.CallSid);
        }
        
        return !hasPendingVoiceReservation; // Hide incoming call if there's any pending voice reservation
      }

      // Show other calls (in-progress, etc.) that truly don't have any reservation match
      console.log('Showing orphaned call:', call.parameters.CallSid, 'status:', call.status);
      return true;
    });

    console.log('Final orphaned calls:', filtered.map(call => call.parameters.CallSid));
    return filtered;
  }, [activeCalls, reservations, isVoiceReservation]);

  return {
    reservationsWithCalls,
    orphanedCalls,
    isLoading: reservationsLoading || voiceLoading,
    error: reservationsError || voiceError,
    voiceReady,
    // Smart reservation handlers
    acceptReservation: smartAcceptReservation,
    rejectReservation: smartRejectReservation,
    // Direct call control functions
    acceptCall,
    rejectCall,
    hangupCall,
    muteCall,
    // Conference management
    conferenceReservation: manualConference,
    transferReservation,
    completeReservation,
    // Configuration
    autoConference,
  };
};