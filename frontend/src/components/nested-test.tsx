import PhaseListItem from '@/components/phase-list-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Kanban,
	KanbanBoard,
	KanbanColumn,
	KanbanColumnHandle,
	KanbanItem,
	KanbanOverlay,
} from '@/components/ui/kanban';
import { type UniqueIdentifier } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface Props {
	phases: NestedPhase[];
}

const NestedTest = ({ phases }: Props) => {
	const tickets = useMemo(() => phases.sort((a, b) => a.order - b.order).flatMap((p) => p.tickets ?? []), [phases]);
	console.log(tickets.map((t) => t.phase));

	const groupedTickets = useMemo(
		() =>
			Object.groupBy(
				tickets.sort((a, b) => a.order - b.order),
				(ticket) => (phases.find((p) => p.id === ticket?.phase)?.description ?? 'no-phase') as UniqueIdentifier
			) as Record<UniqueIdentifier, NestedTicket[]>,
		[tickets, phases]
	);

	const [columns, setColumns] = useState<Record<UniqueIdentifier, NestedTicket[]>>(groupedTickets);

	return (
		<Kanban
			value={columns}
			onValueChange={(value) => {
				console.log(value);
				setColumns(value);
			}}
			getItemValue={(item) => item.id}
			autoScroll
			orientation='vertical'
		>
			<KanbanBoard className='flex gap-3 overflow-x-auto'>
				{Object.entries(columns).map(([columnValue, tasks]) => {
					const phase = phases.find((p) => p.description === columnValue);

					if (!phase) return null;

					return (
						<KanbanColumn
							key={columnValue}
							value={columnValue}
							className='bg-background border-none p-0'
							asChild
						>
							<div>
								<PhaseListItem
									phase={phase}
									tickets={tasks}
									handleDeletion={() => {}}
									handleDuplication={() => {}}
									handleUpdate={() => {}}
									params={{ id: phase.id, version: phase.version }}
								/>
							</div>
						</KanbanColumn>
					);
				})}
			</KanbanBoard>
			<KanbanOverlay>
				<div className='size-full rounded-md bg-primary/10' />
			</KanbanOverlay>
		</Kanban>
	);
};

interface TaskCardProps extends Omit<React.ComponentProps<typeof KanbanItem>, 'value'> {
	task: NestedTicket;
}

function TaskCard({ task, ...props }: TaskCardProps) {
	return (
		<KanbanItem
			key={task.id}
			value={task.id}
			asChild
			{...props}
		>
			<div className='rounded-md border bg-card p-3 shadow-xs'>
				<div className='flex flex-col gap-2'>
					<div className='flex items-center justify-between gap-2'>
						<span className='line-clamp-1 font-medium text-sm'>{task.summary}</span>
						{/* <Badge
							variant={
								task.priority === 'high'
									? 'destructive'
									: task.priority === 'medium'
									? 'default'
									: 'secondary'
							}
							className='pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize'
						>
							{task.priority}
						</Badge> */}
					</div>
					<div className='flex items-center justify-between text-muted-foreground text-xs'>
						{/* {task.assignee && (
							<div className='flex items-center gap-1'>
								<div className='size-2 rounded-full bg-primary/20' />
								<span className='line-clamp-1'>{task.assignee}</span>
							</div>
						)}
						{task.dueDate && <time className='text-[10px] tabular-nums'>{task.dueDate}</time>} */}
					</div>
				</div>
			</div>
		</KanbanItem>
	);
}

export default NestedTest;
