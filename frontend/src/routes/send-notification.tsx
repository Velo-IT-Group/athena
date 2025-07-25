import { createServerFileRoute } from '@tanstack/react-start/server';
import { Message } from 'firebase-admin/messaging';
import admin from 'firebase-admin';
import serviceAccount from '@/service_key.json';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	})
}

export const ServerRoute = createServerFileRoute('/send-notification').methods({
	POST: async ({ request }) => {
		const { token, title, message, link } = await request.json();

		const payload: Message = {
			token,
			notification: {
				title: title,
				body: message,
			},
			webpush: link && {
				fcmOptions: {
					link,
				},
			},
		}

		try {
			await admin.messaging().send(payload);

			return Response.json({
				success: true,
				message: 'Notification sent!',
			})
		} catch (error) {
			return Response.json({ success: false, error });
		}
	},
});
