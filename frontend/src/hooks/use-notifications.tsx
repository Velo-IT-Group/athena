import { getNotificationsQuery } from '@/lib/supabase/api';
import { createClient } from '@/lib/supabase/client';
import { updateNotification } from '@/lib/supabase/update';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useEffect } from 'react';

export interface PostgresChangeEvent<T> {
	schema: string;
	table: string;
	commit_timestamp: string;
	eventType: string;
	new: T;
	old: T;
	errors: any;
}

// {
//   "schema": "public",
//   "table": "notifications",
//   "commit_timestamp": "2025-05-15T17:06:30.019Z",
//   "eventType": "INSERT",
//   "new": {
//     "created_at": "2025-05-15T17:06:30.012133+00:00",
//     "from": "\"Cami Black\"",
//     "id": "aae49023-fb87-476b-b8db-f8d553652437",
//     "is_read": false,
//     "read_at": null,
//     "resource_params": {
//       "id": "8cf894cf-b8d0-4006-843d-b81bc6cb8bb2",
//       "version": "2cfff25a-73a7-457b-b508-8f6c5523f726"
//     },
//     "resource_path": "/proposals/8cf894cf-b8d0-4006-843d-b81bc6cb8bb2/2cfff25a-73a7-457b-b508-8f6c5523f726",
//     "type": "proposal_approved",
//     "user_id": "6fecc24c-9c51-44b8-a45c-739e255dd586"
//   },
//   "old": {},
//   "errors": null
// }

const useNotifications = () => {
	const queryClient = useQueryClient();

	const query = getNotificationsQuery();
	const { queryKey } = query;

	const { data: notifications } = useSuspenseQuery(query);

	useEffect(() => {
		if (!notifications) return;
		const supabase = createClient();
		supabase.realtime
			.channel('notifications')
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payloadData) => {
				const payload = payloadData as PostgresChangeEvent<AppNotification>;
				queryClient.setQueryData(queryKey, [payload.new as AppNotification, ...notifications]);
			})
			.subscribe();
	}, [notifications]);

	const unreadNotifications = notifications?.filter((notification) => !notification.is_read);
	const archiveNotifications = notifications?.filter((notification) => notification.is_read);

	const markAllNotificationsAsRead = useMutation({
		mutationFn: async () =>
			await Promise.all(
				unreadNotifications?.map((notification) =>
					updateNotification({
						data: {
							id: notification.id,
							notification: { is_read: true },
						},
					})
				)
			),
		onMutate: () => {
			queryClient.invalidateQueries({ queryKey });
			const updatedNotifications = unreadNotifications?.map((notification) => ({
				...notification,
				is_read: true,
			}));
			queryClient.setQueryData(queryKey, updatedNotifications);

			return { oldItems: unreadNotifications, newItems: updateNotification };
		},
		onError(error, variables, context) {
			queryClient.setQueryData(queryKey, context?.oldItems);
		},
		onSettled(data, error, variables, context) {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const markNotificationAsRead = useMutation({
		mutationFn: async (id: string) =>
			updateNotification({
				data: { id, notification: { is_read: true } },
			}),
		onMutate: (id) => {
			queryClient.invalidateQueries({ queryKey });

			const notifications = queryClient.getQueryData<AppNotification[]>(queryKey)?.map((notification) => ({
				...notification,
				is_read: true,
			}));

			if (!notifications) return;

			const notification = notifications.find((notification) => notification.id === id);

			if (!notification) return;

			const newItems = [...notifications.filter((notification) => notification.id !== id), notification];

			queryClient.setQueryData(queryKey, newItems);

			return { oldItems: notifications, newItems };
		},
		onError(error, variables, context) {
			queryClient.setQueryData(queryKey, context?.oldItems);
		},
		onSettled(data, error, variables, context) {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	return {
		allNotifications: notifications,
		unreadNotifications,
		archiveNotifications,
		markAllNotificationsAsRead,
		markNotificationAsRead,
	};
};

export default useNotifications;
