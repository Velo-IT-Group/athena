// Imports global types
import "@twilio-labs/serverless-runtime-types";
import { RuntimeSyncServiceContext } from "@twilio-labs/serverless-runtime-types/types";
import { Twilio } from "twilio";

type Params = {
	client: Twilio;
	syncService: RuntimeSyncServiceContext;
};

exports.syncTaskrouterTasks = async function syncTaskrouterTasks(
	parameters: Params,
) {
	const { client, syncService } = parameters;

	try {
		const syncMap = process.env.TWILIO_SYNC_MAP_SID!;
		// fetch all tasks that aren't completed or canceled
		const [tasks, syncItems] = await Promise.all([
			client.taskrouter
				.v1
				.workspaces(process.env.TWILIO_WORKSPACE_SID!)
				.tasks.list({
					assignmentStatus: [
						"pending",
						"reserved",
						"assigned",
						"wrapping",
					],
				}),
			syncService.syncMaps(syncMap).syncMapItems.list({ limit: 1000 }),
		]);

		const mappedIds = tasks.map((task) => task.sid);

		const outOfSyncItems = syncItems.filter(
			(item) => !mappedIds.includes(item.key),
		);

		await Promise.all(outOfSyncItems.map((item) => item.remove()));

		for (const task of tasks) {
			const itemKey = task.sid;
			try {
				await syncService
					.syncMaps(syncMap)
					.syncMapItems(itemKey)
					.update({ data: task });
			} catch (error) {
				console.error(error);
				await syncService
					.syncMaps(syncMap)
					.syncMapItems.create({ data: task, key: itemKey });
			}
		}

		return;
	} catch (error) {
		console.error(error);
		return;
	}
};
