import { createClient } from "@/utils/twilio";
import {
	type WorkerListInstanceOptions,
} from "twilio/lib/rest/taskrouter/v1/workspace/worker";
import { env } from "@/lib/utils";
import { createServerFn } from "@tanstack/react-start";

export const getWorkers = createServerFn()
	.validator((options: WorkerListInstanceOptions = {}) => options)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (await client.taskrouter.v1.workspaces(
			env.VITE_TWILIO_WORKSPACE_SID!,
		).workers.list(data)).map((w) => w.toJSON());
	});

export const getWorker = createServerFn()
	.validator((sid: string) => sid)
	.handler(async ({ data }) => {
		const client = await createClient();
		return (await client.taskrouter.v1.workspaces(
			env.VITE_TWILIO_WORKSPACE_SID!,
		).workers(data).fetch()).toJSON();
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
			p.toJSON()
		);
	});
