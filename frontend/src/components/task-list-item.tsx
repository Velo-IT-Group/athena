import { Ellipsis, GripVertical, CopyPlus, Trash2, EyeOff, Eye } from 'lucide-react';
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
import { cn } from '@/lib/utils';

type Props = {
	task: Task;
	parentVisible?: boolean;
	handleDeletion: () => void;
	handleDuplication: () => void;
	handleUpdate: (task: TaskUpdate) => void;
};

const TaskListItem = ({ task, parentVisible, handleUpdate, handleDeletion, handleDuplication }: Props) => (
	<SortableItem
		key={task.id}
		value={task.id}
		asChild
	>
		<div
			className={cn(
				'flex items-center flex-1 gap-2 flex-shrink-0 flex-grow space-y-0 hover:bg-muted/50 group border border-transparent border-b-border last:border-b-transparent',
				!task.visible &&
					'group-data-[visible=true]/ticket:border group-data-[visible=true]/ticket:border-muted-foreground/25 group-data-[visible=true]/ticket:bg-muted/50 group-data-[visible=true]/ticket:border-dashed group-data-[visible=true]/ticket:rounded-lg '
			)}
			data-visible={parentVisible ? task.visible : false}
		>
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

						<DropdownMenuItem
							onClick={() => handleUpdate({ visible: !task.visible })}
							disabled={!parentVisible}
						>
							{!!task.visible ? (
								<EyeOff className='text-muted-foreground mr-1.5' />
							) : (
								<Eye className='text-muted-foreground mr-1.5' />
							)}
							<span>{!!task.visible ? 'Hide task' : 'Show task'}</span>
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
