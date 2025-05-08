import OutboundDialerContent, { outboundPhoneSchema } from '@/components/outbound-dialer-content';
import { useWorker } from '@/providers/worker-provider';
import { toast } from 'sonner';
import { lookupPhoneNumber } from '@/lib/twilio/phoneNumbers';
import { z } from 'zod';

export const numbers: Record<string, string> = {
	'214': '+12142148356',
	'281': '+12817208356',
	'337': '+13377067517',
};

const OutboundDialer = () => {
	const { worker } = useWorker();

	async function onSubmit(values: z.infer<typeof outboundPhoneSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		try {
			const to = values.To;
			const splitNumber: string[] = to.split(' ');
			const areaCode = splitNumber?.[1];
			const numberReturn = await lookupPhoneNumber(to);
			await worker?.createTask(
				to,
				// @ts-ignore
				(numbers[areaCode] as string) ?? process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
				process.env.NEXT_PUBLIC_TWILIO_WORKFLOW_SID!,
				process.env.NEXT_PUBLIC_TWILIO_TASK_QUEUE_SID!,
				{
					attributes: {
						direction: 'outbound',
						name: numberReturn?.name,
						companyId: numberReturn?.companyId,
						contactId: numberReturn?.userId,
					},
					taskChannelUniqueName: 'voice',
				}
			);
		} catch (error) {
			console.error(error);
			toast.error(JSON.stringify(error, null, 2));
		}
	}

	return (
		<OutboundDialerContent
			numbers={[]}
			onSubmit={onSubmit}
		/>
	);
};

export default OutboundDialer;
