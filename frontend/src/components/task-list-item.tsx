import { Ellipsis, GripVertical, CopyPlus, Trash2 } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EditableArea, EditableInput, EditablePreview, Editable } from '@/components/ui/editable';
import { SortableItem, SortableItemHandle } from '@/components/ui/sortable';

type Props = {
	task: Task;
	handleDeletion: () => void;
	handleDuplication: () => void;
	handleUpdate: (task: TaskUpdate) => void;
};

const TaskListItem = ({ task, handleUpdate, handleDeletion, handleDuplication }: Props) => (
	<SortableItem
		key={task.id}
		value={task.id}
		asChild
	>
		<div className='flex items-center flex-1 gap-2 flex-shrink-0 flex-grow space-y-0 hover:bg-muted/50 border-b last:border-b-0 group'>
			<SortableItemHandle asChild>
				<Button
					variant='ghost'
					size='icon'
					className='-ml-1.5'
				>
					<GripVertical />
				</Button>
			</SortableItemHandle>

			<Editable
				defaultValue={task.notes}
				defaultEditing={true}
				placeholder='Enter your text here'
				className='text-base flex flex-row items-center ml-12'
				onSubmit={(value) =>
					handleUpdate({
						notes: value,
					})
				}
				autosize
			>
				<EditableArea>
					<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm' />
					<EditableInput
						className='px-1.5 text-sm whitespace-pre-wrap'
						asChild
					>
						<textarea
							className='w-full grow'
							cols={200}
						/>
					</EditableInput>
				</EditableArea>
			</Editable>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						size='smIcon'
						className='opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100'
					>
						<Ellipsis />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align='end'>
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={handleDeletion}>
							<Trash2 className='text-red-600 mr-1.5' />
							<span>Delete task</span>
						</DropdownMenuItem>

						<DropdownMenuItem onClick={handleDuplication}>
							<CopyPlus className='text-muted-foreground mr-1.5' />
							<span>Duplicate task</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	</SortableItem>
);

export default TaskListItem;
