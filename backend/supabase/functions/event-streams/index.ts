// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "npm:@supabase/supabase-js";

Deno.serve(async (req) => {
	const supabase = createClient(
		Deno.env.get("SUPABASE_URL")!,
		Deno.env.get("SUPABASE_ANON_KEY")!,
		{
			db: {
				schema: "reporting",
			},
		},
	);

	const response = await req.json();

	response.forEach(({ type, data }: { type: string; data: any }) => {
		const payload: TaskRouterPayload = data.payload;

		console.log(payload, type);

		if (type.includes("reservation.")) {
			supabase
				.from("engagement_reservations")
				.upsert({
					enagement_id: payload.task_sid,
					id: payload.reservation_sid,
					reservation_status: payload.reservation_status,
					worker_sid: payload.worker_sid,
				}).then(({ error }) => {
					if (error) {
						throw new Error(error.message);
					}
				});
		}

		if (type.includes("task.")) {
			const attributes = JSON.parse(payload.task_attributes);
			supabase
				.from("engagements")
				.upsert({
					id: payload.task_sid,
					is_inbound: attributes.direction === "inbound",
					is_canceled: payload?.task_canceled_reason?.length ?? 0 > 0,
					is_voicemail:
						attributes.conversations?.abandoned_phase ===
							"Voicemail",
					attributes,
					channel: payload.task_channel_unique_name,
					company: attributes?.companyId
						? {
							id: attributes?.companyId,
						}
						: undefined,
					contact: attributes?.userId
						? {
							id: attributes?.userId,
						}
						: undefined,
				}).then(({ error }) => {
					if (error) {
						throw new Error(error.message);
					}
				});
		}
	});

	return new Response(
		JSON.stringify({ status: 200 }),
		{ headers: { "Content-Type": "application/json" } },
	);
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/event-streams' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

export interface Root {
	name: string;
	timestamp: string;
	publisher_metadata: string;
	product_name: string;
	publisher: string;
	account_sid: string;
	level: string;
	payload: TaskRouterPayload;
	payload_type: string;
	group: string;
	sid: string;
}

export interface TaskRouterPayload {
	worker_available: boolean;
	event_description: string;
	task_channel_unique_name: string;
	task_priority: number;
	workspace_sid: string;
	workflow_sid: string;
	task_assignment_status: string;
	task_add_on_attributes: string;
	task_queue_target_expression: string;
	eventtype: string;
	worker_version: number;
	task_channel_sid: string;
	task_virtual_start_time: string;
	timestamp: string;
	task_queue_sid: string;
	worker_name: string;
	resource_type: string;
	reservation_timeout: number;
	worker_channel_capacity: number;
	workflow_name: string;
	task_queue_name: string;
	task_version: number;
	reservation_sid: string;
	worker_activity_sid: string;
	workspace_name: string;
	task_age: number;
	operating_unit_sid: string;
	resource_sid: string;
	account_sid: string;
	task_timeout: number;
	task_attributes: string;
	reservation_version: number;
	worker_channel_consumed_capacity: number;
	task_date_created: string;
	task_sid: string;
	worker_sid: string;
	sid: string;
	worker_attributes: string;
	task_age_in_queue: number;
	worker_activity_name: string;
	reservation_status: string;
	task_queue_entered_date: string;
	task_canceled_reason?: string;
}
