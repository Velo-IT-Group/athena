import React from 'react';
import LabeledInput from '@/components/labeled-input';
import { ProjectTemplate, ServiceTicket } from '@/types/manage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AsyncSelect } from '@/components/ui/async-select';
import { searchProjectTemplates, searchServiceTickets } from '@/lib/manage/read';

type Props = {
	tickets: ServiceTicket[];
	templates: ProjectTemplate[];
};

const NewProposalForm = () => {
	const [selectedTicket, setSelectedTicket] = React.useState<ServiceTicket | undefined>();
	const [selectedTemplate, setSelectedTemplate] = React.useState<ProjectTemplate | undefined>();

	return (
		<>
			<LabeledInput
				name='service_ticket'
				label='Service Ticket'
				required
			>
				<AsyncSelect<ServiceTicket>
					fetcher={(value) => searchServiceTickets({ data: { query: value ?? '' } })}
					renderOption={(item) => (
						<div className='flex items-center gap-2'>
							<div className='flex flex-col'>
								<div className='font-medium'>{item.summary}</div>
								{/* <div className='text-xs text-muted-foreground'>
									{item.identifier}
									{item.productClass === 'Bundle' && (
										<Badge
											variant='outline'
											className='ml-1.5'
										>
											Bundle
										</Badge>
									)}
								</div> */}
							</div>
						</div>
					)}
					getOptionValue={(item) => item.id.toString()}
					getDisplayValue={(item) => (
						<div className='flex items-center gap-2'>
							<div className='flex flex-col'>
								<div className='font-medium'>{item.summary}</div>
								<div className='text-xs text-muted-foreground'>{item.id}</div>
							</div>
						</div>
					)}
					notFound={<div className='py-6 text-center text-sm'>No tickets found</div>}
					label='Tickets'
					placeholder='Search tickets...'
					value={selectedTicket?.id.toString() ?? ''}
					onChange={(value) => {
						if (!value) {
							setSelectedTicket(undefined);
							return;
						}
						setSelectedTicket(value);
					}}
					className='w-[var(--radix-popover-trigger-width)]'
				>
					<Button
						variant='outline'
						role='combobox'
						className={cn('justify-between', !selectedTicket && 'text-muted-foreground')}
					>
						{selectedTicket ? `#${selectedTicket.id} - ${selectedTicket.summary}` : 'Select a ticket...'}
						<ChevronsUpDown className='opacity-50' />
					</Button>
				</AsyncSelect>
				{/* <Popover>
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							role='combobox'
							className={cn('justify-between', !selectedTicket && 'text-muted-foreground')}
						>
							{selectedTicket
								? `#${selectedTicket.id} - ${selectedTicket.summary}`
								: 'Select a ticket...'}
							<ChevronsUpDown className='opacity-50' />
						</Button>
					</PopoverTrigger>

					<ModalPopoverContent className='w-[var(--radix-popover-trigger-width)] p-0'>
						
						<ListSelector
							items={tickets}
							currentValue={tickets.find((t) => t.id === selectedTicket?.id)}
							onSelect={(e) => setSelectedTicket(e)}
							itemView={(item) => (
								<div>
									#{item.id} - {item.summary}
								</div>
							)}
							value={(item) => `#${item.id} - ${item.summary}`}
						/>
					</ModalPopoverContent>
				</Popover> */}

				<Input
					hidden
					className='hidden'
					value={selectedTicket?.id}
				/>
			</LabeledInput>

			<LabeledInput
				name='name'
				label='Name'
				placeholder='Name'
				defaultValue={selectedTicket ? `#${selectedTicket.id} - ${selectedTicket.summary}` : ''}
				tabIndex={1}
				required
			/>

			<LabeledInput
				name='project_templates'
				label='Project Template'
			>
				<AsyncSelect<ProjectTemplate>
					fetcher={searchProjectTemplates}
					renderOption={(item) => (
						<div className='flex items-center gap-2'>
							<div className='flex flex-col'>
								<div className='font-medium'>{item.name}</div>
								{/* <div className='text-xs text-muted-foreground'>
									{item.identifier}
									{item.productClass === 'Bundle' && (
										<Badge
											variant='outline'
											className='ml-1.5'
										>
											Bundle
										</Badge>
									)}
								</div> */}
							</div>
						</div>
					)}
					getOptionValue={(item) => item.id.toString()}
					getDisplayValue={(item) => (
						<div className='flex items-center gap-2'>
							<div className='flex flex-col'>
								<div className='font-medium'>{item.name}</div>
								<div className='text-xs text-muted-foreground'>{item.id}</div>
							</div>
						</div>
					)}
					notFound={<div className='py-6 text-center text-sm'>No templates found</div>}
					label='Templates'
					placeholder='Search templates...'
					value={selectedTemplate?.id.toString() ?? ''}
					onChange={(value) => {
						if (!value) {
							setSelectedTemplate(undefined);
							return;
						}
						setSelectedTemplate(value);
					}}
					className='w-[var(--radix-popover-trigger-width)]'
				>
					<Button
						variant='outline'
						role='combobox'
						className={cn('justify-between', !selectedTemplate && 'text-muted-foreground')}
					>
						{selectedTemplate ? selectedTemplate.name : 'Select a template...'}
						<ChevronsUpDown className='opacity-50' />
					</Button>
				</AsyncSelect>

				<Input
					hidden
					className='hidden'
					value={selectedTemplate?.id}
				/>
			</LabeledInput>
		</>
	);
};

export default NewProposalForm;
