'use client';
import { Keypad } from '@/components/keypad';
import { ListSelector } from '@/components/list-selector';
import { AsyncSelect } from '@/components/ui/async-select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ColoredBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getContacts } from '@/lib/manage/read';
import { getActivitiesQuery, getWorkerQuery } from '@/lib/twilio/api';
import {
	getConversations,
	getPhoneNumbers,
	lookupPhoneNumber,
} from '@/lib/twilio/read';
import { cn, env } from '@/lib/utils';
import type { Contact } from '@/types/manage';
import { createEngagementSchema, Direction } from '@/types/twilio';
import { useMutation, useQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import {
	ChevronDown,
	Loader2,
	MessageCircle,
	Phone,
	Smartphone,
	UserPlus,
	Volume1,
	type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { createClient } from '@/utils/twilio';
import AudioSelector from '@/components/audio-selector';
import { useTwilio } from '@/contexts/twilio-provider';

const attributesSchema = z.object({
	contactId: z.number(),
	companyId: z.number().optional(),
	name: z.string(),
});

const searchParams = z.object({
	channel: z.enum(['voice', 'sms']),
	to: z.string().optional(),
	attributes: attributesSchema.optional(),
});

const channelOptions: { label: string; value: string; icon: LucideIcon }[] = [
	{ label: 'Voice', value: 'voice', icon: Phone },
	{ label: 'SMS', value: 'sms', icon: MessageCircle },
];

export const Route = createFileRoute('/_authed/engagements/new')({
	component: RouteComponent,
	validateSearch: zodValidator(searchParams),
});

function RouteComponent() {
	const { channel, to, attributes } = Route.useSearch();
	const { workerSid, accessToken } = Route.useRouteContext();

	const { device } = useTwilio();

	// const [open, setOpen] = useState(false);

	// const { handleEngagementCreation } = useWorker();

	const [
		{ data: phoneNumbers, isLoading },
		{ data: activities },
		{ data: worker },
	] = useQueries({
		queries: [
			{
				queryKey: ['phone-numbers'],
				queryFn: async () =>
					await getPhoneNumbers({ data: { beta: false } }),
			},
			getActivitiesQuery(),
			getWorkerQuery(workerSid),
		],
	});

	// 1. Define your form.
	const form = useForm<z.infer<typeof createEngagementSchema>>({
		resolver: zodResolver(createEngagementSchema),
		defaultValues: {
			to,
			from: env.VITE_TWILIO_PHONE_NUMBER,
			channel: channel ?? 'voice',
			attributes,
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof createEngagementSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		const { to, from, channel, attributes } = values;

		const { phoneNumber } = await lookupPhoneNumber({ data: to });

		console.log(phoneNumber);

		// await device?.connect({
		// 	params: {
		// 		To: '+19015988651',
		// 	},
		// });

		// if (channel === 'voice')
		// 	return handleEngagementCreation?.mutate({
		// 		to: phoneNumber,
		// 		from,
		// 		channel,
		// 		attributes: {
		// 			direction: Direction.Outbound,
		// 			...(attributes ?? {}),
		// 		},
		// 	});

		// const conversations = await getConversations({
		// 	data: {
		// 		address: `rcs:${phoneNumber}`,
		// 	},
		// });

		// console.log(conversations);

		// const conversationSid = conversations?.[0]?.conversationSid;
		// handleEngagementCreation?.mutate({
		// 	to,
		// 	from,
		// 	channel,
		// 	attributes: {
		// 		direction: Direction.Outbound,
		// 		conversationSid,
		// 		...(attributes ?? {}),
		// 	},
		// });
	}

	return (
		<ResizablePanelGroup direction='horizontal'>
			<ResizablePanel
				minSize={30}
				maxSize={60}
				autoSave='engagement-control-panel'
				className='h-[calc(100svh-var(--navbar-height))]'
			>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='flex flex-col h-[calc(100svh-var(--navbar-height))] overflow-y-scroll'
					>
						{/* <header className='flex items-center justify-between p-4 border-b'>
							<FormField
								control={form.control}
								name='from'
								render={({ field }) => (
									<FormItem className='flex flex-col'>
										<FormLabel className='uppercase text-xs text-muted-foreground'>
											New call from
										</FormLabel>

										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant='ghost'
													className='-ml-3'
													disabled={isLoading}
												>
													<Avatar className='bg-primary text-white size-6'>
														<AvatarFallback className='bg-primary text-white'>
															<Smartphone className='size-3' />
														</AvatarFallback>
													</Avatar>
													{isLoading
														? field.value
														: phoneNumbers?.find(
																(phoneNumber) =>
																	phoneNumber.phoneNumber ===
																	field.value
															)?.friendlyName}
													<ChevronDown />
												</Button>
											</PopoverTrigger>

											<PopoverContent
												align='start'
												className='p-0'
											>
												<ListSelector
													items={phoneNumbers ?? []}
													currentValue={phoneNumbers?.find(
														(phoneNumber) =>
															phoneNumber.phoneNumber ===
															env.VITE_TWILIO_PHONE_NUMBER
													)}
													itemView={(phone) => (
														<div>
															{phone.friendlyName}
														</div>
													)}
													onSelect={(phone) =>
														form.setValue(
															'from',
															phone.phoneNumber
														)
													}
													placeholder='Select a phone number'
													value={(phone) =>
														`${phone.friendlyName} ${phone.phoneNumber}`
													}
												/>
											</PopoverContent>
										</Popover>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='channel'
								render={({ field }) => {
									const selectedChannel = channelOptions.find(
										(c) => c.value === field.value
									);
									return (
										<FormItem className='flex flex-col items-end text-right'>
											<FormLabel className='uppercase text-xs text-muted-foreground text-right'>
												Using
											</FormLabel>

											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant='ghost'
														className='-mr-3'
														disabled={isLoading}
													>
														<Avatar className='size-6'>
															<AvatarFallback className='bg-secondary text-primary'>
																{selectedChannel && (
																	<selectedChannel.icon className='size-3' />
																)}
															</AvatarFallback>
														</Avatar>
														{selectedChannel?.label}
														<ChevronDown />
													</Button>
												</PopoverTrigger>

												<PopoverContent
													align='end'
													className='p-0'
												>
													<ListSelector
														items={
															channelOptions ?? []
														}
														currentValue={
															selectedChannel
														}
														itemView={(channel) => (
															<div className='flex items-center gap-1.5'>
																<channel.icon />
																<span>
																	{
																		channel.label
																	}
																</span>
															</div>
														)}
														onSelect={(channel) =>
															form.setValue(
																'channel',
																channel.value as z.infer<
																	typeof createTaskSchema
																>['channel']
															)
														}
														placeholder='Select a channel'
														value={(phone) =>
															`${phone.value} ${phone.label}`
														}
													/>
												</PopoverContent>
											</Popover>
										</FormItem>
									);
								}}
							/>
						</header> */}

						<FormField
							control={form.control}
							name='to'
							render={({ field }) => (
								<FormItem className='p-6 flex flex-col items-center gap-6'>
									<div>
										<p className='text-lg text-center text-muted-foreground'>
											{form.getValues().attributes?.name}
										</p>

										<div className='w-full flex items-center gap-3 justify-center'>
											<Input
												placeholder='Enter name or number'
												className={cn(
													'border-none shadow-none text-center md:text-3xl text-muted-foreground w-fit',
													field.value &&
														'text-foreground'
												)}
												onKeyDown={
													disallowNonNumericInput
												}
												onKeyUp={(e) =>
													form.setValue(
														'to',
														formatPhoneFromInputEvent(
															e
														)
													)
												}
												{...field}
											/>

											<AsyncSelect<Contact>
												label='Contact'
												onChange={(e) => {
													console.log(e);
													// setValue(e.target.value);
												}}
												fetcher={async (
													query,
													page
												) => {
													const names = query
														?.trim()
														.split(' ');
													const firstName =
														names?.[0];
													const lastName = names?.[1];

													const nameSearch = lastName
														? `firstName contains '${firstName}' and (company/name contains '${lastName}' or lastName contains '${lastName}')`
														: `company/name contains '${firstName}' or firstName contains '${firstName}' or lastName contains '${firstName}'`;

													const contactConditions =
														query
															? `inactiveFlag = false and (${nameSearch})`
															: 'inactiveFlag = false';

													const { data } =
														await getContacts({
															data: {
																page,
																fields: [
																	'id',
																	'firstName',
																	'lastName',
																	'communicationItems',
																	'defaultPhoneNbr',
																	'company',
																],
																orderBy: {
																	key: 'firstName',
																},
																childConditions:
																	'types/id = 17 or types/id = 21',
																conditions:
																	contactConditions,
															},
														});

													return data;
												}}
												getDisplayValue={(item) => (
													<div>
														<p>
															{item.firstName}{' '}
															{item.lastName}
														</p>

														<p>
															{item.communicationItems
																?.filter(
																	(i) =>
																		i.communicationType ===
																		'Phone'
																)
																?.map((i) => (
																	<p className='text-xs text-muted-foreground'>
																		{
																			i.value
																		}
																	</p>
																))}
														</p>
													</div>
												)}
												getOptionValue={(item) =>
													item.id.toString()
												}
												renderOption={(item) => (
													<>
														{item.communicationItems
															?.filter(
																(i) =>
																	i.communicationType ===
																	'Phone'
															)
															?.map((i) => (
																<CommandItem
																	value={
																		i.value
																	}
																	onSelect={() => {
																		form.setValue(
																			'to',
																			formatPhoneFromString(
																				i.value
																			)
																		);
																		form.setValue(
																			'attributes',
																			{
																				contactId:
																					item.id,
																				name: `${item.firstName} ${item.lastName}`,
																				companyId:
																					item
																						.company
																						?.id,
																			}
																		);
																	}}
																>
																	<div>
																		<p>
																			{
																				item.firstName
																			}{' '}
																			{
																				item.lastName
																			}{' '}
																			{item.defaultPhoneNbr ===
																				i.value && (
																				<ColoredBadge
																					variant='yellow'
																					className='text-xs ml-1.5 px-1.5 py-1'
																				>
																					Default
																				</ColoredBadge>
																			)}
																		</p>

																		<p className='text-sm text-muted-foreground'>
																			{
																				i
																					.type
																					.name
																			}
																			:{' '}
																			{
																				i.value
																			}
																		</p>
																	</div>
																</CommandItem>
															))}
													</>
												)}
												value=''
												className='w-96'
												align='end'
											>
												<Button
													variant='outline'
													size='icon'
												>
													<UserPlus />
												</Button>
											</AsyncSelect>
										</div>
									</div>

									<Separator className='-mt-1.5' />

									<div>
										<Keypad
											onValueChange={(e) => {
												const newValue =
													(form.getValues()?.to ??
														'') + e;

												form.setValue(
													'to',
													formatPhoneFromString(
														newValue
													)
												);
											}}
										/>
									</div>
								</FormItem>
							)}
						/>

						<Button
							size='icon'
							className='rounded-full size-12 mx-auto'
							type='submit'
							disabled={
								!activities?.find(
									(a) => a.sid === worker?.activitySid
								)?.available
							}
						>
							{/* {handleEngagementCreation?.isPending ||
							form.formState.isSubmitting ? (
								<Loader2 className='size-5 animate-spin' />
							) : (
								<>
									{form.getValues()?.channel === 'voice' ? (
										<Phone className='size-5' />
									) : (
										<MessageCircle className='size-5' />
									)}
								</>
							)} */}
						</Button>

						{form.getValues()?.channel === 'voice' && (
							<AudioSelector />
						)}
					</form>
				</Form>
			</ResizablePanel>

			<ResizableHandle />

			<ResizablePanel className='flex flex-col h-[calc(100svh-var(--navbar-height))]'>
				<ScrollArea className='h-[calc(100svh-var(--navbar-height))]'></ScrollArea>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}

const disallowNonNumericInput = (
	evt: React.KeyboardEvent<HTMLInputElement>
) => {
	if (evt.ctrlKey) {
		return;
	}
	if (evt.key.length > 1) {
		return;
	}
	if (/[0-9.]/.test(evt.key)) {
		return;
	}
	evt.preventDefault();
};

function formatPhoneFromString(current: string) {
	const digits = current.replace(/\D/g, '').substring(0, 10);
	const areaCode = digits.substring(0, 3);
	const prefix = digits.substring(3, 6);
	const suffix = digits.substring(6, 10);

	if (digits.length > 6) {
		current = `(${areaCode}) ${prefix} - ${suffix}`;
	} else if (digits.length > 3) {
		current = `(${areaCode}) ${prefix}`;
	} else if (digits.length > 0) {
		current = `(${areaCode}`;
	}

	return current;
}

function formatPhoneFromInputEvent(evt: React.KeyboardEvent<HTMLInputElement>) {
	let current = evt.currentTarget.value;
	const digits = current.replace(/\D/g, '').substring(0, 10);
	const areaCode = digits.substring(0, 3);
	const prefix = digits.substring(3, 6);
	const suffix = digits.substring(6, 10);

	if (digits.length > 6) {
		current = `(${areaCode}) ${prefix} - ${suffix}`;
	} else if (digits.length > 3) {
		current = `(${areaCode}) ${prefix}`;
	} else if (digits.length > 0) {
		current = `(${areaCode}`;
	}

	return current;
}
