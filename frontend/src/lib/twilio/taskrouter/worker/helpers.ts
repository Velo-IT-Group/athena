import { env } from "@/lib/utils";
import { createClient } from "@/utils/twilio";
import { createServerFn } from "@tanstack/react-start";
import type { ActivityListInstanceOptions } from "twilio/lib/rest/taskrouter/v1/workspace/activity";

export const getActivities = createServerFn()
  .validator((options?: ActivityListInstanceOptions) => options ?? {})
  .handler(async ({ data }) => {
    const client = await createClient();

    const activities = await client.taskrouter.v1
      .workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
      .activities.list(data);

    return activities.map((a) => a.toJSON());
  });
