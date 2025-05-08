import { createClient } from '@/utils/twilio';

export const deleteWorker = async (id: string) => {
	const client = await createClient();
	try {
		return await client.taskrouter.v1.workspaces(env.VITE_WORKSPACE_SID!).workers(id).remove();
	} catch (error) {
		console.error(error);
		return false;
	}
};
