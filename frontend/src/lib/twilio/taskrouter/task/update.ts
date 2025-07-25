import { env } from "@/lib/utils";
import { createClient } from "@/utils/twilio";
import { createServerFn } from "@tanstack/react-start";
import type { TaskContextUpdateOptions } from "twilio/lib/rest/taskrouter/v1/workspace/task";

export const updateTask = createServerFn().validator((
    { sid, params }: { sid: string; params: TaskContextUpdateOptions },
) => ({ sid, params })).handler(async ({ data: { sid, params } }) => {
    const client = await createClient();

    const updatedTask = await client.taskrouter.v1.workspaces(
        env.VITE_TWILIO_WORKSPACE_SID,
    ).tasks(sid).update(params);

    return updatedTask.toJSON();
});
