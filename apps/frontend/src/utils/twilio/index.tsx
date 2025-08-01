// import { Twilio } from 'twilio';
import { env } from '@/lib/utils';

// export const createClient = async () =>
// 	await new Twilio(
// 		env.VITE_TWILIO_API_KEY_SID,
// 		env.VITE_TWILIO_API_KEY_SECRET,
// 		{
// 			accountSid: env.VITE_TWILIO_ACCOUNT_SID,
// 		}
// 	);

const client = require('twilio')(
	env.VITE_TWILIO_ACCOUNT_SID,
	env.VITE_TWILIO_AUTH_TOKEN
);

export const createClient = () => client;
