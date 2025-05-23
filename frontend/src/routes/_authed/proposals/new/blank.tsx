import LabeledInput from '@/components/labeled-input';
import { AsyncSelect } from '@/components/ui/async-select';
import { Button } from '@/components/ui/button';
import { CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { useProposals } from '@/hooks/use-proposals';
import { getTemplates, getTickets, searchProjectTemplates, searchServiceTickets } from '@/lib/manage/read';
import { cn } from '@/lib/utils';
import type { ProjectTemplate, ServiceTicket } from '@/types/manage';
import { createFileRoute } from '@tanstack/react-router';
import { Building, ChevronDown, Command, Loader2, User } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/_authed/proposals/new/blank')({
	component: RouteComponent,
});

function RouteComponent() {
	const [name, setName] = useState<string>('');
	const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | undefined>();
	const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | undefined>();
	const { data: proposals, handleProposalInsert } = useProposals({});

	return (
		<div className='grid grid-cols-[450px_1fr] gap-16 p-12 container mx-auto'>
			<form
				className='space-y-6 flex flex-col'
				onSubmit={(e) => {
					e.preventDefault();
					handleProposalInsert.mutate({
						proposal: {
							name,
							service_ticket: selectedTicket?.id,
							templates_used: selectedTemplate ? [selectedTemplate.id, 93] : [93],
							company: selectedTicket?.company,
							contact: selectedTicket?.contact,
						},
					});
				}}
			>
				<h1 className='text-3xl'>New proposal</h1>

				<LabeledInput
					name='name'
					label='Proposal Name'
					placeholder='My proposal'
					description='Project name is required.'
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>

				<LabeledInput
					name='service_ticket'
					label='Service Ticket'
					className='w-full'
					required
				>
					<AsyncSelect<ServiceTicket>
						fetcher={async (query, page) => {
							const { data } = await getTickets({
								data: {
									conditions: {
										closedFlag: false,
										'board/id': 38,
										summary: query
											? {
													value: `'${query}'`,
													comparison: 'contains',
												}
											: undefined,
									},
									page,
									fields: ['id', 'summary', 'company', 'contact'],
									orderBy: { key: 'summary' },
								},
							});

							return data;
						}}
						renderOption={(item) => (
							<CommandItem
								value={item.id.toString()}
								className='flex items-center gap-1.5'
								onSelect={() => {
									setSelectedTicket(item);
									if (name.length === 0) {
										setName(`#${item.id} - ${item.summary}`);
									}
								}}
							>
								<div className='flex flex-col'>
									<p className='font-medium line-clamp-1'>
										#{item.id} - {item.summary}
									</p>
									<p className='text-xs text-muted-foreground flex items-center gap-1.5'>
										<Building className='size-3' />
										<span>{item.company?.name}</span>

										{item.contact && (
											<>
												<span>-</span>
												<User className='size-3' />
												<span>{item.contact?.name}</span>
											</>
										)}
									</p>
								</div>
							</CommandItem>
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
							if (name.length === 0) {
								setName(`#${value.id} - ${value.summary}`);
							}
						}}
						className='w-[var(--radix-popover-trigger-width)]'
					>
						<Button
							variant='outline'
							role='combobox'
							className={cn('justify-between', !selectedTicket && 'text-muted-foreground')}
						>
							<span className='line-clamp-1'>
								{selectedTicket
									? `#${selectedTicket.id} - ${selectedTicket.summary}`
									: 'Select a ticket...'}
							</span>
							<ChevronDown className='opacity-75' />
						</Button>
					</AsyncSelect>

					<Input
						hidden
						className='hidden'
						value={selectedTicket?.id}
					/>
				</LabeledInput>

				<LabeledInput
					name='project_templates'
					label='Project Template'
				>
					<AsyncSelect<ProjectTemplate>
						fetcher={async (query, page) =>
							await getTemplates({
								data: {
									conditions: {
										name: query
											? {
													value: query,
													comparison: 'contains',
												}
											: undefined,
									},
									page,
									fields: ['id', 'name', 'description'],
									orderBy: { key: 'name' },
								},
							})
						}
						renderOption={(item) => (
							<CommandItem
								value={item.id.toString()}
								onSelect={() => setSelectedTemplate(item)}
								className='font-medium'
							>
								{item.name}
							</CommandItem>
						)}
						getOptionValue={(item) => item.id.toString()}
						getDisplayValue={(item) => (
							<div className='flex flex-col'>
								<div className='font-medium'>{item.name}</div>
								<div className='text-xs text-muted-foreground'>{item.id}</div>
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
							<ChevronDown className='opacity-75' />
						</Button>
					</AsyncSelect>

					<Input
						hidden
						className='hidden'
						value={selectedTemplate?.id}
					/>
				</LabeledInput>

				<Button
					type='submit'
					className='w-full'
					disabled={!selectedTicket || name.length === 0 || handleProposalInsert.isPending}
				>
					{handleProposalInsert.isPending && <Loader2 className='mr-1.5 animate-spin' />}
					<span>{handleProposalInsert.isPending ? 'Creating...' : 'Continue'}</span>
				</Button>
			</form>

			<div
				className='relative mr-16 '
				style={{
					transitionProperty: 'transform',
					transformOrigin: '0 0',
					transitionDuration: '.4s',
					transform: 'translate(0) scale(1)',
				}}
				aria-hidden='true'
			>
				<img
					alt='This is a preview of your project'
					src='https://d3ki9tyy5l5ruj.cloudfront.net/obj/5b2813529d7aa52400e966efad11bfc51dcc7c10/Updated_Light_List.png'
					className='dark:hidden block bg-background rounded-xl max-w-none'
					style={{ width: 942 }}
				/>

				<img
					alt='This is a preview of your project'
					src='https://d3ki9tyy5l5ruj.cloudfront.net/obj/b74d7cc7e55c806b01707a426441e05449754a02/Updated_Dark_List.png'
					className='hidden dark:block bg-background rounded-xl max-w-none'
					style={{ width: 942 }}
				/>

				<span
					className='absolute'
					style={{ top: 21, left: 84 }}
					// style='top: 21px; left: 84px;'
				>
					<h5 className='max-w-[500px] text-lg font-medium'>{name}</h5>
				</span>
				<span
					className='absolute'
					style={{ top: 45, left: 84 }}
					// style='top: 45px; left: 84px;'
				>
					<ul className='flex gap-2'>
						<div
							className='h-4 mt-1 rounded-[2px] bg-muted'
							style={{ width: 39 }}
							// style='width: 39px;'
						></div>
						<div
							className='h-4 mt-1 rounded-[2px] bg-muted'
							style={{ width: 65 }}
						></div>
						<div
							className='h-4 mt-1 rounded-[2px] bg-muted'
							style={{ width: 39 }}
						></div>
						<div
							className='h-4 mt-1 rounded-[2px] bg-muted'
							style={{ width: 65 }}
						></div>
					</ul>
				</span>
			</div>
		</div>
	);
}
