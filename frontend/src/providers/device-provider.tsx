import { useContext, createContext, useEffect, Dispatch, SetStateAction, useState, useMemo } from 'react';
import { Device, type Call } from '@twilio/voice-sdk';
import { ConferenceInstance } from 'twilio/lib/rest/api/v2010/account/conference';
import { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';

interface DeviceProviderProps {
	device: Device | undefined;
	setDevice: Dispatch<SetStateAction<Device | undefined>>;
	hasExternalFunctionality: boolean;
	activeCalls: Call[];
	setActiveCalls: Dispatch<SetStateAction<Call[]>>;
	activeCall: Call | undefined;
	setActiveCall: Dispatch<SetStateAction<Call | undefined>>;
	muted: boolean;
	setMuted: Dispatch<SetStateAction<boolean>>;
}

const initialValues: DeviceProviderProps = {
	device: undefined,
	setDevice: () => undefined,
	hasExternalFunctionality: false,
	activeCalls: [],
	setActiveCalls: () => [],
	activeCall: undefined,
	setActiveCall: () => undefined,
	muted: true,
	setMuted: () => false,
};

interface WithChildProps {
	authToken: string;
	children: React.ReactNode;
}

const context = createContext(initialValues);
const { Provider } = context;

export const DeviceProvider = ({ authToken, children }: WithChildProps) => {
	const device = useMemo(
		() =>
			new Device(authToken, {
				disableAudioContextSounds: true,
				enableImprovedSignalingErrorPrecision: true,
				logLevel: 1,
			}),
		[authToken]
	);
	const [activeCalls, setActiveCalls] = useState<Call[]>([]);
	const [muted, setMuted] = useState(false);
	const [activeCall, setActiveCall] = useState<Call | undefined>(initialValues.activeCall);

	useEffect(() => {
		if (!device) return;

		device.audio?.incoming(false);

		if (device.state === Device.State.Unregistered) {
			device?.register();
		}

		device.on('error', (error) => {
			console.error(error);
		});

		device.on('incoming', (call: Call) => {
			call.accept();

			call.on('accept', (c: Call) => {
				setActiveCall(c);
			});

			call.on('disconnect', () => {
				setActiveCall(undefined);
			});
		});

		device.on('registered', async () => {});

		return () => {
			device.removeAllListeners();
			if (device.state === Device.State.Registered) {
				device.unregister();
			}
		};
	}, [device]);

	useEffect(() => {
		setMuted(muted);
		if (!activeCall) return;
		activeCall.mute(muted);
	}, [muted]);

	return (
		<Provider
			value={{
				device,
				setDevice: () => undefined,
				hasExternalFunctionality: device?.identity === '',
				activeCalls,
				setActiveCalls,
				activeCall,
				setActiveCall,
				muted,
				setMuted,
			}}
		>
			{children}
		</Provider>
	);
};

export const useDevice = () => {
	const state = useContext(context);

	return state;
};
