import { env } from '@/lib/utils';
import Twilio from 'twilio';
import { SyncClient } from 'twilio-sync';
// import { cookies } from 'next/headers';

export const createClient = async () =>
	await new Twilio.Twilio(env.VITE_TWILIO_API_KEY_SID, env.VITE_TWILIO_API_KEY_SECRET, {
		accountSid: env.VITE_TWILIO_ACCOUNT_SID,
	});

export const createSyncClient = async () => {
	// const cookieStore = await cookies();
	// const token = cookieStore.get('twilio_token')?.value;
	// console.log('TOKEN', token);
	// if (!token) throw new Error('No token found');

	return await new SyncClient('token');
};
