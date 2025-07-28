import { createServerFileRoute } from "@tanstack/react-start/server";
import { createClient } from "@/lib/supabase/server";
import { json } from "@tanstack/react-start";

export const ServerRoute = createServerFileRoute("/api/conversations").methods({
	GET: async ({ request, params }) => {
		const headers = new Headers();
		headers.append(
			"apikey",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZmt4aHF6c2JxZ3lkc3N2ZnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MjM1MDUsImV4cCI6MjAyMDQ5OTUwNX0.Tikmsl2leC8S9T0xqA5wfnnRbu2NqKo0xdVSlqNbifs",
		);
		headers.append("Accept-Profile", "reporting");

		const response = await fetch(
			"https://qqfkxhqzsbqgydssvfss.supabase.co/rest/v1/conversations?select=*&order=date.desc&limit=1000",
			{ headers },
		);

		const conversations = (await response.json()) as Conversation[];

		const supabase = createClient();

		const engagementInsert: EngagementInsert[] = conversations.map(
			(conversation) => ({
				id: conversation.id,
				channel: conversation.communication_channel ?? undefined,
				created_at: conversation.date,
				is_inbound: conversation.direction === "inbound",
				is_canceled:
					conversation.abandoned === "Yes" &&
					conversation.abandoned_phase === "Queue",
				is_voicemail:
					conversation.abandoned === "Follow-Up" &&
					conversation.abandoned_phase === "Voicemail",
				workspace_sid: "WSbab28e824e653470a49ed743e54d10c0",
				attributes: conversation,
				company: conversation.company_id
					? { id: conversation.company_id }
					: undefined,
				contact: conversation.contact_id
					? { id: conversation.contact_id }
					: undefined,
			}),
		);

		const { data, error } = await supabase
			.schema("reporting")
			.from("engagements")
			.insert(engagementInsert);

		return json({ data, error });
		// return json({ message: 'Hello "/api/conversations"!' });
	},
});
