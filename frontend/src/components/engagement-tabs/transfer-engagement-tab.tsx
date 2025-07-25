import { AsyncSelect } from '@/components/ui/async-select';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TabsContent } from '@/components/ui/tabs';
import { getMembersQuery } from '@/lib/manage/api';
import { getSystemMembers } from '@/lib/manage/read';
import { getWorkersQuery } from '@/lib/twilio/api';
import { env } from '@/lib/utils';
import { debounce } from '@tanstack/pacer/debouncer';
import { useQueries, type UseMutationResult } from '@tanstack/react-query';
import { ChevronLeft, Loader2, Search } from 'lucide-react';
import React, { Fragment, useCallback, useRef, useState } from 'react';
import type {
	ParticipantInstance,
	ParticipantListInstanceCreateOptions,
} from 'twilio/lib/rest/api/v2010/account/conference/participant';
import type { Task } from 'twilio-taskrouter';

interface Props {
	handleParticipantCreation: UseMutationResult<
		ParticipantInstance,
		Error,
		{ options: ParticipantListInstanceCreateOptions },
		unknown
	>;
	task: Task;
	handleBackClick: () => void;
}

const TransferEngagementTab = ({ handleParticipantCreation, task, handleBackClick }: Props) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState<string>('');
	const [debouncedValue, setDebouncedValue] = useState(value);
	const [isOpen, setIsOpen] = useState(false);

	const setValueDebouncer = useCallback(
		debounce(setDebouncedValue, {
			wait: 300,
			// enabled: instantCount > 2, // optional, defaults to true
		}),
		[]
	);

	const [{ data: workers, isLoading: isWorkersLoading }, { data: members, isLoading: isMembersLoading }] = useQueries(
		{
			queries: [
				getWorkersQuery({
					targetWorkersExpression: `full_name CONTAINS "${debouncedValue}" or friendly_name CONTAINS "${debouncedValue}" or phone_number contains "${debouncedValue}"`,
				}),
				getMembersQuery({
					conditions: `inactiveFlag = false and officePhone != null and (firstName CONTAINS "${debouncedValue}" or lastName CONTAINS "${debouncedValue}" or homePhone CONTAINS "${debouncedValue}" or mobilePhone CONTAINS "${debouncedValue}" or officePhone CONTAINS "${debouncedValue}")`,
					fields: ['id', 'firstName', 'lastName', 'homePhone', 'mobilePhone', 'officePhone', 'defaultPhone'],
					pageSize: 1000,
				}),
			],
		}
	);

	return (
		<Popover
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<TabsContent value='transfer'>
				<Button
					variant='link'
					className='w-full'
					onClick={handleBackClick}
				>
					<ChevronLeft />
					<span>Back to call</span>
				</Button>

				<div className='flex flex-col items-center gap-6'>
					<h2 className='text-2xl font-semibold'>Transfer to</h2>

					<PopoverTrigger>
						<div className='relative'>
							<Input
								placeholder='Search...'
								className='h-8 w-96 px-6 bg-background'
								ref={inputRef}
								value={value}
								onChange={(event) =>
									setValue(() => {
										setValueDebouncer(event.target.value); // debounced state update
										return event.target.value; // instant state update
									})
								}
							/>
							{isWorkersLoading || isMembersLoading ? (
								<Loader2 className='absolute top-1/2 left-1.5 -translate-y-1/2 text-sm text-muted-foreground animate-spin' />
							) : (
								<Search className='absolute top-1/2 left-1.5 -translate-y-1/2 text-sm text-muted-foreground' />
							)}
						</div>
					</PopoverTrigger>

					<Button
						onClick={() => {
							console.log('running mutation');
							handleParticipantCreation.mutate({
								options: {
									from: env.VITE_TWILIO_PHONE_NUMBER,
									to: '+14693442265',
									endConferenceOnExit: false,
								},
							});
							handleBackClick();
						}}
					>
						{handleParticipantCreation.isPending && <Loader2 className='size-4 animate-spin' />}
						{handleParticipantCreation.isPending ? 'Transferring...' : 'Transfer'}
					</Button>
				</div>
			</TabsContent>

			<PopoverContent
				side='bottom'
				align='center'
				className='p-0 w-[var(--radix-popover-trigger-width)]'
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<Command shouldFilter={false}>
					<CommandList>
						{(!isWorkersLoading || !isMembersLoading) && <CommandEmpty>No items found.</CommandEmpty>}

						<CommandGroup heading='Internal'>
							{workers?.map((item) => {
								const attributes = JSON.parse(item.attributes);
								return (
									<CommandItem
										key={item.sid}
										value={JSON.stringify(item)}
										onSelect={() =>
											task.transfer(item.sid, {
												mode: 'WARM',
											})
										}
										className='border-b last:border-b-0 py-1.5'
									>
										<div>
											<p>
												<span className='font-semibold'>{attributes.full_name}</span> (Internal)
											</p>
											<p>{attributes.title}</p>
										</div>
									</CommandItem>
								);
							})}
						</CommandGroup>

						<CommandGroup heading='External'>
							{members?.map((item) => (
								<Fragment key={item.id}>
									{item.homePhone && (
										<CommandItem
											value={item.homePhone}
											onSelect={() => {
												handleParticipantCreation.mutate({
													options: {
														from: env.VITE_TWILIO_PHONE_NUMBER,
														to: item.homePhone ?? '',
														endConferenceOnExit: false,
														label: `${item.firstName} ${item.lastName}`,
													},
												});
												handleBackClick();
											}}
											className='border-b last:border-b-0 py-1.5'
										>
											<div>
												<p>
													<span className='font-semibold'>
														{item.firstName} {item.lastName}
													</span>{' '}
													(External)
												</p>
												<p>Home: {item.homePhone}</p>
											</div>
										</CommandItem>
									)}

									{item.mobilePhone && (
										<CommandItem
											value={item.mobilePhone}
											onSelect={() => {
												handleParticipantCreation.mutate({
													options: {
														from: env.VITE_TWILIO_PHONE_NUMBER,
														to: item.mobilePhone ?? '',
														endConferenceOnExit: false,
														label: `${item.firstName} ${item.lastName}`,
													},
												});
												handleBackClick();
											}}
											className='border-b last:border-b-0 py-1.5'
										>
											<div>
												<p>
													<span className='font-semibold'>
														{item.firstName} {item.lastName}
													</span>{' '}
													(External)
												</p>
												<p>Mobile: {item.mobilePhone}</p>
											</div>
										</CommandItem>
									)}

									{item.officePhone && (
										<CommandItem
											value={item.officePhone}
											onSelect={() => {
												handleParticipantCreation.mutate({
													options: {
														from: env.VITE_TWILIO_PHONE_NUMBER,
														to: item.officePhone ?? '',
														endConferenceOnExit: false,
														label: `${item.firstName} ${item.lastName}`,
													},
												});
												handleBackClick();
											}}
											className='border-b last:border-b-0 py-1.5'
										>
											<div>
												<p>
													<span className='font-semibold'>
														{item.firstName} {item.lastName}
													</span>{' '}
													(External)
												</p>
												<p>Office: {item.officePhone}</p>
											</div>
										</CommandItem>
									)}
								</Fragment>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default TransferEngagementTab;
