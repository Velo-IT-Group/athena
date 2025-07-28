import { createClient } from "@/utils/twilio";
import { createClient as supabaseClient } from "@/lib/supabase/server";
import { createServerFileRoute } from "@tanstack/react-start/server";
import z from "zod";

export const createBlackListedPhoneNumberSchema = z.object({
	number: z.string(),
	organization: z.string().default("1c80bfac-b59f-420b-8b0e-a330aa377edd"),
});

export const ServerRoute = createServerFileRoute(
	"/rest/v1/taskrouter/blacklisted-phone-number/",
).methods({
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
		const { phoneNumber } = await client.lookups.v2.phoneNumbers(from).fetch();

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
	POST: async ({ request }) => {
		const body = await request.json();
		const { number, organization } =
			createBlackListedPhoneNumberSchema.parse(body);

		const client = await createClient();
		const { phoneNumber } = await client.lookups.v2
			.phoneNumbers(number)
			.fetch();

		const supabase = supabaseClient();
		const { error } = await supabase
			.schema("taskrouter")
			.from("blacklisted_phone_numbers")
			.insert({
				organization_id: organization,
				number: phoneNumber,
			});

		if (error) {
			return Response.json({ error: error.message }, { status: 500 });
		}

		return Response.json({ status: "success" }, { status: 200 });
	},
});
