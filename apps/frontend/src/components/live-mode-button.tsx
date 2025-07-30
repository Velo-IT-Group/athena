'use client';

import type { FetchPreviousPageOptions } from '@tanstack/react-query';
import { PauseCircle, PlayCircle } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const REFRESH_INTERVAL = 5_000; // 5 seconds

interface LiveModeButtonProps {
	fetchPreviousPage?: (
		options?: FetchPreviousPageOptions | undefined
	) => Promise<unknown>;
}

export function LiveModeButton({ fetchPreviousPage }: LiveModeButtonProps) {
	// or nuqs [isLive, setIsLive] = useQueryState("live", parseAsBoolean)
	const [isLive, setIsLive] = React.useState(false);

	React.useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		async function fetchData() {
			if (isLive) {
				await fetchPreviousPage?.();
				// schedule the next fetch after REFRESH_INTERVAL
				// once the current fetch completes
				timeoutId = setTimeout(fetchData, REFRESH_INTERVAL);
			} else {
				clearTimeout(timeoutId);
			}
		}
		fetchData();

		return () => clearTimeout(timeoutId);
	}, [isLive, fetchPreviousPage]);

	return (
		<Button
			variant='outline'
			className={cn(
				// 'ml-auto',
				isLive && 'border-primary text-primary'
			)}
			onClick={() => {
				setIsLive(!isLive);
			}}
		>
			{isLive ? (
				<PauseCircle className='stroke-current' />
			) : (
				<PlayCircle className='stroke-current' />
			)}
			<span>{isLive ? 'Pause' : 'Live'}</span>
		</Button>
		// <button onClick={() => setIsLive(!isLive)}>
		// 	{isLive ? 'Stop live mode' : 'Start live mode'}
		// </button>
	);
}
