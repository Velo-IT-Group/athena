import { createServerFileRoute } from "@tanstack/react-start/server";
import { json } from "@tanstack/react-start";
import pkg from "twilio";
const { Twilio } = pkg;
import { env } from "@/lib/utils";
import type { WorkerInstance } from "twilio/lib/rest/taskrouter/v1/workspace/worker";

export const ServerRoute = createServerFileRoute("/api/worker-sync").methods({
	POST: async ({ request, params }) => {
		const client = await new Twilio(
			env.VITE_TWILIO_API_KEY_SID,
			env.VITE_TWILIO_API_KEY_SECRET,
			{
				accountSid: env.VITE_TWILIO_ACCOUNT_SID,
			},
		);

		const syncService = client.sync.v1.services(env.VITE_TWILIO_SYNC_SID);

		try {
			const workers = await client.taskrouter.v1
				.workspaces(env.VITE_TWILIO_WORKSPACE_SID)
				.workers.list({
					pageSize: 1000,
					targetWorkersExpression: "active == true",
				});

			const results = await syncService
				.syncMaps("SyncTaskRouterWorkers")
				.syncMapItems.list();

			console.log("results", results);

			const nonSyncedWorkers = workers.filter(
				(worker) =>
					!results.some(
						(item) =>
							(item.data as unknown as WorkerInstance).sid === worker.sid,
					),
			);
			console.log("nonSyncedWorkers", nonSyncedWorkers);

			await Promise.all(
				nonSyncedWorkers.map((worker) => {
					const workerData = {
						...worker.toJSON(),
						attributes: JSON.parse(worker.attributes),
					};
					return syncService
						.syncMaps("SyncTaskRouterWorkers")
						.syncMapItems.create({
							data: workerData,
							key: worker.sid,
						});
					// return syncService.syncMaps("SyncTaskRouterWorkers")
					//     .syncMapItems(worker.sid).update({
					//         data: workerData,
					//     });
				}),
			);

			const allResults = await Promise.all(
				workers
					.filter((w) =>
						results.some(
							(item) => (item.data as unknown as WorkerInstance).sid === w.sid,
						),
					)
					.map((worker) => {
						const workerData = {
							...worker.toJSON(),
							attributes: JSON.parse(worker.attributes),
						};
						return syncService
							.syncMaps("SyncTaskRouterWorkers")
							.syncMapItems(worker.sid)
							.update({
								data: workerData,
							});
					}),
			);

			console.log("allResults", allResults);

			return json({ message: "Worker sync completed" });
		} catch (error) {
			console.error(error);
			return json({ message: "Worker sync failed" }, { status: 500 });
		}
	},
});
