import { createClient } from "@/utils/twilio";
import { createClient as supabaseClient } from "@/lib/supabase/server";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute(
	"/rest/v1/taskrouter/blacklisted-phone-number/$id",
).methods({
	GET: async ({ params }) => {
		const { id } = params;
		if (!id) {
			return Response.json({ error: "No ID provided" }, { status: 400 });
		}

		const client = await createClient();
		const { phoneNumber } = await client.lookups.v2.phoneNumbers(id).fetch();

		const supabase = supabaseClient();
		const { data: phoneNumbers } = await supabase
			.schema("taskrouter")
			.from("blacklisted_phone_numbers")
			.select("*")
			.eq("number", phoneNumber);

		return Response.json(
			{ isBlacklisted: phoneNumbers && phoneNumbers.length > 0 },
			{ status: 200 },
		);
	},
});
