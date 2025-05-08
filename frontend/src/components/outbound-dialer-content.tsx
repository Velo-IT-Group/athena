import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/phone-input';
import { Form, FormField } from './ui/form';
import { useForm } from 'react-hook-form';
import { CreateParticipantParams } from '@/types/twilio';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type Props = {
	showNumbers?: boolean;
	numbers: { phoneNumber: string; friendlyName: string }[];
	onSubmit(values: z.infer<typeof outboundPhoneSchema>): Promise<void>;
};

export const outboundPhoneSchema = z.object({
	To: z.string(),
});

const OutboundDialerContent = ({ onSubmit }: Props) => {
	const form = useForm<CreateParticipantParams>({
		resolver: zodResolver(outboundPhoneSchema),
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-3'
			>
				<FormField
					control={form.control}
					name='To'
					render={({ field }) => <PhoneInput {...field} />}
				/>

				<Button
					type='submit'
					className='w-full'
					disabled={form.formState.disabled || form.formState.isSubmitting}
				>
					Dial
				</Button>
			</form>
		</Form>
	);
};

export default OutboundDialerContent;
