'use client';
import { useQueryClient } from '@tanstack/react-query';
import type { ConnectionState } from '@twilio/conversations';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SyncClient } from 'twilio-sync';

export default function useSyncClient(token: string) {
	const [status, setStatus] = useState('Connecting...');
	const [errorMessage, setErrorMessage] = useState('');
	const client = useQueryClient();
	const clientRef = useRef<SyncClient>(null);

	const handleTokenExpiring = useCallback(() => {
		setTimeout(() => {
			const newToken = client.getQueryData<string>(['access-token']);
			clientRef.current?.updateToken(newToken || '');
		}, 1000);
	}, [client]);

	const handleTokenExpiration = useCallback(() => {
		// delaying slightly to make sure data is updated
		setTimeout(() => {
			const newToken = client.getQueryData<string>(['access-token']);
			clientRef.current?.updateToken(newToken || '');
		}, 1000);
	}, [client]);

	const handleConnectionStateChange = useCallback(
		(state: ConnectionState) => {
			if (state === 'connected') {
				setStatus('connected');
				setErrorMessage('');
			} else {
				setStatus('error');
				setErrorMessage(
					`Error: expected connected status but got ${state}`
				);
			}
		},
		[]
	);

	useEffect(() => {
		if (!token) return;

		const newClient = new SyncClient(token, { logLevel: 'info' });

		newClient.on('connectionStateChanged', handleConnectionStateChange);

		newClient.on('tokenAboutToExpire', handleTokenExpiring);

		newClient.on('tokenExpired', handleTokenExpiration);

		clientRef.current = newClient;

		return () => {
			newClient.off(
				'connectionStateChanged',
				handleConnectionStateChange
			);
			newClient.off('tokenAboutToExpire', handleTokenExpiring);
			newClient.off('tokenExpired', handleTokenExpiration);
		};
	}, [
		token,
		handleConnectionStateChange,
		handleTokenExpiring,
		handleTokenExpiration,
	]);

	return { client: clientRef.current, status, errorMessage };
}
