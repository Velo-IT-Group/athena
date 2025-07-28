import { createClient } from "@/utils/twilio";
import { type WorkerListInstanceOptions } from "twilio/lib/rest/taskrouter/v1/workspace/worker";
import { env } from "@/lib/utils";
import { createServerFn } from "@tanstack/react-start";
import type { TaskListInstanceOptions } from "twilio/lib/rest/taskrouter/v1/workspace/task";
import type { ReservationListInstanceOptions } from "twilio/lib/rest/taskrouter/v1/workspace/task/reservation";
import type { IncomingPhoneNumberListInstanceOptions } from "twilio/lib/rest/api/v2010/account/incomingPhoneNumber";
import type { WorkerStatisticsContextFetchOptions } from "twilio/lib/rest/taskrouter/v1/workspace/worker/workerStatistics";
import type { WorkerStatisticsInstance } from "twilio/lib/rest/taskrouter/v1/workspace/worker/workerStatistics";
import type { MessageListInstanceOptions } from "twilio/lib/rest/api/v2010/account/message";
import { z } from "zod";
import { ParticipantConversationListInstanceOptions } from "twilio/lib/rest/conversations/v1/participantConversation";
import { TaskQueueListInstanceOptions } from "twilio/lib/rest/taskrouter/v1/workspace/taskQueue";

export const getConversations = createServerFn()
	.validator((params: ParticipantConversationListInstanceOptions) => params)
	.handler(async ({ data }) => {
		const client = await createClient();

		const conversations =
			await client.conversations.v1.participantConversations.list(data);

		return conversations.map((c) => c.toJSON());
	});

export const lookupPhoneNumber = createServerFn()
	.validator(z.string())
	.handler(async ({ data }) => {
		const client = await createClient();
		return (await client.lookups.v2.phoneNumbers(data).fetch()).toJSON();
	});

export const getMessages = createServerFn()
	.validator((options: MessageListInstanceOptions = { limit: 20 }) => options)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (await client.messages.list(data)).map((w) => w.toJSON());
	});

export const getPhoneNumbers = createServerFn()
	.validator(
		(options: IncomingPhoneNumberListInstanceOptions = { beta: false }) =>
			options,
	)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (await client.incomingPhoneNumbers.list(data)).map((w) =>
			w.toJSON(),
		);
	});

export const getTaskReservations = createServerFn()
	.validator(
		({
			taskSid,
			options,
		}: {
			taskSid: string;
			options?: ReservationListInstanceOptions;
		}) => ({ taskSid, options }),
	)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (
			await client.taskrouter.v1
				.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
				.tasks(data.taskSid)
				.reservations.list(data.options ?? {})
		).map((w) => w.toJSON());
	});

export const getTaskReservation = createServerFn()
	.validator(
		({
			taskSid,
			reservationSid,
		}: {
			taskSid: string;
			reservationSid: string;
		}) => ({ taskSid, reservationSid }),
	)
	.handler(async ({ data }) => {
		const client = await createClient();

		const [task, reservation] = await Promise.all([
			getTask({ data: data.taskSid }),
			client.taskrouter.v1
				.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
				.tasks(data.taskSid)
				.reservations(data.reservationSid)
				.fetch(),
		]);

		return { ...reservation.toJSON(), task };
	});

export const getWorkerReservations = createServerFn()
	.validator(
		({
			workerSid,
			options,
		}: {
			workerSid: string;
			options?: ReservationListInstanceOptions;
		}) => ({ workerSid, options }),
	)
	.handler(async ({ data }) => {
		const client = await createClient();

		const [tasks, reservations] = await Promise.all([
			getTasks({
				data: {
					evaluateTaskAttributes: "worker_sid = " + data.workerSid,
				},
			}),
			client.taskrouter.v1
				.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
				.workers(data.workerSid)
				.reservations.list(data.options ?? {}),
		]);

		return reservations.map((w) => ({
			...w.toJSON(),
			task: tasks.find((t) => t.sid === w.taskSid),
		}));
	});

export const getTranscript = createServerFn()
	.validator(z.string())
	.handler(async ({ data: sid }) => {
		const client = await createClient();

		const t = await client.intelligence.v2.transcripts(sid).fetch();

		return t.toJSON();
	});

