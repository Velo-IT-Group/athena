import { useEffect, useState, useCallback } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { useOnInteraction } from '@/hooks/use-on-interaction';
import { useQueryClient } from '@tanstack/react-query';
import { getAccessTokenQuery } from '@/lib/twilio/api';
import { useRouteContext } from '@tanstack/react-router';
import { toast } from 'sonner';

interface UseTwilioVoiceProps {
	accessToken?: string;
	enabled?: boolean;
}

export const useTwilioVoice = ({
	accessToken,
	enabled = true,
}: UseTwilioVoiceProps) => {
	const [device, setDevice] = useState<Device | null>(null);
	const client = useQueryClient();
	const [isReady, setIsReady] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [activeCalls, setActiveCalls] = useState<Map<string, Call>>(
		new Map()
	);
	const [updateTokenAfterCall, setUpdateTokenAfterCall] = useState(false);

	const { workerSid, user, identity } = useRouteContext({ from: '/_authed' }); // Adjust the path as needed

	const interacted = useOnInteraction();

	const refreshDeviceToken = async (device: Device) => {
		const query = getAccessTokenQuery({
			identity,
			workerSid,
		});

		const data = await client.fetchQuery(query);

		client.setQueryData(query.queryKey, data);

		console.log(
			'Twilio Voice Device token will expire, refreshed token:',
			data
		);

		device.updateToken(data);
	};

	const initializeDevice = useCallback(async () => {
		if (!accessToken || !enabled) {
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const newDevice = new Device(accessToken, {
				logLevel: 'debug',
				enableImprovedSignalingErrorPrecision: true,
				closeProtection: true,
				// answerOnBridge: true,
			});

			newDevice.register();

			// Device ready
			newDevice.on('ready', () => {
				console.log('Twilio Voice Device ready');
				setIsReady(true);
				setError(null);
				setIsLoading(false);
			});

			newDevice.on('registered', () => {
				console.log('Twilio Voice Device registered');
				setIsReady(true);
				setError(null);
				setIsLoading(false);
				toast.success('Twilio Voice Device registered');
				newDevice.audio?.setInputDevice('Default');
			});

			// Device error
			newDevice.on('error', (error) => {
				console.error('Twilio Voice Device error:', error);
				setError(error);
				setIsReady(false);
				setIsLoading(false);
				toast.error(`Twilio Voice Device error: ${error.message}`);
			});

			// Incoming call
			newDevice.on('incoming', (call: Call) => {
				console.log('Incoming call:', call);

				// const callData: Call = {
				// 	sid: call.parameters.CallSid || `call-${Date.now()}`,
				// 	status: 'ringing',
				// 	direction: 'inbound',
				// 	from: call.parameters.From,
				// 	to: call.parameters.To,
				// 	customParameters: call.parameters,
				// 	taskSid: call.parameters.TaskSid, // TaskRouter passes this
				// 	reservationSid: call.parameters.ReservationSid, // TaskRouter passes this
				// };

				call.on('disconnect', async (call) => {
					if (!updateTokenAfterCall) return;

					console.log('The call has been disconnected.');
					await refreshDeviceToken(newDevice);
				});

				setActiveCalls(
					(prev) => new Map(prev.set(call.parameters.CallSid, call))
				);

				// Setup call event listeners
				setupCallListeners(call, call.parameters.CallSid);
			});

			// Device offline
			newDevice.on('unregistered', () => {
				console.log('Twilio Voice Device offline');
				setIsReady(false);
			});

			// Device offline
			newDevice.on('tokenWillExpire', async () => {
				if (newDevice._activeCall) {
					setUpdateTokenAfterCall(true);
					return;
				}
				console.log('Twilio Voice Device offline');

				await refreshDeviceToken(newDevice);
			});

			setDevice(newDevice);
		} catch (err) {
			console.error('Failed to initialize Twilio Voice Device:', err);
			setError(
				err instanceof Error
					? err
					: new Error('Failed to initialize device')
			);
			setIsLoading(false);
		}
	}, [accessToken, enabled, interacted]);

	const setupCallListeners = useCallback((call: Call, callSid: string) => {
		call.on('accept', () => {
			console.log('Call accepted:', callSid);
			setActiveCalls((prev) => {
				const updated = new Map(prev);
				const callData = updated.get(callSid);
				if (callData) {
					updated.set(callSid, callData!);
				}
				return updated;
			});
		});

		call.on('disconnect', () => {
			console.log('Call disconnected:', callSid);
			setActiveCalls((prev) => {
				const updated = new Map(prev);
				updated.delete(callSid);
				return updated;
			});
		});

		call.on('reject', () => {
			console.log('Call rejected:', callSid);
			setActiveCalls((prev) => {
				const updated = new Map(prev);
				updated.delete(callSid);
				return updated;
			});
		});

		call.on('cancel', () => {
			console.log('Call canceled:', callSid);
			setActiveCalls((prev) => {
				const updated = new Map(prev);
				updated.delete(callSid);
				return updated;
			});
		});
	}, []);

	// Call control functions
	const acceptCall = useCallback(
		(callSid: string) => {
			console.log('Attempting to accept call:', callSid);
			const callData = activeCalls.get(callSid);
			if (callData) {
				console.log('Found call data, accepting...');
				callData.accept();
			} else {
				console.error('Call not found in activeCalls:', callSid);
				console.log('Available calls:', Array.from(activeCalls.keys()));
			}
		},
		[activeCalls]
	);

	const rejectCall = useCallback(
		(callSid: string) => {
			console.log('Attempting to reject call:', callSid);
			const callData = activeCalls.get(callSid);
			if (callData) {
				console.log('Found call data, rejecting...');
				callData.reject();
			} else {
				console.error('Call not found in activeCalls:', callSid);
			}
		},
		[activeCalls]
	);

	const hangupCall = useCallback(
		(callSid: string) => {
			console.log('Attempting to hangup call:', callSid);
			const callData = activeCalls.get(callSid);
			if (callData) {
				console.log('Found call data, disconnecting...');
				callData.disconnect();
			} else {
				console.error('Call not found in activeCalls:', callSid);
			}
		},
		[activeCalls]
	);

	const muteCall = useCallback(
		(callSid: string, muted: boolean) => {
			console.log(
				'Attempting to mute/unmute call:',
				callSid,
				'muted:',
				muted
			);
			const callData = activeCalls.get(callSid);
			if (callData) {
				console.log('Found call data, setting mute state...');
				callData.mute(muted);
			} else {
				console.error('Call not found in activeCalls:', callSid);
			}
		},
		[activeCalls]
	);

	useEffect(() => {
		if (!interacted) return;
		initializeDevice();

		return () => {
			if (device) {
				device.destroy();
			}
		};
	}, [initializeDevice, interacted]);

	return {
		device,
		isReady,
		isLoading,
		error,
		activeCalls: Array.from(activeCalls.values()),
		acceptCall,
		rejectCall,
		hangupCall,
		muteCall,
	};
};
