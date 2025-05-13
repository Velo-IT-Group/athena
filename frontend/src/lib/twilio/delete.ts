import { createClient } from "@/utils/twilio";
import { createServerFn } from "@tanstack/react-start";

export const deleteParticipant = createServerFn().validator((
	{ sid, participantSid }: { sid: string; participantSid: string },
) => ({ sid, participantSid })).handler(
	async ({ data: { sid, participantSid } }) => {
		const client = await createClient();
		return await client.conferences(sid).participants(participantSid)
			.remove();
	},
);
