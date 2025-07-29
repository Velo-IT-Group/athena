// Imports global types
import "@twilio-labs/serverless-runtime-types";
import {
    Context,
    ServerlessCallback,
    ServerlessEventObject,
    ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

const syncMapTypes = [
    "reservation.accepted",
    "task.created",
    "task.canceled",
    "worker.activity.update",
    "worker.attributes.update",
] as const;

type MyEvent = {
    eventType?: typeof syncMapTypes[number];
    TaskAttributes?: string;
};

type QueueStatus = {
    calls_in_queue: number;
    status: "red" | "yellow" | "green";
    voicemails_in_queue: number;
    workers_available: number;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
export type MyContext = {
    ACCOUNT_SID?: string;
    AUTH_TOKEN?: string;
    CLIENT_ID?: string;
    CW_AUTH?: string;
    TWILIO_SYNC_SID?: string;
    TWILIO_SYNC_MAP_SID?: string;
    TWILIO_SYNC_DOC_SID?: string;
    TWILIO_WORKSPACE_SID?: string;
};

export const handler: ServerlessFunctionSignature = async function (
    context: Context<MyContext>,
    event: ServerlessEventObject<MyEvent>,
    callback: ServerlessCallback,
) {
    const client = context.getTwilioClient();
    const { TWILIO_SYNC_SID } = context;
    const syncService = client.sync.v1.services(TWILIO_SYNC_SID!);
    const taskAttributes = event.TaskAttributes !== undefined
        ? JSON.parse(event.TaskAttributes) as Record<string, any>
        : undefined;
    const queueStatusContext = syncService.documents(
        "Queue Status",
    );
    let queueStatus = (await queueStatusContext.fetch()).data as QueueStatus;
    const workers = await client.taskrouter.v1.workspaces(
        context.TWILIO_WORKSPACE_SID!,
    ).workers.list({ available: "true" });

    // Calculate workers with voice channel capacity
    const workerChannels = await Promise.all(
        workers.map((w) => w.workerChannels().list()),
    );
    const workersWithVoiceCapacity = workerChannels.reduce(
        (count, channels, index) => {
            const voiceChannel = channels.find((c) =>
                c.taskChannelUniqueName === "voice"
            );
            if (
                voiceChannel && voiceChannel.available &&
                voiceChannel.availableCapacityPercentage > 0
            ) {
                return count + 1;
            }
            return count;
        },
        0,
    );

    // Update queue status based on worker capacity
    if (workersWithVoiceCapacity === 0) {
        queueStatus.status = "red";
    } else if (workersWithVoiceCapacity < 2) {
        queueStatus.status = "yellow";
    } else {
        queueStatus.status = "green";
    }

    queueStatus.workers_available = workersWithVoiceCapacity;

    // console.log(event.eventType);

    try {
        switch (event.eventType) {
            // Handle reservation accepted event
            case "reservation.accepted": {
                // Removing call from waiting queue
                if (
                    taskAttributes?.direction !== "inbound" &&
                    taskAttributes?.taskType !== "voicemail"
                ) return;

                if (taskAttributes?.taskType === "voicemail") {
                    const voicemails_in_queue =
                        queueStatus.voicemails_in_queue - 1 >= 0
                            ? queueStatus.voicemails_in_queue -= 1
                            : 0;

                    queueStatus.voicemails_in_queue = voicemails_in_queue;
                } else {
                    const calls_in_queue = queueStatus.calls_in_queue - 1 >= 0
                        ? queueStatus.calls_in_queue -= 1
                        : 0;

                    queueStatus.calls_in_queue = calls_in_queue;
                }

                break;
            }
            // Handle task created event
            case "task.created": {
                console.log("Task created:", taskAttributes);
                if (
                    taskAttributes?.direction !== "inbound" &&
                    taskAttributes?.taskType !== "voicemail"
                ) return;

                if (taskAttributes?.taskType === "voicemail") {
                    const voicemails_in_queue = queueStatus
                        .voicemails_in_queue += 1;

                    queueStatus.voicemails_in_queue = voicemails_in_queue;
                } else {
                    const calls_in_queue = queueStatus.calls_in_queue += 1;
                    console.log(calls_in_queue);

                    queueStatus.calls_in_queue = calls_in_queue;
                }

                break;
            }
            // Handle task canceled event
            case "task.canceled": {
                if (taskAttributes?.taskType === "voicemail") {
                    const voicemails_in_queue =
                        queueStatus.voicemails_in_queue - 1 >= 0
                            ? queueStatus.voicemails_in_queue -= 1
                            : 0;

                    queueStatus.voicemails_in_queue = voicemails_in_queue;
                } else {
                    const calls_in_queue = queueStatus.calls_in_queue - 1 >= 0
                        ? queueStatus.calls_in_queue -= 1
                        : 0;

                    queueStatus.calls_in_queue = calls_in_queue;
                }
                break;
            }
            default:
                console.log("Unknown event type: ", event.eventType);
        }

        // Update the sync document with the new queue status
        console.log(queueStatus);
        await queueStatusContext.update({ data: queueStatus });
        callback(null, queueStatus);
    } catch (error) {
        callback(error as Error, undefined);
    }
};
