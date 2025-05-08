import { useOnInteraction } from '@/hooks/use-on-interaction';
import { type Call, Device, TwilioError } from '@twilio/voice-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type Props = {
	token: string;
	onIncomingCall?: (call: Call) => void;
	onTokenExpiring?: () => void;
	onDeviceRegistration?: () => void;
};

export const useDevice = ({ token, onIncomingCall, onTokenExpiring, onDeviceRegistration }: Props) => {
	const deviceRef = useRef<Device>(null);
	const device = deviceRef.current;

	const [errors, setErrors] = useState<TwilioError.TwilioError[]>([]);
	const [isRegistered, setIsRegistered] = useState(false);
	const [isTokenExpiring, setIsTokenExpiring] = useState(false);

	const interacted = useOnInteraction();

	const handleIncomingCall = useCallback(
		(call: Call) => {
			onIncomingCall?.(call);
		},
		[onIncomingCall]
	);

	/// Register the device when the user first clicks the page
	useEffect(() => {
		const d = new Device(token, {
			disableAudioContextSounds: true,
			enableImprovedSignalingErrorPrecision: true,
			closeProtection: true,
		});

		deviceRef.current = d;
	}, [token]);

	useEffect(() => {
		if (!interacted || !device) return;
		console.log('registering device');

		// Registering the device since the user has interacted with the page
		device.register();

		// Listening for incoming calls
		device.on('incoming', handleIncomingCall);

		device.on('error', (twilioError: TwilioError.TwilioError, call) => {
			setErrors((prev) => [...prev, twilioError]);
			toast.error(twilioError.message);
		});

		device.on('registered', () => {
			setIsRegistered(true);
			onDeviceRegistration?.();
		});

		device.on('tokenWillExpire', () => {
			console.log('token will expire');
			setIsTokenExpiring(true);
			onTokenExpiring?.();
			// const token = getNewTokenViaAjax();
			// device.updateToken(token);
		});

		device.on('unregistered', () => {
			console.log('unregistered');
			setIsRegistered(false);
		});

		return () => {
			device.off('incoming', handleIncomingCall);
		};
	}, [interacted, device, handleIncomingCall]);

	return { device, isRegistered, errors, isTokenExpiring, calls: device?.calls ?? [] };
};
