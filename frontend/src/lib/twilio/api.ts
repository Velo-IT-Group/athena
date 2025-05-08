import type {
    DefinedInitialDataOptions,
    UndefinedInitialDataOptions,
    UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import { getActivities } from "./taskrouter/worker/helpers";
import type {
    ActivityInstance,
    ActivityListInstanceOptions,
} from "twilio/lib/rest/taskrouter/v1/workspace/activity";
import { getAllEventTasks } from "@/lib/twilio/taskrouter/helpers";

export const getActivitiesQuery = (
    options?: ActivityListInstanceOptions,
): UseSuspenseQueryOptions<ActivityInstance[]> => ({
    queryKey: ["activities", options],
    queryFn: () =>
        getActivities({ data: options }) as Promise<ActivityInstance[]>,
    staleTime: Infinity,
});

export const getEventsQuery = (
    startDate?: Date,
    endDate?: Date,
): UseSuspenseQueryOptions<{ data: ActivityInstance[]; count: number }> => ({
    queryKey: ["events", startDate, endDate],
    queryFn: () => getAllEventTasks({ data: { startDate, endDate } }),
});
