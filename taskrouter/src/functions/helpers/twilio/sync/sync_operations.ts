// Imports global types
import "@twilio-labs/serverless-runtime-types";
import { RuntimeSyncServiceContext } from "@twilio-labs/serverless-runtime-types/types";
import { Twilio } from "twilio";
import { WorkerInstance } from "twilio/lib/rest/taskrouter/v1/workspace/worker";

interface Params {
    client: Twilio;
    syncService: RuntimeSyncServiceContext;
}

exports.syncTaskrouterWorkers = async function syncTaskrouterWorkers(
    parameters: Params,
) {
    const { client, syncService } = parameters;

    try {
        const workers = await client.taskrouter.v1
            .workspaces(process.env.TWILIO_WORKSPACE_SID!)
            .workers.list({
                pageSize: 1000,
                targetWorkersExpression: "active == true",
            });

        const results = await syncService.syncMaps("SyncTaskRouterWorkers")
            .syncMapItems.list();

        const nonSyncedWorkers = workers.filter((worker) =>
            !results.some((item) => item.data.sid === worker.sid)
        );

        await Promise.all(
            nonSyncedWorkers.map((worker) => {
                const workerData = {
                    ...worker.toJSON(),
                    attributes: JSON.parse(worker.attributes),
                };
                return syncService.syncMaps("SyncTaskRouterWorkers")
                    .syncMapItems(worker.sid).update({
                        data: workerData,
                    });
            }),
        );

        const allResults = await Promise.all(
            workers
                .filter((w) => results.some((item) => item.data.sid === w.sid))
                .map((worker) => {
                    const workerData = {
                        ...worker.toJSON(),
                        attributes: JSON.parse(worker.attributes),
                    };
                    return syncService.syncMaps("SyncTaskRouterWorkers")
                        .syncMapItems(worker.sid).update({
                            data: workerData,
                        });
                }),
        );

        return;
    } catch (error) {
        console.error(error);
        return;
    }
};

interface QueueStatusParams extends Params {
    workers: WorkerInstance[];
}
exports.syncQueueStatus = async function syncQueueStatus(
    parameters: QueueStatusParams,
) {
    const { client, syncService, workers } = parameters;

    try {
        const results = await syncService.syncMaps("SyncTaskRouterWorkers")
            .syncMapItems.list();

        const nonSyncedWorkers = workers.filter((worker) =>
            !results.some((item) => item.data.sid === worker.sid)
        );

        await Promise.all(
            nonSyncedWorkers.map((worker) => {
                const workerData = {
                    ...worker.toJSON(),
                    attributes: JSON.parse(worker.attributes),
                };
                return syncService.syncMaps("SyncTaskRouterWorkers")
                    .syncMapItems(worker.sid).update({
                        data: workerData,
                    });
            }),
        );

        const allResults = await Promise.all(
            workers
                .filter((w) => results.some((item) => item.data.sid === w.sid))
                .map((worker) => {
                    const workerData = {
                        ...worker.toJSON(),
                        attributes: JSON.parse(worker.attributes),
                    };
                    return syncService.syncMaps("SyncTaskRouterWorkers")
                        .syncMapItems(worker.sid).update({
                            data: workerData,
                        });
                }),
        );

        return;
    } catch (error) {
        console.error(error);
        return;
    }
};
