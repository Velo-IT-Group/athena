import { queryOptions } from '@tanstack/react-query';
import { getActivities } from './taskrouter/worker/helpers';
import type {
	ActivityInstance,
	ActivityListInstanceOptions,
} from 'twilio/lib/rest/taskrouter/v1/workspace/activity';
import {
	getAllEventTasks,
	getWorkerStats,
} from '@/lib/twilio/taskrouter/helpers';
import {
	getChannels,
	getConferenceParticipants,
	getMessages,
	getTask,
	getTaskQueues,
	getTaskReservation,
	getTaskReservations,
	getTasks,
	getTranscriptSentences,
	getWorker,
	getWorkerReservation,
	getWorkerReservations,
	getWorkers,
	getWorkspace,
	getWorkspaceCumulativeStatistics,
} from '@/lib/twilio/read';
import type { ParticipantInstance } from 'twilio/lib/rest/api/v2010/account/conference/participant';
import { createAccessToken } from '@/lib/twilio';
import {
	type WorkerInstance,
	type WorkerListInstanceOptions,
} from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import { SyncClient } from 'twilio-sync';
import type {
	WorkerStatisticsContextFetchOptions,
	WorkerStatisticsInstance,
} from 'twilio/lib/rest/taskrouter/v1/workspace/worker/workerStatistics';
import type {
	TaskInstance,
	TaskListInstanceOptions,
} from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import type {
	ReservationInstance,
	ReservationListInstanceOptions,
} from 'twilio/lib/rest/taskrouter/v1/workspace/task/reservation';
import type {
	MessageInstance,
	MessageListInstanceOptions,
} from 'twilio/lib/rest/api/v2010/account/message';
import { getWorkflow, getWorkflows } from '@/lib/twilio/taskrouter/task/read';
import { WorkflowListInstanceOptions } from 'twilio/lib/rest/taskrouter/v1/workspace/workflow';
import { WorkspaceInstance } from 'twilio/lib/rest/taskrouter/v1/workspace';
import { TaskQueueListInstanceOptions } from 'twilio/lib/rest/taskrouter/v1/workspace/taskQueue';
import { DAY_IN_MS } from '@/components/template-catalog';

export const getActivitiesQuery = (options?: ActivityListInstanceOptions) =>
	queryOptions({
		queryKey: ['activities', options],
		queryFn: () =>
			getActivities({ data: options }) as Promise<ActivityInstance[]>,
		staleTime: Infinity,
	});

export const getTasksQuery = (options?: TaskListInstanceOptions) =>
	queryOptions({
		queryKey: ['tasks', options],
		queryFn: () => getTasks({ data: options }) as Promise<TaskInstance[]>,
		staleTime: Infinity,
	});

export const getTaskQuery = (sid: string) =>
	queryOptions({
		queryKey: ['tasks', sid],
		queryFn: () => getTask({ data: sid }),
		staleTime: Infinity,
	});

export const getTranscriptSentencesQuery = (transcriptSid: string) =>
	queryOptions({
		queryKey: ['transcripts', transcriptSid, 'sentences'],
		queryFn: () =>
			getTranscriptSentences({
				data: { transcriptSid },
			}),
		staleTime: Infinity,
	});

export const getTaskReservationQuery = (
	taskSid: string,
	reservationSid: string
) =>
	queryOptions({
		queryKey: ['reservations', reservationSid],
		queryFn: () =>
			getTaskReservation({
				data: { taskSid, reservationSid },
			}),
		staleTime: Infinity,
	});

export const getTaskReservationsQuery = (
	taskSid: string,
	options?: ReservationListInstanceOptions
) =>
	queryOptions({
		queryKey: ['reservations', taskSid, options],
		queryFn: () =>
			getTaskReservations({
				data: { taskSid, options },
			}),
		staleTime: Infinity,
	});

export const getWorkerReservationQuery = (
	workerSid: string,
	reservationSid: string
) =>
	queryOptions({
		queryKey: ['reservations', workerSid, reservationSid],
		queryFn: async () => {
			return (await getWorkerReservation({
				data: { workerSid, reservationSid },
			})) as ReservationInstance;
		},
		staleTime: Infinity,
	});

