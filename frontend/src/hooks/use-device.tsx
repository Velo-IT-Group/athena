import { useOnInteraction } from '@/hooks/use-on-interaction';
import { getAccessTokenQuery } from '@/lib/twilio/api';
import { useQueryClient } from '@tanstack/react-query';
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
	const queryClient = useQueryClient();

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
		if (!isRegistered) {
			device.register();
		}

		// Listening for incoming calls
		device.on('incoming', handleIncomingCall);

		device.on('error', (twilioError: TwilioError.TwilioError, call) => {
			setErrors((prev) => [...prev, twilioError]);
			toast.error(twilioError.message);
			queryClient.refetchQueries({ queryKey: getAccessTokenQuery({ identity: '', workerSid: '' }).queryKey });
		});

		device.on('registered', () => {
			setIsRegistered(true);
			onDeviceRegistration?.();
		});

		device.on('tokenWillExpire', () => {
			toast.warning('Token will expire', { duration: Infinity });
			console.log('token will expire');
			setIsTokenExpiring(true);

			queryClient.refetchQueries({ queryKey: getAccessTokenQuery({ identity: '', workerSid: '' }).queryKey });
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
