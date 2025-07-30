'use client';
import { useEffect, useRef, useState } from 'react';
import { SyncClient } from 'twilio-sync';

export default function useSyncClient(token: string) {
	const [status, setStatus] = useState('Connecting...');
	const [errorMessage, setErrorMessage] = useState('');

	const clientRef = useRef<SyncClient | null>(null);

	useEffect(() => {
		if (!token) return;
		// let client = clientRef.current;

		function createSyncClient(token: string) {
			const newClient = new SyncClient(token, { logLevel: 'info' });

			newClient.on('connectionStateChanged', (state) => {
				if (state === 'connected') {
					clientRef.current = newClient;
					// client = newClient;
					setStatus('connected');
					setErrorMessage('');
				} else {
					setStatus('error');
					setErrorMessage(
						`Error: expected connected status but got ${state}`
					);
				}
			});

			newClient.on('tokenAboutToExpire', () => {
				console.log('token about to expire');
			});
			newClient.on('tokenExpired', () => {
				console.log('token expired');
			});
		}

		createSyncClient(token);
	}, [token]);

	return { client: clientRef.current, status, errorMessage };
}
