'use client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mic } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import DeviceAudioLevel from '@/components/device-audio-level';
import { ListSelector } from '@/components/list-selector';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandList,
} from '@/components/ui/command';
import { useTwilio } from '@/contexts/twilio-provider';
import { changeInputDevice, getMediaDevicesQuery } from '@/lib/utils/api';
import {
	MICROPHONE_DEVICE_ID_LOCAL_STORAGE_KEY,
	SPEAKER_DEVICE_ID_LOCAL_STORAGE_KEY,
} from '@/utils/constants';

const DevicePicker = () => {
	const { device } = useTwilio();

	const [selectedInputDevice, setSelectedInputDevice] = useState<
		MediaDeviceInfo | null | undefined
	>(
		device?.audio?.inputDevice ??
			device?.audio?.availableInputDevices.get('Default') ??
			device?.audio?.availableInputDevices.get('default')
	);

	const [selectedOutputDevice, setSelectedOutputDevice] = useState<
		MediaDeviceInfo | null | undefined
	>(
		device?.audio?.inputDevice ??
			device?.audio?.availableOutputDevices.get('Default') ??
			device?.audio?.availableOutputDevices.get('default')
	);

	console.log(device?.audio?.inputDevice);

	const { data, isLoading, error } = useQuery(getMediaDevicesQuery());
	const deviceChange = changeInputDevice();

	return (
		<Command>
			<CommandList>
				{isLoading ? (
					<div className='flex flex-col items-center'>
						<Loader2 className='animate-spin' />
					</div>
				) : (
					<>
						{error ? (
							<CommandEmpty>
								{error && (
									<span>
										Error loading devices: {error.message}
									</span>
								)}
							</CommandEmpty>
						) : (
							<>
								<CommandGroup
									heading={
										<div className='flex items-center gap-2'>
											<Mic />
											<span>Input Volume</span>
										</div>
									}
								>
									<DeviceAudioLevel device={device} />
								</CommandGroup>

								<CommandGroup heading='Microphone'>
									<ListSelector
										items={data?.inputDevices ?? []}
										// currentValue={
										// 	data?.defaultInput ?? undefined
										// 	// device?.audio?.inputDevice ??
										// 	// device?.audio?.availableOutputDevices.get(
										// 	// 	'Default'
										// 	// ) ??
										// 	// (device?.audio?.availableOutputDevices.get(
										// 	// 	'default'
										// 	// ) as MediaDeviceInfo)
										// }
										value={(item: MediaDeviceInfo) =>
											item.groupId
										}
										searchable={false}
										comparisonFn={(i) =>
											i.groupId ===
											data?.defaultInput?.groupId
										}
										itemView={(item) => (
											<span
												aria-label={item?.label.replace(
													/\s*\([^)]*\)/g,
													''
												)}
												className='truncate'
											>
												{item?.label
													.replace(
														/\s*\([^)]*\)/g,
														''
													)
													.trim()}
											</span>
										)}
										onSelect={async (item) => {
											if (!item) return;
											try {
												deviceChange.mutate(item);
												// await device?.audio?.setInputDevice(
												// 	item.deviceId
												// );

												setSelectedInputDevice(item);
												// localStorage.setItem(
												// 	MICROPHONE_DEVICE_ID_LOCAL_STORAGE_KEY,
												// 	item.groupId
												// );
											} catch (error) {
												console.error(error);
												toast.error(
													(error as Error).message
												);
											}
										}}
									/>
								</CommandGroup>

								<CommandGroup heading='Speaker'>
									<ListSelector
										items={data?.outputDevices ?? []}
										currentValue={
											(selectedOutputDevice ??
												device?.audio?.availableOutputDevices.get(
													'Default'
												)) as MediaDeviceInfo
										}
										value={(item: MediaDeviceInfo) =>
											item.groupId
										}
										searchable={false}
										itemView={(item) => (
											<span
												aria-label={item?.label}
												className='truncate'
											>
												{item?.label
													.replace(
														/\s*\([^)]*\)/g,
														''
													)
													.trim()}
											</span>
										)}
										comparisonFn={(i) =>
											i.groupId ===
											selectedOutputDevice?.groupId
										}
										onSelect={async (item) => {
											try {
												await device?.audio?.speakerDevices.set(
													item.deviceId
												);
												setSelectedOutputDevice(item);
												localStorage.setItem(
													SPEAKER_DEVICE_ID_LOCAL_STORAGE_KEY,
													item.groupId
												);
												await device?.audio?.speakerDevices.test();
											} catch (error) {
												console.error(error);
												toast.error(
													(error as Error).message
												);
											}
										}}
									/>
								</CommandGroup>
							</>
						)}
					</>
				)}
			</CommandList>
		</Command>
	);
};

export default DevicePicker;
