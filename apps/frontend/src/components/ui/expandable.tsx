'use client';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Input } from '@/components/ui/input';

type Props = {
	placeholder: string;
	onChange?: (value: string) => void;
};

const Expandable = ({ placeholder, onChange }: Props) => {
	const [expanded, setExpanded] = useState(false);
	const [value, setValue] = useState('');

	const ref = useHotkeys<HTMLDivElement>(
		'esc',
		() => {
			setExpanded(false);
			setValue('');
		},
		{ enabled: expanded, enableOnFormTags: true },
		[expanded]
	);

	return (
		<div
			data-expanded={expanded}
			tabIndex={0}
			className='[--default-width:calc(theme(spacing.7))] [--input-width:calc(theme(spacing.36))] flex items-center justify-center w-7 h-7 rounded-md p-2 relative transition-all data-[expanded="true"]:w-[calc(var(--default-width)+6px+var(--input-width))] border data-[expanded="false"]:cursor-pointer'
			onClick={() => {
				if (!expanded) {
					setExpanded(!expanded);
				}
			}}
			ref={ref}
		>
			<div
				data-expanded={expanded}
				className='flex shrink-0 mr-0 transition-all data-[expanded="true"]:mr-1.5'
			>
				<Search />
			</div>

			<Input
				data-expanded={expanded}
				placeholder={placeholder}
				className='h-7 border-0 outline-none p-0 m-0 flex flex-[1_1_auto] tracking-tight font-medium md:text-xs w-0 transition-all data-[expanded="true"]:w-[var(--input-width)] data-[expanded="true"]:opacity-100 dark:bg-transparent'
				value={value}
				autoFocus={expanded}
				onChange={(e) => {
					setValue(e.target.value);
					onChange?.(e.target.value);
				}}
			/>

			{/* <div
				data-expanded={expanded}
				className='absolute opacity-0 scale-[0.1] right-2 transition-all'
			>
				<div
					aria-valuemax='100'
					aria-valuemin='0'
					role='progressbar'
					data-state='indeterminate'
					data-max='100'
					className='sc-dRHutB lkeCGJ'
				>
					<svg
						height='12'
						width='12'
						data-state='indeterminate'
						data-max='100'
						className='sc-eRJQtA ktTjeH'
					>
						<circle
							stroke='#F8F9FA'
							stroke-width='1.2'
							stroke-dasharray='30.159289474462014 30.159289474462014'
							fill='transparent'
							r='4.8'
							cx='6'
							cy='6'
						></circle>
						<circle
							stroke-width='1.2'
							stroke-dasharray='30.159289474462014 30.159289474462014'
							stroke-linecap='round'
							stroke-dashoffset='13.571680263507904'
							fill='transparent'
							r='4.8'
							cx='6'
							cy='6'
							data-variant='primary'
							className='sc-bFwXsg fUptrq'
						></circle>
					</svg>
				</div>
			</div> */}
		</div>
	);
};

export default Expandable;
