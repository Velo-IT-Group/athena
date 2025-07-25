import { env } from "@/lib/utils";
import type { EventResponse } from "@/types/twilio";
import { createClient } from "@/utils/twilio";
import { createServerFn } from "@tanstack/react-start";
import { startOfDay } from "date-fns";
import type {
	WorkerInstance,
	WorkerListInstanceOptions,
} from "twilio/lib/rest/taskrouter/v1/workspace/worker";
import type {
	WorkerStatisticsContextFetchOptions,
	WorkerStatisticsInstance,
} from "twilio/lib/rest/taskrouter/v1/workspace/worker/workerStatistics";

const headers = new Headers();
const credentials = env.VITE_TWILIO_ACCOUNT_SID + ":" +
	env.VITE_TWILIO_AUTH_TOKEN;
headers.set("Authorization", "Basic " + btoa(credentials));

export const getWorkerStats = createServerFn().validator(
	(
		{ workerSid, params }: {
			workerSid: string;
			params: WorkerStatisticsContextFetchOptions;
		},
	) => ({
		workerSid,
		params,
	}),
).handler(async ({ data: { workerSid, params } }) => {
	const client = await createClient();
	const stats = await client.taskrouter.v1
		.workspaces(env.VITE_TWILIO_WORKSPACE_SID)
		.workers(workerSid)
		.statistics()
		.fetch(params);

	return stats.toJSON();
});

export const getAllEventTasks = createServerFn()
	.validator((
		{ startDate, endDate }: { startDate?: Date; endDate?: Date },
	) => ({ startDate, endDate }))
	.handler(async ({ data }) => {
		const { startDate, endDate } = data;

		const startTime = startDate || startOfDay(new Date()) || new Date();

		if (endDate && startTime.getTime() > endDate?.getTime()) {
			return { data: [], count: 0 };
		}

		const completedTaskParams = new URLSearchParams();
		completedTaskParams.set("EventType", "task.completed");
		completedTaskParams.set("PageSize", "1000");
		completedTaskParams.set("StartDate", startTime.toISOString());

		if (endDate) {
			completedTaskParams.set("EndDate", endDate.toISOString());
		}

		const canceledTaskParams = new URLSearchParams(completedTaskParams);
		canceledTaskParams.set("EventType", "task.canceled");

		const reservationTimeoutParams = new URLSearchParams(
			completedTaskParams,
		);
		reservationTimeoutParams.set("EventType", "reservation.timeout");

		const reservationCompletedParams = new URLSearchParams(
			completedTaskParams,
		);
		reservationCompletedParams.set("EventType", "reservation.completed");

		const [
			completedResponse,
			canceledResponse,
			timeoutResponse,
			completedReservationResponse,
		] = await Promise.all([
			fetch(
				`https://taskrouter.twilio.com/v1/Workspaces/${env.VITE_TWILIO_WORKSPACE_SID}/Events?${completedTaskParams.toString()}`,
				{
					headers,
				},
			),
			fetch(
				`https://taskrouter.twilio.com/v1/Workspaces/${env.VITE_TWILIO_WORKSPACE_SID}/Events?${canceledTaskParams.toString()}`,
				{
					headers,
				},
			),
			fetch(
				`https://taskrouter.twilio.com/v1/Workspaces/${env.VITE_TWILIO_WORKSPACE_SID}/Events?${reservationTimeoutParams.toString()}`,
				{
					headers,
				},
			),
			fetch(
				`https://taskrouter.twilio.com/v1/Workspaces/${env.VITE_TWILIO_WORKSPACE_SID}/Events?${reservationCompletedParams.toString()}`,
				{
					headers,
				},
			),
		]);

		const [
			completedEvents,
			canceledEvents,
			timeoutEvents,
			completedReservationEvents,
		] = await Promise.all<EventResponse>([
			completedResponse.json(),
			canceledResponse.json(),
			timeoutResponse.json(),
			completedReservationResponse.json(),
		]);

		const allReservations = [
			...timeoutEvents.events,
			...completedReservationEvents.events,
		];

		const allHistory = [...completedEvents.events, ...canceledEvents.events]
			.map((e) => {
				return {
					...e,
					reservation: allReservations.filter((r) =>
						r.event_data.task_sid === e.event_data.task_sid
					),
				};
			});

		return {
			data: allHistory,
			count: allHistory.length,
		};
	});

export const getWorkers = createServerFn()
	.validator((options: WorkerListInstanceOptions = {}) => options)
	.handler(async ({ data }) => {
		const client = await createClient();
		const workers = await client.taskrouter.v1.workspaces(
			env.VITE_TWILIO_WORKSPACE_SID,
		).workers.list(data);

		return workers.map((w) => w.toJSON());
	});
