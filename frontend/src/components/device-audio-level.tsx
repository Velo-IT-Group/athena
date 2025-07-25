'use client';
import { Progress } from '@/components/ui/progress';
import { Device } from '@twilio/voice-sdk';
import { useCallback, useEffect, useState } from 'react';

type Props = {
	device: Device | null | undefined;
};

const DeviceAudioLevel = ({ device }: Props) => {
	const [inputVolume, setInputVolume] = useState(0);

	const handleInputVolume = useCallback((v: number) => setInputVolume(v), []);

	useEffect(() => {
		if (!device || !device.audio) return;

		device.audio?.on('inputVolume', handleInputVolume);

		return () => {
			device.audio?.off('inputVolume', handleInputVolume);
		};
	}, []);

	return <Progress value={inputVolume * 100} />;
};

export default DeviceAudioLevel;
