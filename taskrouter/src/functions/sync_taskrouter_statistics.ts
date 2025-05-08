// Imports global types
import "@twilio-labs/serverless-runtime-types";
import { RuntimeSyncServiceContext } from "@twilio-labs/serverless-runtime-types/types";
import { Twilio } from "twilio";

type Params = {
	client: Twilio;
	syncService: RuntimeSyncServiceContext;
};

exports.syncTaskrouterStatistics = async function syncTaskrouterStatistics(
	parameters: Params,
) {
	const { client, syncService } = parameters;

	try {
		const stats = {
			totalTasks: 0,
			totalWorkers: 0,
		};
		const statistics = await client.taskrouter
			.v1
			.workspaces(process.env.TWILIO_WORKSPACE_SID!)
			.realTimeStatistics()
			.fetch();

		const cumulativeStatistics = await client.taskrouter
			.v1
			.workspaces(process.env.TWILIO_WORKSPACE_SID!)
			.cumulativeStatistics()
			.fetch();

		stats["totalTasks"] = statistics.totalTasks;
		stats["totalWorkers"] = statistics.totalWorkers;

		// @ts-ignore
		Object.entries(statistics.tasksByStatus).forEach(([key, value]) => {
			// @ts-ignore
			stats[`${key}Tasks`] = value;
		});

		statistics.activityStatistics.forEach((stat) => {
			const activityMap = {
				Offline: "activityOfflineWorkers",
				Idle: "activityIdleWorkers",
				Reserved: "activityReservedWorkers",
				Busy: "activityBusyWorkers",
			};
			// @ts-ignore
			const activityKey = activityMap[stat.friendly_name];
			// @ts-ignore
			if (activityKey) stats[activityKey] = stat.workers;
		});
		// @ts-ignore
		stats["avgTaskAcceptanceTime"] =
			cumulativeStatistics.avgTaskAcceptanceTime;
		// @ts-ignore
		stats["startTime"] = cumulativeStatistics.startTime;
		// @ts-ignore
		stats["endTime"] = cumulativeStatistics.endTime;

		const newData = { Data: JSON.stringify(stats) };

		const syncDocument = process.env.TWILIO_SYNC_DOC_SID!;
		await syncService.documents.get(syncDocument).update({ data: stats });

		return;
	} catch (error) {
		console.error(error);
		return;
	}
};
