'use client';
import { createEngagementSchema } from '@athena/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, Phone } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DevicePicker from '@/components/device-picker';
import { Keypad } from '@/components/keypad';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTwilio } from '@/contexts/twilio-provider';
import { cn, env } from '@/lib/utils';

export const numbers: Record<string, string> = {
	'214': '+12142148356',
	'281': '+12817208356',
	'337': '+13377067517',
};

const OutboundDialer = () => {
	const [open, setOpen] = useState(false);
	// const [hasDetectedAudio, setHasDetectedAudio] = useState(false);
	const { worker, device, createEngagement, hasDetectedAudio } = useTwilio();
	const [attemptedEngagement, setAttemptedEngagement] = useState<z.infer<
		typeof createEngagementSchema
	> | null>(null);

	// 1. Define your form.
	const form = useForm<z.infer<typeof createEngagementSchema>>({
		resolver: zodResolver(createEngagementSchema),
		defaultValues: {
			to: '',
			from: env.VITE_TWILIO_PHONE_NUMBER,
			channel: 'voice',
			direction: 'outbound',
			name: '',
			territoryName: '',
			companyId: -1,
			userId: -1,
		},
	});

	return (
		<AlertDialog
			open={open}
			onOpenChange={setOpen}
		>
			<Card>
				<CardContent className='p-0'>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit((d) => {
								console.log(d);
								if (!hasDetectedAudio) {
									setAttemptedEngagement(d);
									setOpen(true);
									return;
								}
								createEngagement.mutate(d);
							})}
							className='flex flex-col'
						>
							<FormField
								control={form.control}
								name='to'
								render={({ field }) => (
									<FormItem className='flex flex-col items-center '>
										<div className='flex flex-col items-center w-full'>
											<p className='text-lg text-center text-muted-foreground'>
												{
													form.getValues().attributes
														?.name
												}
											</p>

											<div className='flex items-center gap-3 justify-center w-full'>
												<Input
													placeholder='Enter name or number'
													className={cn(
														'border-none shadow-none text-muted-foreground w-full mt-3',
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
											</div>
										</div>

										<Separator className='-mt-1.5' />

										<Keypad
											onValueChange={(e) => {
												device?.audio?.speakerDevices.test(
													`https://sdk.twilio.com/js/client/sounds/releases/1.0.0/dtmf-${e}.mp3?cache=2.15.0`
												);
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
									</FormItem>
								)}
							/>

							<Button
								size='icon'
								className='size-12 mx-auto my-3'
								type='submit'
								// disabled={
								// 	!form.formState.isValid ||
								// 	createEngagement.isPending
								// }
							>
								{createEngagement.isPending ? (
									<Loader className='animate-spin' />
								) : (
									<Phone className='size-6 fill-white stroke-0' />
								)}
							</Button>
						</form>
					</Form>

					{createEngagement.error && (
						<p className='text-destructive'>
							{createEngagement.error.message}
						</p>
					)}
				</CardContent>
			</Card>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						No input volume detected.
					</AlertDialogTitle>

					<AlertDialogDescription>
						It appears no audio input is being detected. Please
						check your microphone settings. If you're okay with
						this, you can still set your activity to available.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<Card>
					<CardContent>
						<DevicePicker />
					</CardContent>
				</Card>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							if (!worker || !attemptedEngagement) return;
							createEngagement.mutate(attemptedEngagement);
							setAttemptedEngagement(null);
						}}
						disabled={!worker || !attemptedEngagement}
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

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

export default OutboundDialer;
