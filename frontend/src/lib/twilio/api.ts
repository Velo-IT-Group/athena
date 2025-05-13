import { queryOptions } from "@tanstack/react-query";
import { getActivities } from "./taskrouter/worker/helpers";
import type {
    ActivityInstance,
    ActivityListInstanceOptions,
} from "twilio/lib/rest/taskrouter/v1/workspace/activity";
import {
    getAllEventTasks,
    getWorkerStats,
} from "@/lib/twilio/taskrouter/helpers";
import {
    getConferenceParticipants,
    getWorker,
    getWorkers,
} from "@/lib/twilio/read";
import type { ParticipantInstance } from "twilio/lib/rest/api/v2010/account/conference/participant";
import { createAccessToken } from "@/lib/twilio";
import {
    type WorkerInstance,
    type WorkerListInstanceOptions,
} from "twilio/lib/rest/taskrouter/v1/workspace/worker";
import { SyncClient } from "twilio-sync";
import type {
    WorkerStatisticsContextFetchOptions,
    WorkerStatisticsInstance,
} from "twilio/lib/rest/taskrouter/v1/workspace/worker/workerStatistics";

export const getActivitiesQuery = (
    options?: ActivityListInstanceOptions,
) => queryOptions({
    queryKey: ["activities", options],
    queryFn: () =>
        getActivities({ data: options }) as Promise<ActivityInstance[]>,
    staleTime: Infinity,
});

export const getEventsQuery = (
    startDate?: Date,
    endDate?: Date,
) => queryOptions({
    queryKey: ["events", startDate, endDate],
    queryFn: () => getAllEventTasks({ data: { startDate, endDate } }),
    staleTime: Infinity,
});

export const getConferenceParticipantsQuery = (
    sid: string,
) => queryOptions({
    queryKey: ["conferences", sid, "participants"],
    queryFn: () =>
        getConferenceParticipants({ data: sid }) as Promise<
            ParticipantInstance[]
        >,
});

export const getAccessTokenQuery = ({
    identity,
    workerSid,
}: {
    identity: string;
    workerSid: string;
}) =>
    queryOptions({
        queryKey: ["access-token"],
        queryFn: () =>
            createAccessToken({
                data: {
                    identity,
                    workerSid,
                },
            }),
        staleTime: () => 1000 * 60 * 60 * 24,
    });

export const getWorkersQuery = (options?: WorkerListInstanceOptions) =>
    queryOptions({
        queryKey: ["workers", options],
        queryFn: () =>
            getWorkers({
                data: options,
            }) as Promise<WorkerInstance[]>,
    });

export const getWorkerQuery = (sid: string) =>
    queryOptions({
        queryKey: ["workers", sid],
        queryFn: () => getWorker({ data: sid }) as Promise<WorkerInstance>,
        staleTime: Infinity,
    });

export const getWorkerStatsQuery = (
    workerSid: string,
    params: WorkerStatisticsContextFetchOptions = {},
) => queryOptions({
    queryKey: ["workers", workerSid, "stats"],
    queryFn: () =>
        getWorkerStats({ data: { workerSid, params } }) as Promise<
            WorkerStatisticsInstance
        >,
    staleTime: Infinity,
});

export const getSyncMapQuery = (
    { mapKey, token }: { mapKey: string; token: string },
) => {
    const syncMapClient = new SyncClient(token);

    return queryOptions({
        queryKey: ["syncMapClient", mapKey, token],
        queryFn: async () => {
            const map = await syncMapClient.map(mapKey);
            const { items } = await map.getItems();
            return { map, items };
        },
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: "always",
        refetchOnMount: "always",
        refetchOnReconnect: "always",
        enabled: !!token && !!mapKey,
    });
};
