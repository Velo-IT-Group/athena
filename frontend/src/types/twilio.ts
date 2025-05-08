import { z } from "zod";

export type ActivityDuration = {
    avg: number;
    friendly_name: string;
    max: number;
    min: number;
    sid: string;
    total: number;
};

export const filterTargetSchema = z.object({ queue: z.string() });

export const filtersSchema = z.object({
    targets: z.array(filterTargetSchema),
    expression: z.string(),
    filter_friendly_name: z.string(),
});

export interface EventResponse {
    events: Event[];
    meta: Meta;
}

export interface Event {
    account_sid: string;
    actor_sid: string;
    actor_type: string;
    actor_url: string;
    description: string;
    event_data: EventData;
    event_date: string;
    event_date_ms: number;
    event_type: string;
    resource_sid: string;
    resource_type: string;
    resource_url: string;
    sid: string;
    source: string;
    source_ip_address: string;
    url: string;
    workspace_sid: string;
}

export interface EventData {
    operating_unit_sid: string;
    task_age?: string;
    task_assignment_status?: string;
    task_attributes?: string;
    task_channel_sid?: string;
    task_channel_unique_name?: string;
    task_canceled_reason?: string;
    task_priority?: string;
    task_queue_entered_date?: string;
    task_queue_name?: string;
    task_queue_sid?: string;
    task_queue_target_expression?: string;
    task_sid?: string;
    task_version?: string;
    task_virtual_start_time?: string;
    workflow_name?: string;
    workflow_sid?: string;
    workspace_name: string;
    workspace_sid: string;
    reservation_sid?: string;
    reservation_version?: string;
    worker_activity_name?: string;
    worker_activity_sid?: string;
    worker_attributes?: string;
    worker_channel_capacity?: string;
    worker_name?: string;
    worker_sid?: string;
    worker_version?: string;
    worker_previous_activity_name?: string;
    worker_previous_activity_sid?: string;
    worker_time_in_previous_activity?: string;
    worker_time_in_previous_activity_ms?: string;
    workflow_filter_expression?: string;
    workflow_filter_target_expression?: string;
    previous_task_priority?: string;
    previous_task_queue_name?: string;
    previous_task_queue_sid?: string;
    target_changed_reason?: string;
}

export interface Meta {
    first_page_url: string;
    key: string;
    next_page_url: any;
    page: number;
    page_size: number;
    previous_page_url: any;
    url: string;
}

export const createPartipantParamsSchema = z.object({
    From: z.string(),
    To: z.string(),
    Label: z.string(),
    EarlyMedia: z.boolean(),
    Beep: z.string(),
    Muted: z.boolean(),
    StatusCallback: z.string(),
    StatusCallbackMethod: z.string(),
    StatusCallbackEvent: z.string(),
    Record: z.boolean(),
    Trim: z.string(),
    TimeLimit: z.number(),
    CallToken: z.string(),
    MachineDetection: z.string(),
    MachineDetectionTimeout: z.number(),
    MachineDetectionSpeechThreshold: z.number(),
    MachineDetectionSpeechEndThreshold: z.number(),
    MachineDetectionSilenceTimeout: z.number(),
    AmdStatusCallback: z.string(),
    AmdStatusCallbackMethod: z.string(),
    MachineDetectionEngine: z.string(),
    MachineDetectionMinWordLength: z.number(),
    MachineDetectionMaxWordLength: z.number(),
    MachineDetectionWordsSilence: z.number(),
    MachineDetectionMaxNumOfWords: z.number(),
    MachineDetectionSilenceThreshold: z.number(),
});

export type CreateParticipantParams = z.infer<
    typeof createPartipantParamsSchema
>;

export const workflowConfigurationSchema = z.object({
    task_routing: z.object({
        filters: z.array(filtersSchema),
    }),
});

export const offsetSchema = z.object({ x: z.number(), y: z.number() });

export const statePropertiesSchema = z.object({
    offset: offsetSchema,
    workflow_sid: z.string().optional(),
    task_attributes: z.string().optional(),
});

export const triggerEventSchema = z.object({
    event: z.enum([
        "incomingMessage",
        "incomingCall",
        "incomingConversationMessage",
        "incomingRequest",
        "incomingParent",
    ]),
    next: z.string().optional(),
});

export const flowStateSchema = z.object({
    name: z.string(),
    type: z.enum(["trigger", "enqueue-call"]),
    transitions: z.array(triggerEventSchema).default([]),
    properties: statePropertiesSchema,
});

export const queueSchema = z.object({
    accountSid: z.string(),
    assignmentActivitySid: z.string(),
    assignmentActivityName: z.string(),
    dateCreated: z.string(),
    dateUpdated: z.string(),
    friendlyName: z.string(),
    maxReservedWorkers: z.number(),
    reservationActivitySid: z.string(),
    reservationActivityName: z.string(),
    sid: z.string(),
    targetWorkers: z.string(),
    taskOrder: z.string(),
    url: z.string(),
    workspaceSid: z.string(),
});

export type FlowState = z.infer<typeof flowStateSchema>;
export type FilterTarget = z.infer<typeof filterTargetSchema>;
export type WorkflowConfiguration = z.infer<typeof workflowConfigurationSchema>;
export type Queue = z.infer<typeof queueSchema>;

export type CustomTaskAttributes = {
    name: string;
    from: string;
    channelType: string;
    channelSid: string;
    userId: number;
    company: string;
    team: string;
    companyId: number;
    userFirstName: string;
    userLastName: string;
    companyName: string;
};

