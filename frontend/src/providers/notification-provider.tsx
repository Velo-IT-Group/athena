import React, { ReactNode, useContext, useEffect, useState } from 'react';

interface TwilioProviderProps {
	createNotification: (title: string, options?: NotificationOptions) => void;
}

const initialValues: TwilioProviderProps = {
	createNotification: () => undefined,
};

interface WithChildProps {
	children: React.ReactNode;
}

const context = React.createContext(initialValues);
const { Provider } = context;

export const NotificationProvider = ({ children }: WithChildProps) => {
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		window.addEventListener('focus', () => {
			setIsFocused(true);
		});
		window.addEventListener('blur', () => {
			setIsFocused(false);
		});
	}, []);

	useEffect(() => {
		if (!('Notification' in window)) {
			// Check if the browser supports notifications
			alert('This browser does not support desktop notification');
		} else if (Notification.permission === 'granted') {
		} else if (Notification.permission !== 'denied') {
			// We need to ask the user for permission
			Notification.requestPermission().then((permission) => {
				// If the user accepts, let's create a notification
				if (permission === 'granted') {
					// const notification = new Notification('Hi there!');
					// …
				}
			});
		}
	}, []);

	useEffect(() => {
		window.addEventListener('blur', function () {});

		return () => {
			window.removeEventListener('blur', function () {});
		};
	}, []);

	const createNotification = (title: string, options?: NotificationOptions) => {
		if (!isFocused) {
			new Notification(title, options);
		}
	};

	return <Provider value={{ createNotification }}>{children}</Provider>;
};

export const useNotifications = () => {
	const state = useContext(context);

	return state;
};
