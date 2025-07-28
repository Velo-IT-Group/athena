import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@twilio/conversations';

const useConversationClient = (token: string) => {
	const [isConnected, setIsConnected] = useState(false);
	const clientRef = useRef<Client | null>(null);

	useEffect(() => {
		const client = new Client(token, {});
		clientRef.current = client;

		client.on('initialized', () => {
			console.log('initialized');
		});

		client.on('tokenAboutToExpire', () => {
			console.log('token about to expire');
		});

		client.on('connectionStateChanged', (state) => {
			console.log('connectionStateChanged', state);
			setIsConnected(state === 'connected');
		});

		client.on('tokenExpired', () => {
			console.log('token expired');
		});

		client.on('connectionError', (error) => {
			console.log('connectionError', error);
		});
	}, [token]);

	return {
		client: clientRef.current,
		isConnected,
	};
};

export default useConversationClient;
