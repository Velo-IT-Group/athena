import React, { useEffect, useState, useTransition } from 'react';
import { CardFooter } from '../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { ArrowRightFromLine, Check, Grip, Headset, Mic, Phone, UserPlus2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { useDevice } from '@/providers/device-provider';
import WorkerSelector from '@/components/worker-selector';
import { cn } from '@/lib/utils';
import { useTaskContext } from './context';
import { removeConferenceParticipant } from '@/lib/twilio/conference/helpers';
import { Dialpad } from '@/components/dialpad';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

const ActiveCallFooter = () => {
	const {
		transferTask,
		addExternalParticipant,
		task,
		endConference,
		conferenceParticipants,
		conference,
		removeParticipantByName,
		wrapUpTask,
		updateParticipants,
	} = useTaskContext();
	const { muted, setMuted, activeCall, device } = useDevice();
	const [activeDevice, setActiveDevice] = useState(device?.audio?.inputDevice);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		if (!device?.audio?.inputDevice) return;
		setActiveDevice(device?.audio?.inputDevice);
	}, [device?.audio?.inputDevice]);

	return (
		<CardFooter className='p-3 space-x-1.5 justify-between'>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={muted ? 'destructive' : 'accepting'}
						size='icon'
						onClick={() => setMuted((prev) => !prev)}
					>
						<Mic className='w-3.5 h-3.5' />
					</Button>
				</TooltipTrigger>

				<TooltipContent
					side='top'
					align='center'
				>
					<span>Mute</span>
				</TooltipContent>
			</Tooltip>

			<div className='flex items-center gap-1.5'>
				<Tooltip>
					<TooltipTrigger asChild>
						<WorkerSelector
							actionFn={(isWorker, id) => {
								if (isWorker) {
									transferTask?.mutate({
										to: id as string,
										options: {},
									});
									updateParticipants('transferredWorker', id as string).then(console.log);
								} else {
									const parsedNumber = id as string;
									// parsePhoneNumber(id as string, 'US', 'E.164').formattedNumber ?? '';
									const attributes = {
										externalContact: id,
										// externalContact: parsePhoneNumber(id as string, 'US').formattedNumber,
									};
									addExternalParticipant?.mutate({
										From: task?.attributes.to ?? task?.attributes.from,
										To: parsedNumber,
										attributes,
									});
								}
							}}
						>
							<Button
								variant='secondary'
								size='icon'
								className='brightness-105'
							>
								<UserPlus2 />
							</Button>
						</WorkerSelector>
					</TooltipTrigger>

					<TooltipContent
						side='top'
						align='center'
					>
						<span>Transfer Call</span>
					</TooltipContent>
				</Tooltip>

				<Popover>
					<Tooltip>
						<TooltipTrigger asChild>
							<PopoverTrigger asChild>
								<Button
									variant='secondary'
									size='icon'
									className='brightness-105'
								>
									<Grip className='h-3.5 w-3.5' />
								</Button>
							</PopoverTrigger>
						</TooltipTrigger>

						<TooltipContent
							side='top'
							align='center'
						>
							<span>Show Keypad</span>
						</TooltipContent>
					</Tooltip>

					<PopoverContent
						side='bottom'
						align='start'
						className='w-auto'
						forceMount
					>
						<Dialpad onValueChange={(value) => activeCall?.sendDigits(value)} />
					</PopoverContent>
				</Popover>

				{/* <Popover>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <Button variant="secondary" size="icon">
                                    <Headset className="h-3.5 w-3.5" />
                                </Button>
                            </PopoverTrigger>
                        </TooltipTrigger>

                        <TooltipContent side="top" align="center">
                            <span>Show Device Picker</span>
                        </TooltipContent>
                    </Tooltip>

                    <PopoverContent
                        className="w-[200px] p-0"
                        side="bottom"
                        align="start"
                    >
                        <DevicePicker />
                    </PopoverContent>
                </Popover> */}

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='secondary'
							size='icon'
							className='brightness-105'
						>
							<Headset className='h-3.5 w-3.5' />
						</Button>
					</PopoverTrigger>
					<PopoverContent className='p-0'>
						<Command defaultValue={activeDevice?.deviceId}>
							<CommandList>
								<CommandGroup>
									{Array.from(device?.audio?.availableInputDevices?.values() ?? []).map(
										(mediaDevice) => (
											<CommandItem
												key={mediaDevice.deviceId}
												value={mediaDevice.deviceId}
												onSelect={(currentValue) => {
													startTransition(async () => {
														await device?.audio?.setInputDevice(currentValue);
													});
													// setValue(
													//     currentValue === value
													//         ? ''
													//         : currentValue
													// )
													// setOpen(false)
												}}
											>
												{mediaDevice.label}
												<Check
													className={cn(
														'ml-auto',
														activeDevice?.deviceId === mediaDevice.deviceId
															? 'opacity-100'
															: 'opacity-0'
													)}
												/>
											</CommandItem>
										)
									)}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>

			<div className='flex items-center gap-1.5'>
				{Object.keys(conferenceParticipants ?? {}).length > 2 && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size='icon'
								onClick={() => {
									removeConferenceParticipant(conference?.sid ?? '', conference?.participants.worker);
									removeParticipantByName('worker');
									wrapUpTask?.mutate('Transfered');
								}}
							>
								<ArrowRightFromLine />
								<span className='sr-only'>Leave Call</span>
							</Button>
						</TooltipTrigger>

						<TooltipContent
							side='top'
							align='center'
						>
							<span>Leave Call</span>
						</TooltipContent>
					</Tooltip>
				)}

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant='destructive'
							size='icon'
							onClick={() => endConference?.()}
						>
							<Phone className='rotate-[135deg]' />
						</Button>
					</TooltipTrigger>

					<TooltipContent
						side='top'
						align='center'
					>
						<span>End Call</span>
					</TooltipContent>
				</Tooltip>
			</div>
		</CardFooter>
	);
};

export default ActiveCallFooter;
