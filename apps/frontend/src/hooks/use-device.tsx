import { useQuery } from '@tanstack/react-query';
import { type Call, Device, type TwilioError } from '@twilio/voice-sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useOnInteraction } from '@/hooks/use-on-interaction';
import {
	changeInputDevice,
	changeOutputDevice,
	getMediaDevicesQuery,
} from '@/lib/utils/api';
import {
	MICROPHONE_DEVICE_ID_LOCAL_STORAGE_KEY,
	SPEAKER_DEVICE_ID_LOCAL_STORAGE_KEY,
} from '@/utils/constants';

interface Props {
	token: string;
	onIncomingCall?: (call: Call) => void;
	onTokenExpiring?: (device: Device) => void;
	onDeviceRegistration?: () => void;
}

export const useDevice = ({
	token,
	onIncomingCall,
	onTokenExpiring,
	onDeviceRegistration,
}: Props) => {
	const deviceRef = useRef<Device>(null);

	const [errors, setErrors] = useState<TwilioError.TwilioError[]>([]);
	const [isRegistered, setIsRegistered] = useState(false);
	const [isTokenExpiring, setIsTokenExpiring] = useState(false);
	const [calls, setCalls] = useState<Call[]>([]);
	const [hasDetectedAudio, setHasDetectedAudio] = useState<
		boolean | undefined
	>();
	const { data } = useQuery(getMediaDevicesQuery());
	// const changeInputDeviceMutation = changeInputDevice();
	// const changeOutputDeviceMutation = changeOutputDevice();

	const interacted = useOnInteraction();

	const handleIncomingCall = useCallback(
		(call: Call) => {
			setCalls((prev) => [...prev, call]);
			onIncomingCall?.(call);
		},
		[onIncomingCall]
	);

	const handleVolumeChange = useCallback((v: number) => {
		console.log('running handleVolumeChange', v);
		if (v < 0.01) return;
		console.log(v);
		setHasDetectedAudio(true);
	}, []);

	const handleRegistration = useCallback(async () => {
		setIsRegistered(true);
		toast.info('Device registered successfully');
		console.log('Device registered successfully');

		if (data?.defaultInput) {
			try {
				await deviceRef.current?.audio?.setInputDevice(
					data.defaultInput?.deviceId
				);
			} catch (error) {
				console.error((error as TwilioError.TwilioError).message);
				try {
					await deviceRef.current?.audio?.setInputDevice('Default');
				} catch (error) {
					console.error((error as TwilioError.TwilioError).message);
					await deviceRef.current?.audio?.setInputDevice('default');
				}
			}
		} else {
			try {
				await deviceRef.current?.audio?.setInputDevice('Default');
			} catch (error) {
				console.error((error as TwilioError.TwilioError).message);
				await deviceRef.current?.audio?.setInputDevice('default');
			}
		}

		setHasDetectedAudio(false);

		if (data?.defaultOutput) {
			// changeOutputDeviceMutation.mutate(data.defaultOutput);
			await deviceRef.current?.audio?.speakerDevices.set(
				data.defaultOutput.deviceId
			);
			console.log('Audio output device set to default');
		} else {
			try {
				await deviceRef.current?.audio?.speakerDevices.set('default');
			} catch (error) {
				console.error('Error setting audio output device: ', error);
				await deviceRef.current?.audio?.speakerDevices.set(
					localStorage.getItem('Default')!
				);
			}
		}

		onDeviceRegistration?.();
	}, [onDeviceRegistration, data]);

	const handleUnregistration = useCallback(() => {
		setIsRegistered(false);
		toast.info('Device unregistered successfully');
	}, []);

	const handleDestruction = useCallback(() => {
		setIsRegistered(false);
		toast.warning('Device destroyed');
		// onDeviceRegistration?.();
	}, []);

	const handleTokenExpiration = useCallback(() => {
		if (!deviceRef.current) return;
		console.log(
			'USE DEVICE TOKEN BEFORE UPDATE: ',
			deviceRef.current.token
		);

		if (
			!toast.getToasts().some((t) => t.id === 'token-expiration-warning')
		) {
			toast.warning('Token will expire, attempting to refresh...', {
				duration: 10000,
				id: 'token-expiration-warning',
			});
		}
		setIsTokenExpiring(true);
		setTimeout(() => {
			onTokenExpiring?.(deviceRef.current!);
		}, 1000);
		console.log('USE DEVICE TOKEN AFTER UPDATE: ', deviceRef.current.token);
	}, [onTokenExpiring]);

	const handleError = useCallback((twilioError: TwilioError.TwilioError) => {
		console.error(twilioError);
		toast.error(twilioError.message, {
			action: (
				<Button
					variant='destructive'
					onClick={() => {
						window.location.reload();
					}}
				>
					Refresh
				</Button>
			),
		});
		setErrors((prev) => [...prev, twilioError].slice(-5));
		if (twilioError.code === 20101) {
			setIsRegistered(false);
		}
	}, []);

	useEffect(() => {
		if (!interacted) return;

		const d =
			deviceRef.current ||
			new Device(token, {
				enableImprovedSignalingErrorPrecision: true,
				closeProtection: true,
				logLevel: 'error',
			});

		// Registering the device since the user has interacted with the page
		if (d.state === Device.State.Unregistered) {
			d.register()
				.then(() => {
					console.log('Device registered for the first time');
					setIsRegistered(true);
					// Device.runPreflight(token, { fakeMicInput: true });
				})
				.catch((error: TwilioError.TwilioError) => {
					console.error('Error registering device:', error);
					toast.error('Failed to register device: ' + error.message);
				});
		} else if (d.state === Device.State.Destroyed) {
			d.register()
				.then(() => {
					console.log('Device registered from destroyed state');
					setIsRegistered(true);
					// Device.runPreflight(token, { fakeMicInput: true });
				})
				.catch((error: TwilioError.TwilioError) => {
					console.error('Error registering device:', error);
					toast.error('Failed to register device: ' + error.message);
				});
		} else if (d.state === Device.State.Registered) {
			// console.log('Device already registered');
			setIsRegistered(true);
			// Device.runPreflight(token, { fakeMicInput: true });
		}

		d.on('registered', handleRegistration);
		d.on('unregistered', handleUnregistration);
		d.on('destroyed', handleDestruction);

		d.on('tokenWillExpire', handleTokenExpiration);
		d.on('error', handleError);

		d.on('incoming', handleIncomingCall);

		deviceRef.current = d;

		return () => {
			d.off('registered', handleRegistration);
			d.off('unregistered', handleUnregistration);
			d.off('destroyed', handleDestruction);

			d.off('tokenWillExpire', handleTokenExpiration);
			d.off('error', handleError);

			d.off('incoming', handleIncomingCall);
		};
	}, [
		interacted,
		// deviceRef,
		token,
		handleRegistration,
		handleUnregistration,
		handleDestruction,
		handleTokenExpiration,
		handleError,
		handleIncomingCall,
	]);

	useEffect(() => {
		if (hasDetectedAudio) return;
		deviceRef.current?.audio?.on('inputVolume', handleVolumeChange);

		return () => {
			deviceRef.current?.audio?.off('inputVolume', handleVolumeChange);
		};
	}, [
		// deviceRef.current?.audio,
		handleVolumeChange,
		hasDetectedAudio,
	]);

	const runPreflightTest = useCallback(() => {
		if (!deviceRef.current) return;
		const preflightTest = Device.runPreflight(token, {
			fakeMicInput: true,
		});
		preflightTest.on('completed', (report) => {
			console.log(report);
		});

		preflightTest.on('failed', (error) => {
			console.log(error);
		});
	}, [token]);

	return {
		token,
		device: deviceRef.current,
		isRegistered,
		errors,
		isTokenExpiring,
		calls,
		runPreflightTest,
		hasDetectedAudio,
	};
};
