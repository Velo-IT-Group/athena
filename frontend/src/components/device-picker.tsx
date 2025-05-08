import { useDevice } from '@/providers/device-provider';
import React, { useTransition } from 'react';
import { Command, CommandGroup, CommandList } from '@/components/ui/command';
import { CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type Props = {};

const DevicePicker = (props: Props) => {
	const { device } = useDevice();
	const [isPending, startTransition] = useTransition();

	return (
		<Command>
			<CommandList>
				<CommandGroup>
					<CommandGroup>
						{Array.from(device?.audio?.availableInputDevices?.values() ?? [])
							.filter((d) => !!!d.label.includes('Default -'))
							.map((mediaDevice) => {
								return (
									<CommandItem
										key={mediaDevice.deviceId}
										value={mediaDevice.deviceId}
										className='flex items-center'
										disabled={
											isPending && device?.audio?.inputDevice?.deviceId === mediaDevice.deviceId
										}
										onSelect={(e) =>
											startTransition(async () => {
												device?.audio?.setInputDevice(e);
											})
										}
									>
										<Check
											className={cn(
												'mr-2 h-3.5 w-3.5',
												device?.audio?.inputDevice?.deviceId === mediaDevice.deviceId
													? 'opacity-100'
													: 'opacity-0'
											)}
										/>
										{mediaDevice.label}
									</CommandItem>
								);
							})}
					</CommandGroup>
				</CommandGroup>
			</CommandList>
		</Command>
	);
};

export default DevicePicker;