export const getTranscriptOperatorResults = createServerFn()
	.validator((params: { transcriptSid: string }) => params)
	.handler(async ({ data }) => {
		const client = await createClient();

		const operatorResults = await client.intelligence.v2
			.transcripts(data.transcriptSid)
			.operatorResults.list({ limit: 1000 });

		return operatorResults.map((s) => s.toJSON());
	});

export const getTranscriptSentences = createServerFn()
	.validator((params: { transcriptSid: string }) => params)
	.handler(async ({ data }) => {
		const client = await createClient();

		const sentences = await client.intelligence.v2
			.transcripts(data.transcriptSid)
			.sentences.list({ limit: 1000, wordTimestamps: true });

		return sentences.map((s) => s.toJSON());
	});

export const getRecording = createServerFn()
	.validator(z.string())
	.handler(async ({ data: sid }) => {
		const client = await createClient();

		const recording = await client.recordings(sid).fetch();

		return recording.toJSON();
	});

export const getWorkerReservation = createServerFn()
	.validator(
		({
			workerSid,
			reservationSid,
		}: {
			workerSid: string;
			reservationSid: string;
		}) => ({ workerSid, reservationSid }),
	)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (
			await client.taskrouter.v1
				.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
				.workers(data.workerSid)
				.reservations(data.reservationSid)
				.fetch()
		).toJSON();
	});

export const getTasks = createServerFn()
	.validator((options: TaskListInstanceOptions = {}) => options)
	.handler(async ({ data }) => {
		const client = await createClient();
		const tasks = await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
			.tasks.list(data);

		return tasks.map((w) => w.toJSON());
	});

export const getTask = createServerFn()
	.validator((sid: string) => sid)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (
			await client.taskrouter.v1
				.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
				.tasks(data)
				.fetch()
		).toJSON();
	});

export const getWorkers = createServerFn()
	.validator((options: WorkerListInstanceOptions = {}) => options)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (
			await client.taskrouter.v1
				.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
				.workers.list(data)
		).map((w) => w.toJSON());
	});

export const getWorkerStats = createServerFn()
	.validator(
		(params: {
			workerSid: string;
			params: WorkerStatisticsContextFetchOptions;
		}) => params,
	)
	.handler(async ({ data }) => {
		const client = await createClient();
		const stats = await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
			.workers(data.workerSid)
			.statistics()
			.fetch(data.params);

		return stats.toJSON();
	});

export const getWorker = createServerFn()
	.validator((sid: string) => sid)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (
			await client.taskrouter.v1
				.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
				.workers(data)
				.fetch()
		).toJSON();
	});

export const getConference = createServerFn()
	.validator((sid: string) => sid)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (await client.conferences(data).fetch()).toJSON();
	});

export const getConferenceParticipants = createServerFn()
	.validator((sid: string) => sid)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (await client.conferences(data).participants.list()).map((p) =>
			p.toJSON(),
		);
	});

export const getWorkspace = createServerFn()
	.validator((sid: string) => sid)
	.handler(async ({ data }) => {
		const client = await createClient();
		const taskrouter = await client.taskrouter.v1.workspaces(data).fetch();
		return taskrouter.toJSON();
	});

export const getWorkspaceCumulativeStatistics = createServerFn()
	.validator((sid: string) => sid)
	.handler(async ({ data }) => {
		const client = await createClient();
		const taskrouter = await client.taskrouter.v1
			.workspaces(data)
			.cumulativeStatistics()
			.fetch();
		return taskrouter.toJSON();
	});

export const getTaskQueues = createServerFn()
	.validator((options?: TaskQueueListInstanceOptions) => options)
	.handler(async ({ data }) => {
		const client = await createClient();
		const taskrouter = await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID)
			.taskQueues.list(data ?? {});

		return taskrouter.map((t) => t.toJSON());
	});

export const getChannels = createServerFn().handler(async ({ data }) => {
	const client = await createClient();
	const taskrouter = await client.taskrouter.v1
		.workspaces(env.VITE_TWILIO_WORKSPACE_SID)
		.taskChannels.list();

	return taskrouter.map((t) => t.toJSON());
});