export type WorkerAttributes = {
    full_name: string;
    mobile_phone: string;
    roles: Array<string>;
    contact_uri: string;
    backup_contact_uri?: string;
    work_phone: string;
    selectedCallerId: string;
    direct_dial: string;
    job_title: string;
    email: string;
    on_call: boolean;
};

export const preflightTestReportSchema = z.object({
    callSid: z.string(),
    edge: z.string(),
    iceCandidateStats: z.string(),
    networkTiming: z.object({
        signaling: z.object({
            start: z.number(),
            end: z.number(),
            duration: z.number(),
        }),
        dtls: z.object({
            start: z.number(),
            end: z.number(),
            duration: z.number(),
        }),
        ice: z.object({
            start: z.number(),
            end: z.number(),
            duration: z.number(),
        }),
        peerConnection: z.object({
            start: z.number(),
            end: z.number(),
            duration: z.number(),
        }),
    }),
    samples: z.array(
        z.object({
            audioInputLevel: z.number(),
            audioOutputLevel: z.number(),
            bytesReceived: z.number(),
            bytesSent: z.number(),
            codecName: z.string(),
            jitter: z.number(),
            mos: z.null(),
            packetsLost: z.number(),
            packetsLostFraction: z.number(),
            packetsReceived: z.number(),
            packetsSent: z.number(),
            rtt: z.number(),
            timestamp: z.number(),
            totals: z.object({
                bytesReceived: z.number(),
                bytesSent: z.number(),
                packetsLost: z.number(),
                packetsLostFraction: z.number(),
                packetsReceived: z.number(),
                packetsSent: z.number(),
            }),
        }),
    ),
    selectedEdge: z.string(),
    stats: z.object({
        jitter: z.object({
            average: z.number(),
            max: z.number(),
            min: z.number(),
        }),
        mos: z.object({
            average: z.number(),
            max: z.number(),
            min: z.number(),
        }),
        rtt: z.object({
            average: z.number(),
            max: z.number(),
            min: z.number(),
        }),
    }),
    testTiming: z.object({
        start: z.number(),
        end: z.number(),
        duration: z.number(),
    }),
    totals: z.object({
        bytesReceived: z.number(),
        bytesSent: z.number(),
        packetsLost: z.number(),
        packetsLostFraction: z.number(),
        packetsReceived: z.number(),
        packetsSent: z.number(),
    }),
    warnings: z.array(
        z.object({
            name: z.string(),
            description: z.string(),
            rtcWarning: z.object({
                values: z.array(z.number()),
                samples: z.array(
                    z.object({
                        audioInputLevel: z.number(),
                        audioOutputLevel: z.number(),
                        bytesReceived: z.number(),
                        bytesSent: z.number(),
                        codecName: z.string(),
                        jitter: z.number(),
                        mos: z.number(),
                        packetsLost: z.number(),
                        packetsLostFraction: z.number(),
                        packetsReceived: z.number(),
                        packetsSent: z.number(),
                        rtt: z.number(),
                        timestamp: z.number(),
                        totals: z.object({
                            bytesReceived: z.number(),
                            bytesSent: z.number(),
                            packetsLost: z.number(),
                            packetsLostFraction: z.number(),
                            packetsReceived: z.number(),
                            packetsSent: z.number(),
                        }),
                    }),
                ),
                name: z.string(),
                threshold: z.object({ name: z.string(), value: z.number() }),
            }),
        }),
    ),
    selectedIceCandidatePairStats: z.object({
        localCandidate: z.object({
            id: z.string(),
            timestamp: z.number(),
            type: z.string(),
            transportId: z.string(),
            isRemote: z.boolean(),
            networkType: z.string(),
            ip: z.string(),
            address: z.string(),
            port: z.number(),
            protocol: z.string(),
            candidateType: z.string(),
            priority: z.number(),
        }),
        remoteCandidate: z.object({
            id: z.string(),
            timestamp: z.number(),
            type: z.string(),
            transportId: z.string(),
            isRemote: z.boolean(),
            ip: z.string(),
            address: z.string(),
            port: z.number(),
            protocol: z.string(),
            candidateType: z.string(),
            priority: z.number(),
        }),
    }),
    isTurnRequired: z.boolean(),
    callQuality: z.string(),
});

export type PreflightTestReport = z.infer<typeof preflightTestReportSchema>;

export type WorkerSyncItem = {
    available: boolean;
    activityName: string;
    activitySid: string;
    sid: string;
    friendlyName: string;
    attributes: Record<string, any>;
    dateUpdated: Date;
    dateStatusChanged: Date;
};

export type TaskSyncItem = {
    age: number;
    assignmentStatus: string;
    attributes: Record<string, any>;
    dateCreated: Date;
    dateUpdated: Date;
    taskQueueEnteredDate: Date;
    sid: string;
    reservationStatus: string;
    reservationSid: string;
    workerName: string;
    workerSid: string;
};

export type WorkerEventType =
    | "worker.created"
    | "worker.activity.update"
    | "worker.attributes.update"
    | "worker.capacity.update"
    | "worker.channel.availability.update"
    | "worker.deleted";

export type TaskEventType =
    | "task.created"
    | "task.updated"
    | "task.canceled"
    | "task.wrapup"
    | "task.completed"
    | "task.deleted"
    | "task.system-deleted"
    | "task.transfer-initiated"
    | "task.transfer-attempt-failed"
    | "task.transfer-failed"
    | "task.transfer-canceled"
    | "task.transfer-completed"
    | "reservation.accepted";

export enum Direction {
    Inbound = "inbound",
    Outbound = "outbound",
}

export type ReservationStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "timeout"
    | "canceled"
    | "rescinded"
    | "wrapping"
    | "completed";
