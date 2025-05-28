import React, { useState } from 'react';
import {
	ChevronDown,
	CopyPlus,
	Ellipsis,
	Eye,
	EyeOff,
	GripVertical,
	ListTodo,
	Pencil,
	Plus,
	Trash2,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TaskListItem from './task-list-item';
import { EditableArea, EditableInput, EditablePreview, Editable, EditableTrigger } from '@/components/ui/editable';
import { Sortable, SortableContent } from '@/components/ui/sortable';
import useTask from '@/hooks/use-task';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { KanbanItemHandle } from '@/components/ui/kanban';

type Props = {
	ticket: NestedTicket;
	tasks: Task[];
	parentVisible: boolean;
	handleDeletion: () => void;
	handleDuplication: () => void;
	handleTicketUpdate: (ticket: TicketUpdate) => void;
};

const TicketListItem = ({
	ticket,
	tasks,
	parentVisible,
	handleDeletion,
	handleDuplication,
	handleTicketUpdate,
}: Props) => {
	const [isVisible, setIsVisible] = useState(ticket.visible);
	const [collapsibleOpen, setCollapsibleOpen] = React.useState(false);
	const { data, handleTaskUpdate, handleTaskDeletion, handleTaskDuplication, handleTaskInsert } = useTask({
		initialData: tasks,
		ticketId: ticket.id,
	});

	const taskStub: TaskInsert = {
		id: crypto.randomUUID(),
		summary: '',
		notes: 'New Task',
		priority: 1,
		ticket: ticket.id,
		created_at: new Date().toISOString(),
		order: data.length,
	};

	const [sortedTasks, setSortedTasks] = useState(
		data.sort((a, b) => {
			// First, compare by score in descending order
			if (Number(a.order) > Number(b.order)) return 1;
			if (Number(a.order) < Number(b.order)) return -1;

			// Then, compare by created_at in ascending order
			return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
		})
	);

	return (
		<Collapsible
			open={collapsibleOpen}
			onOpenChange={setCollapsibleOpen}
			className={cn(
				'last:border-b-0 pr-1.5 -mr-1.5 group/ticket border border-transparent border-b-border',
				!isVisible &&
					'group-data-[visible=true]/phase:border group-data-[visible=true]/phase:border-muted-foreground/25 group-data-[visible=true]/phase:bg-muted/50 group-data-[visible=true]/phase:border-dashed group-data-[visible=true]/phase:rounded-lg'
			)}
			data-visible={parentVisible ? isVisible : false}
			defaultOpen
		>
			<div className='flex items-center group hover:bg-muted/50 py-0.5\ [&[data-active=open]]:bg-blue-500'>
				<KanbanItemHandle asChild>
					<Button
						variant='ghost'
						size='smIcon'
						className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground'
					>
						<GripVertical />
					</Button>
				</KanbanItemHandle>

				<CollapsibleTrigger asChild>
					<Button
						variant='ghost'
						size='smIcon'
						className='text-muted-foreground [&[data-state=open]>svg]:rotate-180 transition-all ml-6'
					>
						<ChevronDown />
					</Button>
				</CollapsibleTrigger>

				<Editable
					defaultValue={ticket.summary}
					placeholder='Enter your text here'
					className='text-base flex flex-row items-center'
					onSubmit={(value) =>
						handleTicketUpdate({
							summary: value,
							phase: ticket.phase,
						})
					}
					autosize
				>
					<EditableArea>
						<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm border border-transparent hover:border-border hover:cursor-pointer' />
						<EditableInput className='px-1.5 text-sm' />
					</EditableArea>

					{sortedTasks.length > 0 && (
						<Tooltip>
							<TooltipTrigger asChild>
								<CollapsibleTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='text-muted-foreground [&[data-state=open]>svg]:rotate-180 transition-all h-6 px-1.5'
									>
										<span className='mr-1.5 text-xs'>{sortedTasks.length}</span>
										<ListTodo />
									</Button>
								</CollapsibleTrigger>
							</TooltipTrigger>

							<TooltipContent side='top'>View tasks</TooltipContent>
						</Tooltip>
					)}

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='ghost'
								size='smIcon'
								className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground'
								onClick={() => {
									handleTaskInsert({ task: taskStub });
									setCollapsibleOpen(true);
								}}
							>
								<Plus />
							</Button>
						</TooltipTrigger>

						<TooltipContent side='top'>Create task</TooltipContent>
					</Tooltip>

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
										<span>Rename section</span>
									</DropdownMenuItem>
								</EditableTrigger>

								{/* <DropdownMenuSub>
										<DropdownMenuSubTrigger>
											<AlignCenter className='mr-1.5 text-muted-foreground' />
											<span>Add section</span>
										</DropdownMenuSubTrigger>

										<DropdownMenuSubContent>
											<DropdownMenuGroup>
												<DropdownMenuItem>
													<ArrowUp className='mr-1.5 text-muted-foreground' />
													<span>Add section above</span>
												</DropdownMenuItem>

												<DropdownMenuItem>
													<ArrowDown className='mr-1.5 text-muted-foreground' />
													<span>Add section below</span>
												</DropdownMenuItem>
											</DropdownMenuGroup>
										</DropdownMenuSubContent>
									</DropdownMenuSub> */}

								<DropdownMenuItem
									disabled={!parentVisible}
									onSelect={() => {
										const visible = !isVisible;
										handleTicketUpdate({
											visible,
											summary: ticket.summary,
											phase: ticket.phase,
										});
										setIsVisible(visible);
									}}
								>
									{isVisible ? (
										<EyeOff className='mr-1.5 text-muted-foreground' />
									) : (
										<Eye className='mr-1.5 text-muted-foreground' />
									)}
									<span>
										{!parentVisible ? 'Hide ticket' : isVisible ? 'Hide ticket' : 'Show ticket'}
									</span>
								</DropdownMenuItem>

								<DropdownMenuItem onSelect={handleDuplication}>
									<CopyPlus className='mr-1.5 text-muted-foreground' />
									<span>Duplicate ticket</span>
								</DropdownMenuItem>

								<DropdownMenuItem onSelect={handleDeletion}>
									<Trash2 className='mr-1.5 text-red-500' />
									<span>Delete ticket</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</Editable>

				<Editable
					defaultValue={String(ticket.budget_hours)}
					placeholder='0'
					className='text-base flex flex-row items-center ml-auto text-muted-foreground'
					onSubmit={(value) =>
						handleTicketUpdate({
							summary: ticket.summary,
							phase: ticket.phase,
							budget_hours: Number(value),
						})
					}
					autosize
				>
					<EditableArea>
						<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm border border-transparent hover:border-border hover:cursor-pointer' />
						<EditableInput
							className='px-1.5 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
							type='number'
							step={0.25}
							min={0}
						/>
					</EditableArea>
				</Editable>

				<p className='ml-[0.125ch]'>hrs</p>
			</div>

			<CollapsibleContent>
				<Sortable
					value={sortedTasks}
					onValueChange={(value) => {
						const currentTasks = sortedTasks;
						const tasksToUpdate: Map<string, TaskUpdate> = new Map();
						value.forEach((task, order) => {
							const currentTask = currentTasks.find((t) => t.id === task.id);
							if (currentTask) {
								tasksToUpdate.set(currentTask.id, { order });
							}
						});
						setSortedTasks(value);
						Array.from(tasksToUpdate.entries()).forEach(([id, task]) => {
							handleTaskUpdate({
								id,
								task,
							});
						});
					}}
					getItemValue={(item) => item.id}
				>
					<SortableContent>
						{sortedTasks.map((task) => (
							<TaskListItem
								key={task.id}
								task={task}
								handleUpdate={(updatedTask) =>
									handleTaskUpdate({
										id: task.id,
										task: updatedTask,
									})
								}
								handleDeletion={() =>
									handleTaskDeletion({
										id: task.id,
									})
								}
								handleDuplication={() =>
									handleTaskDuplication({
										id: task.id,
									})
								}
							/>
						))}
					</SortableContent>
				</Sortable>
			</CollapsibleContent>
		</Collapsible>
	);
};

export default TicketListItem;
