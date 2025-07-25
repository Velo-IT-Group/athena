import { Button } from '@/components/ui/button';
import {
	GripVertical,
	ChevronDown,
	Plus,
	Ellipsis,
	EyeOff,
	Pencil,
	Trash2,
	Eye,
} from 'lucide-react';
import {
	EditableArea,
	EditableInput,
	EditablePreview,
	Editable,
	EditableTrigger,
} from '@/components/ui/editable';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTicket } from '@/hooks/use-ticket';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import TicketListItem from './ticket-list-item';
import { cn } from '@/lib/utils';
import { useId, useState } from 'react';
import { KanbanColumnHandle, KanbanItem } from '@/components/ui/kanban';

interface Props {
	phase: Phase;
	tickets: NestedTicket[];
	params: { id: string; version: string };
	handleDeletion: () => void;
	handleDuplication: () => void;
	handleUpdate: (phase: PhaseUpdate) => void;
}

const PhaseListItem = ({
	phase,
	tickets: initialData,
	params,
	handleDeletion,
	handleUpdate,
}: Props) => {
	const {
		data,
		handleTicketUpdate,
		handleTicketInsert,
		handleTicketDeletion,
		handleTicketDuplication,
	} = useTicket({
		proposalId: params.id,
		versionId: params.version,
		phaseId: phase.id,
		initialData,
	});

	const ticketStub: NestedTicket = {
		id: useId(),
		summary: 'New Ticket',
		phase: phase.id,
		order: data?.length ?? 0,
		budget_hours: 0,
		created_at: new Date().toISOString(),
		visible: true,
		reference_id: null,
	};

	const [open, setOpen] = useState(true);

	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
			className={cn(
				'w-full border-b pr-1.5 -mr-1.5 group/phase border border-transparent rounded-lg border-dashed',
				!phase.visible && 'border-muted-foreground/25 bg-muted/50'
			)}
			data-visible={phase.visible}
		>
			<div className='flex items-center group h-12'>
				<KanbanColumnHandle asChild>
					<Button
						variant='ghost'
						size='smIcon'
						className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground'
					>
						<GripVertical />
					</Button>
				</KanbanColumnHandle>

				<CollapsibleTrigger asChild>
					<Button
						variant='ghost'
						size='smIcon'
						className='text-muted-foreground [&[data-state=open]>svg]:rotate-180 transition-all'
					>
						<ChevronDown />
					</Button>
				</CollapsibleTrigger>

				<Editable
					defaultValue={phase.description}
					placeholder='Enter your text here'
					className='text-base flex flex-row items-center'
					onSubmit={(value) => handleUpdate({ description: value })}
					autosize
				>
					<EditableArea>
						<EditablePreview className='whitespace-pre-wrap font-semibold px-1.5 md:text-lg' />
						<EditableInput className='px-1.5 font-semibold md:text-lg' />
					</EditableArea>

					<Button
						variant='ghost'
						size='smIcon'
						className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground'
						onClick={() =>
							handleTicketInsert({
								ticket: ticketStub,
								tasks: [],
							})
						}
					>
						<Plus />
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='smIcon'
								className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground data-[state=open]:opacity-100'
							>
								<Ellipsis />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent>
							<DropdownMenuGroup>
								<EditableTrigger asChild>
									<DropdownMenuItem>
										<Pencil className='mr-1.5 text-muted-foreground' />
										<span>Rename phase</span>
									</DropdownMenuItem>
								</EditableTrigger>

								<DropdownMenuItem
									onSelect={() =>
										handleUpdate({
											visible: !phase.visible,
										})
									}
								>
									{phase.visible ? (
										<EyeOff className='mr-1.5 text-muted-foreground' />
									) : (
										<Eye className='mr-1.5 text-muted-foreground' />
									)}
									<span>
										{phase.visible
											? 'Hide phase'
											: 'Show phase'}
									</span>
								</DropdownMenuItem>

								<DropdownMenuItem onSelect={handleDeletion}>
									<Trash2 className='mr-1.5 text-red-500' />
									<span>Delete phase</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</Editable>
			</div>

			<CollapsibleContent>
				{initialData?.map((ticket) => (
					<KanbanItem
						key={ticket.id}
						value={ticket.id}
						className='bg-transparent'
						asChild
					>
						<div>
							<TicketListItem
								key={ticket.id}
								ticket={ticket}
								parentVisible={phase.visible ?? true}
								tasks={ticket.tasks ?? []}
								handleDeletion={() =>
									handleTicketDeletion({
										id: ticket.id,
									})
								}
								handleDuplication={() =>
									handleTicketDuplication({
										id: ticket.id,
									})
								}
								handleTicketUpdate={(updatedTicket) =>
									handleTicketUpdate({
										id: ticket.id,
										ticket: updatedTicket,
									})
								}
							/>
						</div>
					</KanbanItem>
				))}

				<Button
					className='text-muted-foreground w-full justify-start'
					size='sm'
					variant='ghost'
					onClick={() =>
						handleTicketInsert({
							ticket: ticketStub,
							tasks: [],
						})
					}
				>
					<span className='px-9'>Add ticket...</span>
				</Button>
			</CollapsibleContent>
		</Collapsible>
	);
};

export default PhaseListItem;