export const getWorkerReservationsQuery = (
	workerSid: string,
	options?: ReservationListInstanceOptions
) =>
	queryOptions({
		queryKey: ['reservations', workerSid, options],
		queryFn: () => getWorkerReservations({ data: { workerSid, options } }),
		staleTime: Infinity,
	});

export const getEventsQuery = (startDate?: Date, endDate?: Date) =>
	queryOptions({
		queryKey: ['events', startDate, endDate],
		queryFn: () => getAllEventTasks({ data: { startDate, endDate } }),
		staleTime: Infinity,
	});

export const getConferenceParticipantsQuery = (sid: string) =>
	queryOptions({
		queryKey: ['conferences', sid, 'participants'],
		queryFn: () =>
			getConferenceParticipants({ data: sid }) as Promise<
				ParticipantInstance[]
			>,
		enabled: !!sid,
	});

export const getAccessTokenQuery = ({
	identity,
	workerSid,
}: {
	identity: string;
	workerSid: string;
}) =>
	queryOptions({
		queryKey: ['access-token'],
		queryFn: () =>
			createAccessToken({
				data: {
					identity,
					workerSid,
				},
			}),
		// staleTime: () => DAY_IN_MS / 24, // 1 hour
	});

export const getWorkersQuery = (options?: WorkerListInstanceOptions) =>
	queryOptions({
		queryKey: ['workers', options],
		queryFn: () =>
			getWorkers({
				data: options,
			}) as Promise<WorkerInstance[]>,
	});

export const getWorkspaceQuery = ({ sid }: { sid: string }) =>
	queryOptions({
		queryKey: ['workspaces', sid],
		queryFn: () =>
			getWorkspace({
				data: sid,
			}),
	});
export const getWorkspaceCumulativeStatisticsQuery = ({
	sid,
}: {
	sid: string;
}) =>
	queryOptions({
		queryKey: ['workspaces', sid, 'cumulativeStatistics'],
		queryFn: () =>
			getWorkspaceCumulativeStatistics({
				data: sid,
			}),
	});

export const getWorkerQuery = (sid: string) =>
	queryOptions({
		queryKey: ['workers', sid],
		queryFn: () => getWorker({ data: sid }) as Promise<WorkerInstance>,
		// staleTime: Infinity,
	});

export const getMessagesQuery = (options?: MessageListInstanceOptions) =>
	queryOptions({
		queryKey: ['messages', options],
		queryFn: () =>
			getMessages({ data: options }) as Promise<MessageInstance[]>,
		// staleTime: Infinity,
	});

export const getWorkflowsQuery = (options?: WorkflowListInstanceOptions) =>
	queryOptions({
		queryKey: ['workflows', options],
		queryFn: () => getWorkflows({ data: options }),
		staleTime: Infinity,
	});

export const getWorkflowQuery = (sid: string) =>
	queryOptions({
		queryKey: ['workflows', sid],
		queryFn: () => getWorkflow({ data: { sid } }),
		staleTime: Infinity,
	});

export const getChannelsQuery = () =>
	queryOptions({
		queryKey: ['channels'],
		queryFn: () => getChannels(),
		staleTime: Infinity,
	});

export const getTaskQueuesQuery = (options?: TaskQueueListInstanceOptions) =>
	queryOptions({
		queryKey: ['taskQueues', options],
		queryFn: () => getTaskQueues({ data: options }),
		staleTime: Infinity,
	});

export const getWorkerStatsQuery = (
	workerSid: string,
	params: WorkerStatisticsContextFetchOptions = {}
) =>
	queryOptions({
		queryKey: ['workers', workerSid, 'stats'],
		queryFn: () =>
			getWorkerStats({
				data: { workerSid, params },
			}) as Promise<WorkerStatisticsInstance>,
		staleTime: Infinity,
	});

export const getSyncMapQuery = ({
	mapKey,
	token,
}: {
	mapKey: string;
	token: string;
}) => {
	const syncMapClient = new SyncClient(token);

	return queryOptions({
		queryKey: ['syncMapClient', mapKey, token],
		queryFn: async () => {
			const map = await syncMapClient.map(mapKey);
			const { items } = await map.getItems();
			return { client: syncMapClient, map, items };
		},
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: 'always',
		refetchOnMount: 'always',
		refetchOnReconnect: 'always',
		enabled: !!token && !!mapKey,
	});
};
