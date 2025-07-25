import NumberFlow, { NumberFlowGroup } from '@number-flow/react';
import { cn } from '@/lib/utils';
import React from 'react';
// import { useStopwatch, useTimer } from 'react-timer-hook';
import pkg from 'react-timer-hook';
const { useStopwatch, useTimer } = pkg;
import type { useStopwatchSettingsType } from 'react-timer-hook/dist/types/src/useStopwatch';
import type { useTimerSettingsType } from 'react-timer-hook/dist/types/src/useTimer';

interface Props {
	stopwatchSettings?: useStopwatchSettingsType;
	timerSettings?: useTimerSettingsType;
	className?: string;
	isStopWatch?: boolean;
	hideSeconds?: boolean;
	hideMinutes?: boolean;
	hideHours?: boolean;
	hideDays?: boolean;
}

const Timer = ({
	stopwatchSettings,
	timerSettings,
	className,
	isStopWatch = true,
	hideDays = true,
	hideHours = false,
	hideMinutes = false,
	hideSeconds = false,
}: Props) => {
	const timer = stopwatchSettings
		? useStopwatch(stopwatchSettings)
		: timerSettings
			? useTimer(timerSettings)
			: useStopwatch();
	const { seconds, minutes, hours, days } = timer;

	return (
		<NumberFlowGroup>
			<div
				className={cn(
					'~text-3xl/4xl tabular-nums flex items-baseline font-semibold text-[var(--number-flow-char-height)] select-none',
					className
				)}
			>
				{!hideDays && (
					<NumberFlow
						trend={isStopWatch ? 1 : -1}
						value={days}
						format={{ minimumIntegerDigits: 2 }}
					/>
				)}

				{!hideHours && (
					<NumberFlow
						prefix={hideDays ? undefined : ':'}
						trend={isStopWatch ? 1 : -1}
						value={hours}
						format={{ minimumIntegerDigits: 2 }}
					/>
				)}

				{!hideMinutes && (
					<NumberFlow
						prefix={hideHours ? undefined : ':'}
						trend={isStopWatch ? 1 : -1}
						value={minutes}
						digits={{ 1: { max: 5 } }}
						format={{ minimumIntegerDigits: 2 }}
					/>
				)}

				{!hideSeconds && (
					<NumberFlow
						prefix=':'
						trend={isStopWatch ? 1 : -1}
						value={seconds}
						digits={{ 1: { max: 5 } }}
						format={{ minimumIntegerDigits: 2 }}
					/>
				)}
			</div>
		</NumberFlowGroup>
	);
};

export default React.memo(Timer);
