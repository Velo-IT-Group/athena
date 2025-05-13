import { outboundPhoneSchema } from '@/components/outbound-dialer-content';
import { useWorker } from '@/providers/worker-provider';
import { toast } from 'sonner';
import { lookupPhoneNumber } from '@/lib/twilio/phoneNumbers';
import { z } from 'zod';
import { getContacts } from '@/lib/manage/read';
import { Input } from '@/components/ui/input';
import { CommandItem } from '@/components/ui/command';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AsyncSelect } from '@/components/ui/async-select';
import { env } from '@/lib/utils';

export const numbers: Record<string, string> = {
	'214': '+12142148356',
	'281': '+12817208356',
	'337': '+13377067517',
};

const OutboundDialer = () => {
	const { handleEngagementCreation } = useWorker();

	async function onSubmit(values: z.infer<typeof outboundPhoneSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		try {
			const to = values.To;
			const splitNumber: string[] = to.split(' ');
			const areaCode = splitNumber?.[1];
			const numberReturn = await lookupPhoneNumber({ data: to });
			console.log(handleEngagementCreation);
			handleEngagementCreation?.mutate({
				to,
				from: (numbers[areaCode] as string) ?? env.VITE_TWILIO_PHONE_NUMBER,
				channel: 'voice',
				attributes: {
					direction: 'outbound',
					name: numberReturn?.name,
					companyId: numberReturn?.companyId,
					contactId: numberReturn?.userId,
				},
			});
		} catch (error) {
			console.error(error);
			toast.error(JSON.stringify(error, null, 2));
		}
	}

	return (
		<Card className='bg-[#FCFCFC]'>
			<CardHeader>
				<CardTitle>Start call</CardTitle>
				<CardDescription>Type in someones name or type in a phone number</CardDescription>
			</CardHeader>

			<CardContent>
				<AsyncSelect
					fetcher={async (value, page) => {
						const splitValue = (value ?? '').split(' ');

						const firstName = splitValue.length > 1 ? splitValue[0] : value;
						const lastName = splitValue.length > 1 ? splitValue[1] : value;
						const operator = splitValue.length > 1 ? 'and' : 'or';

						const { data } = await getContacts({
							data: {
								conditions: `firstName CONTAINS "${firstName}" ${operator} lastName CONTAINS "${lastName}"`,
								fields: ['id', 'firstName', 'lastName', 'communicationItems'],
								page,
							},
						});

						return data;
					}}
					label='Contact'
					onChange={(value) => {
						console.log(value);
					}}
					value={''}
					defaultOpen
					renderOption={(item) => (
						<>
							{item.communicationItems
								?.filter((item) => item.communicationType === 'Phone')
								?.map((i) => (
									<CommandItem
										key={i.id}
										value={i.id.toString()}
										onSelect={() => {
											onSubmit({
												To: i.value,
											});
										}}
									>
										<div key={i.id}>
											<p>
												<span className='font-semibold'>
													{item.firstName} {item.lastName}
												</span>{' '}
												(External)
											</p>
											<p className='truncate'>
												{i.type.name}: {i.value}
											</p>
										</div>
									</CommandItem>
								))}
						</>
					)}
					getOptionValue={(item) => item.id.toString()}
					getDisplayValue={(item) => `${item.firstName} ${item.lastName}`}
				>
					<Input
						placeholder='Search...'
						className='h-8 w-full px-6 bg-background'
						autoFocus
					/>
				</AsyncSelect>
			</CardContent>
		</Card>
	);
};

export default OutboundDialer;
