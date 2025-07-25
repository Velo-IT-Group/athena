import { createServerFileRoute } from "@tanstack/react-start/server";
import { createClient } from "@/utils/twilio";
import { createClient as supabaseClient } from "@/lib/supabase/server";

export const ServerRoute = createServerFileRoute(
	"/rest/v1/system/is-number-blacklisted",
)
	.methods({
		GET: async ({ request }) => {
			const searchParams = new URL(request.url).searchParams;
			const from = searchParams.get("from");

			if (!from) {
				return Response.json(
					{
						error: "No phone number found",
					},
					{ status: 400, statusText: "No phone number found" },
				);
			}

			const client = await createClient();
			const { phoneNumber } = await client.lookups.v2.phoneNumbers(from)
				.fetch();

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
