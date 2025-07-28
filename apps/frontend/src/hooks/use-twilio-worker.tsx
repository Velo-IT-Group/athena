import { useEffect, useState } from 'react';
import { Supervisor } from 'twilio-taskrouter';

interface UseTaskRouterWorkerProps {
	workerToken?: string;
	enabled?: boolean;
}

export const useTaskRouterWorker = ({
	workerToken,
	enabled = true,
}: UseTaskRouterWorkerProps) => {
	const [worker, setWorker] = useState<Supervisor | undefined>(undefined);
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!workerToken || !enabled) {
			setIsLoading(false);
			return;
		}

		let workerInstance: Supervisor | undefined = undefined;

		const initializeWorker = async () => {
			try {
				setIsLoading(true);
				workerInstance = new Supervisor(workerToken);

				workerInstance.on('ready', () => {
					console.log('TaskRouter Worker ready');
					setIsConnected(true);
					setWorker(workerInstance);
					setError(null);
					setIsLoading(false);
				});

				workerInstance.on('tokenExpired', () => {
					console.log('TaskRouter Worker token expired');
					setIsConnected(false);
				});

				workerInstance.on('error', (error) => {
					console.error('TaskRouter Worker error:', error);
					setError(error);
					setIsConnected(false);
					setIsLoading(false);
				});

				workerInstance.on('disconnected', () => {
					console.log('TaskRouter Worker disconnected');
					setIsConnected(false);
				});
			} catch (err) {
				console.error('Failed to initialize TaskRouter Worker:', err);
				setError(
					err instanceof Error
						? err
						: new Error('Failed to initialize worker')
				);
				setIsLoading(false);
			}
		};

		initializeWorker();

		return () => {
			if (workerInstance) {
				workerInstance.disconnect();
			}
		};
	}, [workerToken, enabled]);

	return {
		worker,
		isConnected,
		isLoading,
		error,
	};
};
