import { env } from "@/lib/utils";
import { createClient } from "@/utils/twilio";
import { createServerFn } from "@tanstack/react-start";
import type { ParticipantListInstanceCreateOptions } from "twilio/lib/rest/api/v2010/account/conference/participant";
import z from "zod";

export const createParticipant = createServerFn()
	.validator(
		({
			sid,
			options,
		}: {
			sid: string;
			options: ParticipantListInstanceCreateOptions;
		}) => ({ sid, options }),
	)
	.handler(async ({ data: { sid, options } }) => {
		try {
			const client = await createClient();

			const participant = await client
				.conferences(sid)
				.participants.create(options);

			return participant.toJSON();
		} catch (error) {
			console.error(error);
		}
	});

export const createWorker = createServerFn()
	.validator(
		z.object({
			friendlyName: z.string(),
			attributes: z.record(z.string(), z.any()),
		}),
	)
	.handler(async ({ data: { friendlyName, attributes } }) => {
		const client = await createClient();

		const worker = await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID)
			.workers.create({
				friendlyName,
				attributes: JSON.stringify(attributes),
			});

		return worker.toJSON();
	});
