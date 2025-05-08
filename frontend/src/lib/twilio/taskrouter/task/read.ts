import { env } from "@/lib/utils";
import { createClient } from "@/utils/twilio";
import { createServerFn } from "@tanstack/react-start";

export const getTask = createServerFn().validator((
    { sid }: { sid: string },
) => ({ sid })).handler(
    async ({ data: { sid } }) => {
        const client = await createClient();
        const task = await client.taskrouter.v1.workspaces(
            env.VITE_TWILIO_WORKSPACE_SID,
        ).tasks(sid).fetch();
        return task;
    },
);
