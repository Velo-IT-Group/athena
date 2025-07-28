import { useMutation } from '@tanstack/react-query';
import type { Call } from '@twilio/voice-sdk';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

type Props = {
	call?: Call;
	onAccept?: (call: Call) => void;
	onCancel?: () => void;
	onDisconnect?: (call: Call) => void;
	onError?: (error: any) => void;
	onMute?: (isMuted: boolean, call: Call) => void;
	onReconnected?: () => void;
	onReconnecting?: (twilioError: any) => void;
	onReject?: () => void;
	onRinging?: (hasEarlyMedia: boolean) => void;
	onSample?: (sample: any) => void;
	onVolume?: (inputVolume: number, outputVolume: number) => void;
	onWarning?: (warningName: string, warningData: any) => void;
	onWarningCleared?: (warningName: string) => void;
};

export const useCall = ({
	call,
	onAccept,
	onCancel,
	onDisconnect,
	onError,
	onMute,
	onReconnected,
	onReconnecting,
	onReject,
	onRinging,
	onSample,
	onVolume,
	onWarning,
	onWarningCleared,
}: Props) => {
	const handleAccept = useCallback(
		(call: Call) => {
			console.log(
				"The incoming call was accepted or the outgoing call's media session has finished setting up."
			);

			onAccept?.(call);
		},
		[onAccept]
	);

	const handleCancel = useCallback(() => {
		console.log('The call has been canceled.');
		onCancel?.();
	}, [onCancel]);

	const handleDisconnect = useCallback(
		(call: Call) => {
			console.log('The call has been disconnected.');
			call.mute(false);
			onDisconnect?.(call);
		},
		[onDisconnect]
	);

	const handleError = useCallback(
		(error: any) => {
			console.log('An error has occurred: ', error);
			onError?.(error);
		},
		[onError]
	);

	const handleMute = useCallback(
		(isMuted: boolean, call: Call) => {
			// isMuted is true if the input audio is currently muted
			// i.e. The remote participant CANNOT hear local device's input

			// isMuted is false if the input audio is currently unmuted
			// i.e. The remote participant CAN hear local device's input

			isMuted ? console.log('muted') : console.log('unmuted');
			onMute?.(isMuted, call);
		},
		[onMute]
	);

	const handleReconnected = useCallback(() => {
		console.log('The call has regained connectivity.');
		onReconnected?.();
	}, [onReconnected]);

	const handleReconnecting = useCallback(
		(twilioError: any) => {
			// update the UI to alert user that connectivity was lost
			// and that the SDK is trying to reconnect
			// showReconnectingMessageInBrowser();

			// You may also want to view the TwilioError:
			console.log('Connectivity error: ', twilioError);
			onReconnecting?.(twilioError);
		},
		[onReconnecting]
	);

	const handleReject = useCallback(() => {
		console.log('The call was rejected.');
		onReject?.();
	}, [onReject]);

	const handleRinging = useCallback(
		(hasEarlyMedia: boolean) => {
			// showRingingIndicator();
			if (!hasEarlyMedia) {
				// playOutgoingRinging();
			}
			onRinging?.(hasEarlyMedia);
		},
		[onRinging]
	);

	const handleSample = useCallback(
		(sample: any) => {
			// Do something
			// console.log(sample);
			onSample?.(sample);
		},
		[onSample]
	);

	const handleVolume = useCallback(
		(inputVolume: number, outputVolume: number) => {
			// Do something
			// console.log(inputVolume, outputVolume);
			onVolume?.(inputVolume, outputVolume);
		},
		[onVolume]
	);

	const handleWarning = useCallback(
		(warningName: string, warningData: any) => {
			console.log(warningName, warningData);
			if (warningName === 'low-mos') {
				// showQualityWarningModal(
				// 	'We have detected poor call quality conditions. You may experience degraded call quality.'
				// );
				console.log(warningData);
				/* Prints the following
            {
                // Stat name
                "name": "mos",

                // Array of mos values in the past 5 samples that triggered the warning
                "values": [2, 2, 2, 2, 2],

                // Array of samples collected that triggered the warning.
                // See sample object format here https://www.twilio.com/docs/voice/sdks/javascript/twiliocall#sample-event
                "samples": [...],

                // The threshold configuration.
                // In this example, low-mos warning will be raised if the value is below 3
                "threshold": {
                    "name": "min",
                    "value": 3
                }
            }
         */
			}
			onWarning?.(warningName, warningData);
		},
		[onWarning]
	);

	const handleWarningCleared = useCallback(
		(warningName: string) => {
			if (warningName === 'low-mos') {
				// hideQualityWarningModal();
			}
			onWarningCleared?.(warningName);
		},
		[onWarningCleared]
	);

	useEffect(() => {
		call?.on('accept', handleAccept);
		call?.on('cancel', handleCancel);
		call?.on('disconnect', handleDisconnect);
		call?.on('error', handleError);
		call?.on('mute', handleMute);
		call?.on('reconnected', handleReconnected);
		call?.on('reconnecting', handleReconnecting);
		call?.on('reject', handleReject);
		call?.on('ringing', handleRinging);
		call?.on('sample', handleSample);
		call?.on('volume', handleVolume);
		call?.on('warning', handleWarning);
		call?.on('warning-cleared', handleWarningCleared);

		return () => {
			call?.off('accept', handleAccept);
			call?.off('cancel', handleCancel);
			call?.off('disconnect', handleDisconnect);
			call?.off('error', handleError);
			call?.off('mute', handleMute);
			call?.off('reconnected', handleReconnected);
			call?.off('reconnecting', handleReconnecting);
			call?.off('reject', handleReject);
			call?.off('ringing', handleRinging);
			call?.off('sample', handleSample);
			call?.off('volume', handleVolume);
			call?.off('warning', handleWarning);
			call?.off('warning-cleared', handleWarningCleared);
		};
	}, [call]);

	const acceptCall = useMutation({
		mutationKey: ['acceptCall'],
		mutationFn: async (opt) => {
			call?.accept();
			setTimeout(() => {}, 1000);
		},
		onError: (error) => {
			console.error('Error accepting call:', error);
			toast.error('Failed to accept call ' + error.message);
		},
	});

	const rejectCall = useMutation({
		mutationKey: ['rejectCall'],
		mutationFn: async () => call?.reject(),
		onError: (error) => {
			console.error('Error rejecting call:', error);
			toast.error('Failed to reject call ' + error.message);
		},
	});

	const disconnectCall = useMutation({
		mutationKey: ['disconnectCall'],
		mutationFn: async () => call?.disconnect(),
		onError: (error) => {
			console.error('Error disconnecting call:', error);
			toast.error('Failed to disconnect call ' + error.message);
		},
	});

	const ignoreCall = useMutation({
		mutationKey: ['ignoreCall'],
		mutationFn: async () => call?.ignore(),
		onError: (error) => {
			console.error('Error ignoring call:', error);
			toast.error('Failed to ignore call ' + error.message);
		},
	});

	const toggleMute = useMutation({
		mutationKey: ['toggleMute'],
		mutationFn: async () => call?.mute(!call?.isMuted()),
		onError: (error) => {
			console.error('Error muting call:', error);
			toast.error('Failed to mute call ' + error.message);
		},
	});

	const sendDigits = useMutation({
		mutationKey: ['sendDigits'],
		mutationFn: async (digits: string) => call?.sendDigits(digits),
		onError: (error) => {
			console.error('Error sending digits:', error);
			toast.error('Failed to send digits ' + error.message);
		},
	});

	return {
		call,
		status: call?.status(),
		acceptCall,
		rejectCall,
		disconnectCall,
		ignoreCall,
		toggleMute,
		sendDigits,
	};
};
