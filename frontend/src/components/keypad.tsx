import { Button } from '@/components/ui/button';

type DialpadItem = {
	name: string;
	value: string;
};

const digitButtons: DialpadItem[] = [
	{ name: '1', value: '1' },
	{ name: '2', value: '2' },
	{ name: '3', value: '3' },
	{ name: '4', value: '4' },
	{ name: '5', value: '5' },
	{ name: '6', value: '6' },
	{ name: '7', value: '7' },
	{ name: '8', value: '8' },
	{ name: '9', value: '9' },
	{ name: '*', value: '*' },
	{ name: '0', value: '0' },
	{ name: '#', value: '#' },
];

type Props = {
	onValueChange: (value: string) => void;
};

export function Keypad({ onValueChange }: Props) {
	return (
		<div className='w-full grid grid-cols-3 gap-9'>
			{digitButtons.map((d) => (
				<Button
					type='button'
					key={`${d.name}-${d.value}`}
					onClick={() => onValueChange(d.value)}
					className='text-2xl rounded-full size-12'
					variant='secondary'
					size='icon'
				>
					{d.name}
				</Button>
			))}
		</div>
	);
}
