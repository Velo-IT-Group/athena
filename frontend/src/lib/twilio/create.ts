import { createClient } from "@/utils/twilio";
import { createServerFn } from "@tanstack/react-start";
import type { ParticipantListInstanceCreateOptions } from "twilio/lib/rest/api/v2010/account/conference/participant";

export const createParticipant = createServerFn()
	.validator((
		{ sid, options }: {
			sid: string;
			options: ParticipantListInstanceCreateOptions;
		},
	) => ({ sid, options }))
	.handler(async ({ data: { sid, options } }) => {
		try {
			const client = await createClient();

			const participant = await client.conferences(sid).participants
				.create(options);

			return participant.toJSON();
		} catch (error) {
			console.error(error);
		}
	});

// export const createWorker = async (
// 	friendlyName: string,
// 	attributes: Record<string, any>,
// ) => {
// 	const client = await createClient();

// 	console.log(friendlyName, attributes);

// 	try {
// 		const worker = await client.taskrouter.v1.workspaces(
// 			env.VITE_TWILIO_WORKSPACE_SID,
// 		).workers.create({
// 			friendlyName,
// 			attributes: JSON.stringify(attributes),
// 		});

// 		return worker;
// 	} catch (error) {}
// };
