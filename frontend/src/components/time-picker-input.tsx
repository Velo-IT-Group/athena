import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';
import React from 'react';
import { Period, TimePickerType, display12HourValue, getArrowByType, getDateByType, setDateByType } from '@/utils/time';

export interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	picker: TimePickerType;
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
	period?: Period;
	onRightFocus?: () => void;
	onLeftFocus?: () => void;
}

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
	(
		{
			className,
			type = 'tel',
			value,
			id,
			name,
			date = new Date(new Date().setHours(0, 0, 0, 0)),
			setDate,
			onChange,
			onKeyDown,
			picker,
			period,
			onLeftFocus,
			onRightFocus,
			...props
		},
		ref
	) => {
		const [flag, setFlag] = React.useState<boolean>(false);
		const [prevIntKey, setPrevIntKey] = React.useState<string>('0');

		/**
		 * allow the user to enter the second digit within 2 seconds
		 * otherwise start again with entering first digit
		 */
		React.useEffect(() => {
			if (flag) {
				const timer = setTimeout(() => {
					setFlag(false);
				}, 2000);

				return () => clearTimeout(timer);
			}
		}, [flag]);

		const calculatedValue = React.useMemo(() => {
			return getDateByType(date, picker);
		}, [date, picker]);

		const calculateNewValue = (key: string) => {
			/*
			 * If picker is '12hours' and the first digit is 0, then the second digit is automatically set to 1.
			 * The second entered digit will break the condition and the value will be set to 10-12.
			 */
			if (picker === '12hours') {
				if (flag && calculatedValue.slice(1, 2) === '1' && prevIntKey === '0') return '0' + key;
			}

			return !flag ? '0' + key : calculatedValue.slice(1, 2) + key;
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Tab') return;
			e.preventDefault();
			if (e.key === 'ArrowRight') onRightFocus?.();
			if (e.key === 'ArrowLeft') onLeftFocus?.();
			if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
				const step = e.key === 'ArrowUp' ? 1 : -1;
				const newValue = getArrowByType(calculatedValue, step, picker);
				if (flag) setFlag(false);
				const tempDate = new Date(date);
				setDate(setDateByType(tempDate, newValue, picker, period));
			}
			if (e.key >= '0' && e.key <= '9') {
				if (picker === '12hours') setPrevIntKey(e.key);

				const newValue = calculateNewValue(e.key);
				if (flag) onRightFocus?.();
				setFlag((prev) => !prev);
				const tempDate = new Date(date);
				setDate(setDateByType(tempDate, newValue, picker, period));
			}
		};

		return (
			<Input
				ref={ref}
				id={id || picker}
				name={name || picker}
				className={cn(
					'w-[48px] text-center font-mono text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none',
					className
				)}
				value={value || calculatedValue}
				onChange={(e) => {
					e.preventDefault();
					onChange?.(e);
				}}
				type={type}
				inputMode='decimal'
				onKeyDown={(e) => {
					onKeyDown?.(e);
					handleKeyDown(e);
				}}
				{...props}
			/>
		);
	}
);

TimePickerInput.displayName = 'TimePickerInput';

import { Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimePickerDemoProps {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
}

export function TimePicker({ date, setDate }: TimePickerDemoProps) {
	const [period, setPeriod] = React.useState<Period>('PM');

	const minuteRef = React.useRef<HTMLInputElement>(null);
	const hourRef = React.useRef<HTMLInputElement>(null);
	const secondRef = React.useRef<HTMLInputElement>(null);
	const periodRef = React.useRef<HTMLButtonElement>(null);

	return (
		<div className='flex items-end gap-1.5'>
			<div className='grid gap-1 text-center'>
				<Label
					htmlFor='hours'
					className='text-xs'
				>
					Hours
				</Label>
				<TimePickerInput
					picker='12hours'
					period={period}
					date={date}
					setDate={setDate}
					ref={hourRef}
					onRightFocus={() => minuteRef.current?.focus()}
				/>
			</div>
			<div className='grid gap-1 text-center'>
				<Label
					htmlFor='minutes'
					className='text-xs'
				>
					Minutes
				</Label>
				<TimePickerInput
					picker='minutes'
					id='minutes12'
					date={date}
					setDate={setDate}
					ref={minuteRef}
					onLeftFocus={() => hourRef.current?.focus()}
					onRightFocus={() => secondRef.current?.focus()}
				/>
			</div>
			<div className='grid gap-1 text-center'>
				<Label
					htmlFor='seconds'
					className='text-xs'
				>
					Seconds
				</Label>
				<TimePickerInput
					picker='seconds'
					id='seconds12'
					date={date}
					setDate={setDate}
					ref={secondRef}
					onLeftFocus={() => minuteRef.current?.focus()}
					onRightFocus={() => periodRef.current?.focus()}
				/>
			</div>
			<div className='grid gap-1 text-center'>
				<Label
					htmlFor='period'
					className='text-xs'
				>
					Period
				</Label>
				<TimePeriodSelect
					period={period}
					setPeriod={setPeriod}
					date={date}
					setDate={setDate}
					ref={periodRef}
					onLeftFocus={() => secondRef.current?.focus()}
				/>
			</div>

			<Button
				size='icon'
				variant='ghost'
				type='button'
				onClick={() => {
					setDate(new Date());
				}}
			>
				<Clock />
			</Button>
		</div>
	);
}
export interface PeriodSelectorProps {
	period: Period;
	setPeriod: (m: Period) => void;
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
	onRightFocus?: () => void;
	onLeftFocus?: () => void;
}

export const TimePeriodSelect = React.forwardRef<HTMLButtonElement, PeriodSelectorProps>(
	({ period, setPeriod, date, setDate, onLeftFocus, onRightFocus }, ref) => {
		const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
			if (e.key === 'ArrowRight') onRightFocus?.();
			if (e.key === 'ArrowLeft') onLeftFocus?.();
		};

		const handleValueChange = (value: Period) => {
			setPeriod(value);

			/**
			 * trigger an update whenever the user switches between AM and PM;
			 * otherwise user must manually change the hour each time
			 */
			if (date) {
				const tempDate = new Date(date);
				const hours = display12HourValue(date.getHours());
				setDate(setDateByType(tempDate, hours.toString(), '12hours', period === 'AM' ? 'PM' : 'AM'));
			}
		};

		return (
			<div className='flex h-9 items-center'>
				<Select
					value={period}
					onValueChange={(value: Period) => handleValueChange(value)}
				>
					<SelectTrigger
						ref={ref}
						className='w-[65px] focus:bg-accent focus:text-accent-foreground'
						onKeyDown={handleKeyDown}
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='AM'>AM</SelectItem>
						<SelectItem value='PM'>PM</SelectItem>
					</SelectContent>
				</Select>
			</div>
		);
	}
);

TimePeriodSelect.displayName = 'TimePeriodSelect';
