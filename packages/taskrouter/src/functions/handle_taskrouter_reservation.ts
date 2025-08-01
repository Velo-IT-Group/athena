// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
    Context,
    ServerlessCallback,
    type ServerlessEventObject,
    ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import z from "zod";

const { syncTaskrouterWorkers } = require(
    Runtime.getFunctions()["helpers/twilio/sync/sync_operations"].path,
);

const eventCallbackSchema = z.discriminatedUnion("EventType", [
    z.object({
        WorkerActivityName: z.string(),
        EventType: z.literal("worker.activity.update"),
        ResourceType: z.literal("worker"),
        WorkerTimeInPreviousActivityMs: z.string(),
        Timestamp: z.string(),
        WorkerActivitySid: z.string(),
        WorkerPreviousActivitySid: z.string(),
        WorkerTimeInPreviousActivity: z.string(),
        AccountSid: z.string(),
        WorkerName: z.string(),
        Sid: z.string(),
        TimestampMs: z.string(),
        WorkerVersion: z.string(),
        WorkerSid: z.string(),
        WorkspaceSid: z.string(),
        WorkspaceName: z.string(),
        OperatingUnitSid: z.string(),
        WorkerPreviousActivityName: z.string(),
        EventDescription: z.string(),
        ResourceSid: z.string(),
        WorkerAttributes: z.string(),
    }),
    z.object({
        TaskPriority: z.string(),
        EventType: z.enum([
            "reservation.created",
            "reservation.accepted",
            "reservation.rejected",
            "reservation.canceled",
            "reservation.timeout",
            "reservation.rescinded",
            "reservation.wrapup",
            "reservation.completed",
        ]),
        WorkflowName: z.string(),
        Timestamp: z.string(),
        TaskAge: z.string(),
        TaskAssignmentStatus: z.string(),
        WorkerVersion: z.string(),
        TaskAttributes: z.string(),
        TaskVersion: z.string(),
        WorkerSid: z.string(),
        TaskChannelUniqueName: z.string(),
        WorkspaceName: z.string(),
        OperatingUnitSid: z.string(),
        TaskChannelSid: z.string(),
        TaskIgnoreCapacity: z.string(),
        TaskQueueEnteredDate: z.string(),
        TaskDateCreated: z.string(),
        WorkerActivityName: z.string(),
        ReservationSid: z.string(),
        ReservationVersion: z.string(),
        TaskVirtualStartTime: z.string(),
        WorkerChannelConsumedCapacity: z.string().optional(),
        ResourceType: z.string(),
        TaskQueueName: z.string(),
        WorkerActivitySid: z.string(),
        WorkflowSid: z.string(),
        AccountSid: z.string(),
        WorkerName: z.string(),
        Sid: z.string(),
        TimestampMs: z.string(),
        TaskQueueTargetExpression: z.string(),
        WorkerChannelCapacity: z.string().optional(),
        WorkspaceSid: z.string(),
        TaskQueueSid: z.string(),
        EventDescription: z.string(),
        TaskSid: z.string(),
        ResourceSid: z.string(),
        WorkerAttributes: z.string(),
    }),
]);

type MyEvent = {
    EventType?: TaskRouterEventType;
    TaskSid?: string;
    TaskAttributes?: string;
    TaskQueueName?: string;
    WorkerName?: string;
    WorkerSid?: string;
    WorkflowName?: string;
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
    const response = new Twilio.Response();
    response.setStatusCode(200);
    const { TWILIO_SYNC_SID } = context;
    const syncService = client.sync.v1.services(TWILIO_SYNC_SID!);

    const { error, data } = eventCallbackSchema.safeParse(event);

    if (error) {
        console.error("Parsed error:", error, event.EventType);
        return callback(error.message, undefined);
    } else {
        await syncTaskrouterWorkers({
            client,
            syncService,
            eventCallbackSchema: data,
        });
        return callback(null, response);
    }
};
