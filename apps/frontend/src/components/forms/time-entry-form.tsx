import LabeledInput from '@/components/labeled-input';
import { TimePicker } from '@/components/time-picker-input';
import Tiptap from '@/components/tip-tap';
import { createTimeEntrySchema, type ServiceTicket } from '@/types/manage';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

interface Props {
	ticket: ServiceTicket;
}

const TimeEntryForm = ({ ticket }: Props) => {
	const form = useForm<z.infer<typeof createTimeEntrySchema>>({
		resolver: zodResolver(createTimeEntrySchema),
		defaultValues: {
			timeStart: new Date().toISOString(),
			ticket: { id: ticket?.id },
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof createTimeEntrySchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values);
	}
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-8'
			>
				<FormField
					control={form.control}
					name='ticket'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Charge To</FormLabel>
							<FormControl>
								<Input
									disabled
									value={`#${ticket.id} - ${ticket.summary}`}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='timeStart'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Start Time</FormLabel>
							<FormControl>
								<TimePicker
									date={new Date(field.value)}
									setDate={(date) => field.onChange(date?.toISOString())}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='timeEnd'
					render={({ field }) => (
						<FormItem>
							<FormLabel>End Time</FormLabel>
							<FormControl>
								<TimePicker
									date={field.value ? new Date(field.value) : new Date()}
									setDate={(date) => field.onChange(date?.toISOString())}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='notes'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Notes</FormLabel>
							<FormControl>
								<Tiptap
									className='min-h-48 p-3 border rounded-md'
									content={field.value}
									onUpdate={({ editor }) => {
										field.onChange(editor.getText());
									}}
									autofocus
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type='submit'>Submit</Button>
			</form>
		</Form>
		// <form className='space-y-3'>
		// 	<LabeledInput
		// 		name='note'
		// 		label='Charge To'
		// 		disabled
		// 		// defaultValue={`#${ticket.id} - ${ticket.summary}`}
		// 	/>

		// 	<LabeledInput
		// 		name='start_time'
		// 		label='Start Time'
		// 		type='date'
		// 	>
		// <TimePicker
		// 	date={new Date()}
		// 	setDate={() => {}}
		// />
		// 	</LabeledInput>

		// 	<LabeledInput
		// 		name='end_time'
		// 		label='End Time'
		// 		type='date'
		// 	>
		// 		<TimePicker
		// 			date={new Date()}
		// 			setDate={() => {}}
		// 		/>
		// 	</LabeledInput>

		// 	<LabeledInput
		// 		name='notes'
		// 		label='Notes'
		// 	>
		// <Tiptap
		// 	className='min-h-48 p-3 border rounded-md'
		// 	autofocus
		// />
		// 	</LabeledInput>
		// </form>
	);
};

export default TimeEntryForm;
