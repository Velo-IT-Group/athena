import { Button } from '@/components/ui/button';
import { GripVertical, ChevronDown, Plus, Ellipsis, EyeOff, Pencil, Trash2, Eye } from 'lucide-react';
import { EditableArea, EditableInput, EditablePreview, Editable, EditableTrigger } from '@/components/ui/editable';
import { Sortable, SortableContent, SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTicket } from '@/hooks/use-ticket';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TicketListItem from './ticket-list-item';
import { cn } from '@/lib/utils';

type Props = {
	phase: Phase;
	tickets: NestedTicket[];
	params: { id: string; version: string };
	handleDeletion: () => void;
	handleDuplication: () => void;
	handleUpdate: (phase: PhaseUpdate) => void;
};

const PhaseListItem = ({ phase, tickets, params, handleDeletion, handleUpdate }: Props) => {
	const { data, handleTicketUpdate, handleTicketInsert, handleTicketDeletion, handleTicketDuplication } = useTicket({
		proposalId: params.id,
		versionId: params.version,
		phaseId: phase.id,
		initialData: tickets,
	});

	const ticketStub: NestedTicket = {
		id: crypto.randomUUID(),
		summary: 'New Ticket',
		phase: phase.id,
		order: data?.length ?? 0,
		budget_hours: 0,
		created_at: new Date().toISOString(),
		visible: true,
		reference_id: null,
	};

	const sortedTickets =
		data?.sort((a, b) => {
			// First, compare by score in descending order
			if (Number(a.order) > Number(b.order)) return 1;
			if (Number(a.order) < Number(b.order)) return -1;

			// If scores are equal, then sort by created_at in ascending order
			// return Number(a.created_at) - Number(b.id);
			return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
		}) ?? [];

	return (
		<SortableItem
			value={phase.id}
			className='-ml-5'
			asChild
		>
			<Collapsible
				className={cn(
					'w-full border-b last:border-b-0 pr-1.5 -mr-1.5 group/phase border border-transparent',
					!phase.visible && 'border-muted-foreground/25 bg-muted/50 border-dashed rounded-lg'
				)}
				data-visible={phase.visible}
				defaultOpen
			>
				<div className='flex items-center group h-12'>
					<SortableItemHandle asChild>
						<Button
							variant='ghost'
							size='smIcon'
							className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground'
						>
							<GripVertical />
						</Button>
					</SortableItemHandle>

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

									<DropdownMenuItem onSelect={() => handleUpdate({ visible: !phase.visible })}>
										{!!phase.visible ? (
											<EyeOff className='mr-1.5 text-muted-foreground' />
										) : (
											<Eye className='mr-1.5 text-muted-foreground' />
										)}
										<span>{!!phase.visible ? 'Hide phase' : 'Show phase'}</span>
									</DropdownMenuItem>
									{/* <DropdownMenuItem
                                        onSelect={handleDuplication}
                                    >
                                        <CopyPlus className="mr-1.5 text-muted-foreground" />
                                        <span>Duplicate phase</span>
                                    </DropdownMenuItem> */}

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
					<Sortable
						value={sortedTickets}
						onValueChange={(newTickets) =>
							newTickets.map((ticket, index) =>
								handleTicketUpdate({
									id: ticket.id,
									ticket: {
										order: index,
										phase: ticket.phase,
										summary: ticket.summary,
									},
								})
							)
						}
						getItemValue={(item) => item.id}
					>
						<SortableContent
							className='-ml-5'
							asChild
						>
							<>
								{sortedTickets.map((ticket) => (
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
								))}
							</>
						</SortableContent>
					</Sortable>

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
		</SortableItem>
	);
};

export default PhaseListItem;
