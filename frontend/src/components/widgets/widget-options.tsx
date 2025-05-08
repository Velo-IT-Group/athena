import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ellipsis, Trash2 } from 'lucide-react';

type Props = {
	halfSize: boolean;
	toggleHalfSize: () => void;
	children?: React.ReactNode;
};

const WidgetOptions = ({ children, halfSize, toggleHalfSize }: Props) => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button
				variant='ghost'
				size='smIcon'
				className='ml-auto'
			>
				<Ellipsis />
			</Button>
		</DropdownMenuTrigger>

		<DropdownMenuContent
			align='end'
			side='bottom'
		>
			{children}

			<DropdownMenuCheckboxItem
				checked={halfSize}
				onCheckedChange={toggleHalfSize}
			>
				Half size
			</DropdownMenuCheckboxItem>

			<DropdownMenuCheckboxItem
				checked={!!!halfSize}
				onCheckedChange={toggleHalfSize}
			>
				Full size
			</DropdownMenuCheckboxItem>

			<DropdownMenuSeparator />

			<DropdownMenuItem className='text-destructive'>
				<Trash2 className='text-destructive' />
				<span>Remove widget</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

export default WidgetOptions;
