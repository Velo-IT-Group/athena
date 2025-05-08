import { createClient } from '@/utils/twilio';
import { env } from '../utils';

export const createWorker = async (friendlyName: string, attributes: Record<string, any>) => {
	const client = await createClient();

	console.log(friendlyName, attributes);

	try {
		const worker = await client.taskrouter.v1.workspaces(env.VITE_TWILIO_WORKSPACE_SID).workers.create({
			friendlyName,
			attributes: JSON.stringify(attributes),
		});

		return worker;
	} catch (error) {}
};
