import { ChevronDown, Volume1 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useWorker } from '@/providers/worker-provider';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover } from '@radix-ui/react-popover';
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ListSelector } from '@/components/list-selector';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTwilio } from '@/contexts/twilio-provider';

const AudioSelector = () => {
	const { device } = useTwilio();
	const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
	const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
	const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo>();
	const [selectedInputDevice, setSelectedInputDevice] =
		useState<MediaDeviceInfo>();
	const [inputVolume, setInputVolume] = useState(0);

	const handleSettingAudioConstraints = useMutation({
		mutationFn: async (constraints: MediaTrackConstraints) =>
			device?.audio?.setAudioConstraints({
				...device?.audio?.audioConstraints,
				...constraints,
			}),
		onSuccess: () => {
			device?.audio?.setInputDevice('Default');
		},
		onError: async (error) => {
			toast.error('Failed to set audio constraints ' + error.message);
			await device?.audio?.unsetAudioConstraints();
		},
	});

	useEffect(() => {
		if (!device || !device.audio) return;

		setSelectedDevice(device.audio.inputDevice ?? undefined);

		// device.audio.setInputDevice('default');

		// device.audio.setAudioConstraints({
		// 	autoGainControl: true,
		// 	echoCancellation: true,
		// 	noiseSuppression: true,
		// });

		device.audio.availableInputDevices.forEach((mediaDevice, id) => {
			setInputDevices((prev) => [
				...prev.filter((d) => d.deviceId !== mediaDevice.deviceId),
				mediaDevice,
			]);
			const speakerDevices = Array.from(
				device?.audio?.availableInputDevices.entries()
			);

			speakerDevices.forEach(([id, speakerDevice]) => {
				if (speakerDevice.deviceId === mediaDevice.deviceId) {
					setSelectedInputDevice(mediaDevice);
				}
			});
		});

		device.audio.availableOutputDevices.forEach((mediaDevice, id) => {
			// If the device is present in device.audio.speakerDevices, then it is

			// currently active, and should be selected in the multi-select element.

			const speakerDevices = device?.audio?.speakerDevices.get() || [];

			speakerDevices.forEach((speakerDevice) => {
				if (speakerDevice.deviceId === mediaDevice.deviceId) {
					setSelectedDevice(mediaDevice);
				}
			});

			setDevices((prev) => [
				...prev.filter((d) => d.deviceId !== mediaDevice.deviceId),
				mediaDevice,
			]);
		});

		device.audio?.on('deviceChange', (device) => {
			setDevices((prev) => [
				...prev.filter((d) => d.deviceId !== device.deviceId),
				device,
			]);
			console.log(device);
		});

		device.audio?.on('inputVolume', (v) => {
			console.log(v);
			setInputVolume(v);
		});

		return () => {
			device.audio?.off('deviceChange', () => {});
			device.audio?.off('inputVolume', () => {});
		};
	}, [device]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-1.5'>
					<Volume1 className='size-5' /> <span>Audio</span>
				</CardTitle>
			</CardHeader>

			<CardContent className='space-y-6'>
				<div className='grid grid-cols-[1fr_2fr] items-center gap-x-3 gap-y-6'>
					<p>Speaker</p>

					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								className='w-full justify-between'
							>
								{selectedDevice?.label ?? 'Select a device'}
								<ChevronDown />
							</Button>
						</PopoverTrigger>

						<PopoverContent
							align='start'
							className='p-0 w-[var(--radix-popover-trigger-width)]'
						>
							<ListSelector
								items={devices}
								currentValue={selectedDevice}
								itemView={(item) => <span>{item.label}</span>}
								onSelect={async (item) => {
									try {
										await device?.audio?.ringtoneDevices.set(
											item.deviceId
										);
										setSelectedDevice(item);
									} catch (error) {
										toast.error(
											'Failed to set ringtone device ' +
												(error as Error).message
										);
									}
								}}
							/>
						</PopoverContent>
					</Popover>

					<p>Microphone</p>

					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								className='w-full justify-between'
							>
								{selectedInputDevice?.label ??
									'Select a device'}

								<ChevronDown />
							</Button>
						</PopoverTrigger>

						<PopoverContent
							align='start'
							className='p-0 w-[var(--radix-popover-trigger-width)]'
						>
							<ListSelector
								items={inputDevices}
								currentValue={selectedInputDevice}
								itemView={(item) => <span>{item.label}</span>}
								onSelect={(item) => {
									try {
										device?.audio?.setInputDevice(
											item.deviceId
										);
										setSelectedInputDevice(item);
									} catch (error) {
										toast.error(
											'Failed to set microphone ' +
												(error as Error).message
										);
									}
								}}
							/>
						</PopoverContent>
					</Popover>
				</div>

				<Progress value={inputVolume * 100} />

				<Button
					variant='outline'
					onClick={() =>
						device?.audio?.speakerDevices.test('phone_ringing.mp3')
					}
				>
					Test
				</Button>

				<Label
					htmlFor='autoGainControl'
					className='flex items-center gap-1.5 justify-between hover:cursor-pointer'
				>
					<span>Auto Gain Control</span>
					<Switch
						id='autoGainControl'
						name='autoGainControl'
						defaultChecked={
							device?.audio?.audioConstraints
								?.autoGainControl as unknown as boolean
						}
						onCheckedChange={(autoGainControl) =>
							handleSettingAudioConstraints.mutate({
								autoGainControl,
							})
						}
					/>
				</Label>

				<Label
					htmlFor='echoCancellation'
					className='flex items-center gap-1.5 justify-between hover:cursor-pointer'
				>
					<span>Echo Cancellation</span>
					<Switch
						id='echoCancellation'
						name='echoCancellation'
						defaultChecked={
							device?.audio?.audioConstraints
								?.echoCancellation as unknown as boolean
						}
						onCheckedChange={(echoCancellation) =>
							handleSettingAudioConstraints.mutate({
								echoCancellation,
							})
						}
					/>
				</Label>

				<Label
					htmlFor='noiseSuppression'
					className='flex items-center gap-1.5 justify-between hover:cursor-pointer'
				>
					<span>Noise Suppression</span>
					<Switch
						id='noiseSuppression'
						name='noiseSuppression'
						defaultChecked={
							device?.audio?.audioConstraints
								?.noiseSuppression as unknown as boolean
						}
						onCheckedChange={(noiseSuppression) =>
							handleSettingAudioConstraints.mutate({
								noiseSuppression,
							})
						}
					/>
				</Label>
			</CardContent>
		</Card>
	);
};

export default AudioSelector;
