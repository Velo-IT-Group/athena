// Imports global types
import "@twilio-labs/serverless-runtime-types";
import { RuntimeSyncServiceContext } from "@twilio-labs/serverless-runtime-types/types";
import { Twilio } from "twilio";
import { WorkerInstance } from "twilio/lib/rest/taskrouter/v1/workspace/worker";
import { ReservationInstance } from "twilio/lib/rest/taskrouter/v1/workspace/worker/reservation";
import z from "zod";
import { eventCallbackSchema } from "../../../callback";

interface Params {
    client: Twilio;
    syncService: RuntimeSyncServiceContext;
    eventCallbackSchema: z.infer<typeof eventCallbackSchema>;
}

exports.syncTaskrouterWorkers = async function syncTaskrouterWorkers(
    parameters: Params,
) {
    const { client, syncService, eventCallbackSchema } = parameters;
    const { WorkerSid, WorkerAttributes, WorkerName, WorkerActivityName } =
        eventCallbackSchema;
    const syncMapContext = syncService.syncMaps("Sync Worker Reservations");
    const syncMapItemContext = syncMapContext.syncMapItems(WorkerSid);

    try {
        const syncMapItem = await syncMapItemContext.fetch();

        const data: {
            name: string;
            activity: string;
            dateActivityChanged: Date;
            reservations: {
                sid: string;
                taskSid: string;
                reservationStatus: string;
                dateCreated: Date;
                dateUpdated: Date;
                taskAttributes: string;
                wrapUpTime?: Date;
            }[];
        } = {
            name: JSON.parse(WorkerAttributes)?.full_name ||
                WorkerName,
            activity: WorkerActivityName,
            dateActivityChanged: new Date(),
            reservations: [],
            ...syncMapItem.data,
        };

        switch (eventCallbackSchema.EventType) {
            case "reservation.created": {
                data.reservations = [...data.reservations, {
                    sid: eventCallbackSchema.ReservationSid,
                    taskSid: eventCallbackSchema.TaskSid,
                    reservationStatus: "pending",
                    dateCreated: new Date(
                        Number(eventCallbackSchema.TimestampMs) * 1000,
                    ),
                    dateUpdated: new Date(
                        Number(eventCallbackSchema.TimestampMs) * 1000,
                    ),
                    taskAttributes: eventCallbackSchema.TaskAttributes,
                }];
                break;
            }
            case "reservation.canceled": {
                data.reservations = data.reservations.filter((res) =>
                    res.sid !== eventCallbackSchema.ReservationSid
                );
                break;
            }
            case "reservation.rescinded": {
                data.reservations = data.reservations.filter((res) =>
                    res.sid !== eventCallbackSchema.ReservationSid
                );
                break;
            }
            case "reservation.timeout": {
                data.reservations = data.reservations.filter((res) =>
                    res.sid !== eventCallbackSchema.ReservationSid
                );
                break;
            }
            case "reservation.wrapup": {
                data.reservations = data.reservations.map((res) =>
                    res.sid === eventCallbackSchema.ReservationSid
                        ? {
                            sid: eventCallbackSchema.ReservationSid,
                            taskSid: eventCallbackSchema.TaskSid,
                            reservationStatus: "wrapping",
                            dateCreated: new Date(
                                Number(eventCallbackSchema.TimestampMs) * 1000,
                            ),
                            dateUpdated: new Date(
                                Number(eventCallbackSchema.TimestampMs) * 1000,
                            ),
                            wrapUpTime: new Date(
                                Number(eventCallbackSchema.TimestampMs) * 1000,
                            ),
                            taskAttributes: eventCallbackSchema.TaskAttributes,
                        }
                        : res
                );
                break;
            }
            case "reservation.completed": {
                data.reservations = data.reservations.filter((res) =>
                    res.sid !== eventCallbackSchema.ReservationSid
                );
                break;
            }
            case "reservation.accepted": {
                data.reservations = data.reservations.map((res) =>
                    res.sid === eventCallbackSchema.ReservationSid
                        ? {
                            sid: eventCallbackSchema.ReservationSid,
                            taskSid: eventCallbackSchema.TaskSid,
                            reservationStatus: "accepted",
                            dateCreated: new Date(
                                Number(eventCallbackSchema.TimestampMs) * 1000,
                            ),
                            dateUpdated: new Date(
                                Number(eventCallbackSchema.TimestampMs) * 1000,
                            ),
                            taskAttributes: eventCallbackSchema.TaskAttributes,
                        }
                        : res
                );
                break;
            }
            case "reservation.rejected": {
                data.reservations = data.reservations.filter((res) =>
                    res.sid !== eventCallbackSchema.ReservationSid
                );
                break;
            }
            case "worker.activity.update": {
                data.activity = eventCallbackSchema.WorkerActivityName;
                data.dateActivityChanged = new Date();
                break;
            }
            default: {
            }
        }

        console.log(eventCallbackSchema.EventType, "Data to sync: ", data);

        await syncMapItemContext.update({
            data,
        });
    } catch (error) {
        await syncMapContext.syncMapItems.create({
            key: WorkerSid,
            data: {
                name: JSON.parse(WorkerAttributes)?.full_name || WorkerName,
                activity: WorkerActivityName,
                dateActivityChanged: new Date(),
                reservations: [],
            },
        });
    }

    // const workerContext = client.taskrouter.v1.workspaces(
    //     process.env.TWILIO_WORKSPACE_SID!,
    // )
    //     .workers(WorkerSid);

    // const [worker, reservations] = await Promise.all([
    //     workerContext.fetch(),
    //     // @ts-ignore
    //     workerContext.reservations.list({
    //         limit: 1000,
    //         reservationStatus: ["pending", "accepted", "wrapping"],
    //     }),
    // ]);

    // const reservations = ;

    // try {
    //     const workers = await client.taskrouter.v1
    // .workspaces(process.env.TWILIO_WORKSPACE_SID!)
    // .workers.list({
    //     pageSize: 1000,
    //     targetWorkersExpression: "active == true",
    // });

    //     const nonSyncedWorkers = workers.filter((worker) =>
    //         !results.some((item) => item.data.sid === worker.sid)
    //     );

    //     await Promise.all(
    //         nonSyncedWorkers.map((worker) => {
    //             const workerData = {
    //                 ...worker.toJSON(),
    //                 attributes: JSON.parse(worker.attributes),
    //             };
    //             return syncService.syncMaps("SyncTaskRouterWorkers")
    //                 .syncMapItems(worker.sid).update({
    //                     data: workerData,
    //                 });
    //         }),
    //     );

    //     const allResults = await Promise.all(
    //         workers
    //             .filter((w) => results.some((item) => item.data.sid === w.sid))
    //             .map((worker) => {
    //                 const workerData = {
    //                     ...worker.toJSON(),
    //                     attributes: JSON.parse(worker.attributes),
    //                 };
    //                 return syncService.syncMaps("SyncTaskRouterWorkers")
    //                     .syncMapItems(worker.sid).update({
    //                         data: workerData,
    //                     });
    //             }),
    //     );

    //     return;
    // } catch (error) {
    //     console.error(error);
    //     return;
    // }
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
