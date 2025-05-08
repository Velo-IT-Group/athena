type ActivityEventType =
    | "activity.created"
    | "activity.updated"
    | "activity.deleted";
type ReservationEventType =
    | "reservation.created"
    | "reservation.accepted"
    | "reservation.rejected"
    | "reservation.timeout"
    | "reservation.canceled"
    | "reservation.rescinded"
    | "reservation.completed"
    | "reservation.failed"
    | "reservation.wrapup";
type TaskEventType =
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
    | "task.transfer-completed";
type TaskChannelEventType =
    | "task-channel.created"
    | "task-channel.updated"
    | "task-channel.deleted";
type TaskQueueEventType =
    | "task-queue.created"
    | "task-queue.deleted"
    | "task-queue.entered"
    | "task-queue.timeout"
    | "task-queue.moved"
    | "task-queue.expression.updated";
type WorkerEventType =
    | "worker.created"
    | "worker.activity.update"
    | "worker.attributes.update"
    | "worker.capacity.update"
    | "worker.channel.availability.update"
    | "worker.deleted";
type WorkflowEventType =
    | "workflow.created"
    | "workflow.updated"
    | "workflow.deleted"
    | "workflow.target-matched"
    | "workflow.entered"
    | "workflow.timeout"
    | "workflow.skipped";
type WorkspaceEventType =
    | "workspace.created"
    | "workspace.updated"
    | "workspace.deleted";

type TaskRouterEventType =
    | ActivityEventType
    | ReservationEventType
    | TaskEventType
    | TaskChannelEventType
    | TaskQueueEventType
    | WorkerEventType
    | WorkflowEventType
    | WorkspaceEventType;
