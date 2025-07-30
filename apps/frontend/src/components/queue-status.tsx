import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { ConnectionState } from 'twilio-sync';
import { buttonVariants } from '@/components/ui/button';
import useSyncClient from '@/hooks/use-sync-client';
import { cn } from '@/lib/utils';

type Props = {
	token: string;
};

type QueueStatus = {
	calls_in_queue: number;
	status: 'red' | 'yellow' | 'green';
	voicemails_in_queue: number;
	workers_available: number;
};

const QueueStatus = ({ token }: Props) => {
	const { client } = useSyncClient(token);
	const [queueStatus, setQueueStatus] = useState<QueueStatus | undefined>(
		undefined
	);

	const { data: document } = useQuery({
		queryKey: ['queueStatus', client?.connectionState ?? 'unknown'],
		queryFn: async () => client?.document('Queue Status'),
		enabled: client?.connectionState === 'connected',
	});

	const handleQueueStatusUpdate = useCallback(
		(event: { data: any; previousData: any; isLocal: boolean }) => {
			console.log(event.data);
			setQueueStatus(event.data as QueueStatus);
		},
		[queueStatus, document]
	);

	useEffect(() => {
		if (!document) return;

		setQueueStatus(document.data as QueueStatus);

		document.on('updated', handleQueueStatusUpdate);

		return () => {
			document.off('updated', handleQueueStatusUpdate);
		};
	}, [document, client]);

	return (
		<Link
			to='/teams'
			className={cn(
				'rounded-md border border-transparent animate-border overflow-hidden',
				queueStatus &&
					queueStatus?.calls_in_queue > 0 &&
					'[background:linear-gradient(45deg,var(--primary),var(--primary)_50%,var(--primary))_padding-box,conic-gradient(from_var(--border-angle),var(--background)_20%,_var(--primary)_86%,_var(--primary)_90%,_var(--primary)_94%,_var(--primary))_border-box]',
				queueStatus &&
					queueStatus?.voicemails_in_queue > 0 &&
					'[background:linear-gradient(45deg,var(--primary),var(--primary)_50%,var(--primary))_padding-box,conic-gradient(from_var(--border-angle),var(--background)_20%,_theme(colors.yellow.400)_86%,_theme(colors.yellow.400)_90%,_theme(colors.yellow.400)_94%,_theme(colors.yellow.400))_border-box]'
			)}
		>
			<div className='grid grid-cols-3 gap-3 font-semibold text-sm rounded-sm bg-background hover:bg-secondary h-7 px-2 items-center'>
				<div
					className={cn(
						'bg-destructive w-full min-h-3 opacity-10 dark:opacity-15 rounded-full size-5 grid place-items-center transition-all',
						queueStatus?.status === 'red' &&
							'opacity-100 dark:opacity-100'
					)}
				>
					<p
						className={cn(
							'opacity-0 transition-opacity leading-none text-primary-foreground',
							queueStatus?.status === 'red' && 'opacity-100'
						)}
					>
						{(queueStatus?.calls_in_queue ?? 0) +
							(queueStatus?.voicemails_in_queue ?? 0)}
					</p>
				</div>
				<div
					className={cn(
						'bg-yellow-300 w-full min-h-3 opacity-20 dark:opacity-15 rounded-full size-5 grid place-items-center transition-all',
						queueStatus?.status === 'yellow' &&
							'opacity-100 dark:opacity-100'
					)}
				>
					<p
						className={cn(
							'opacity-0 transition-opacity leading-none text-primary-foreground',
							queueStatus?.status === 'yellow' && 'opacity-100'
						)}
					>
						{(queueStatus?.calls_in_queue ?? 0) +
							(queueStatus?.voicemails_in_queue ?? 0)}
					</p>
				</div>
				<div
					className={cn(
						'bg-green-600 w-full min-h-3 opacity-10 dark:opacity-15 rounded-full size-5 grid place-items-center transition-all',
						queueStatus?.status === 'green' &&
							'opacity-100 dark:opacity-100'
					)}
				>
					<p
						className={cn(
							'opacity-0 transition-opacity leading-none text-primary-foreground',
							queueStatus?.status === 'green' && 'opacity-100'
						)}
					>
						{(queueStatus?.calls_in_queue ?? 0) +
							(queueStatus?.voicemails_in_queue ?? 0)}
					</p>
				</div>
			</div>
		</Link>
	);
};

export default QueueStatus;
