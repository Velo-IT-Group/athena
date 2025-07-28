import { createServerFileRoute } from "@tanstack/react-start/server";
import { createClient } from "@/lib/supabase/server";
import { json } from "@tanstack/react-start";

import { z } from "zod";

const eventStreamSchema = z.object({
	type: z.string(),
	id: z.string(),
	time: z.date(),
	data: z.object({
		name: z.string(),
		timestamp: z.date(),
		publisher_metadata: z.string(),
		product_name: z.string(),
		publisher: z.string(),
		account_sid: z.string(),
		level: z.string(),
		payload: z.object({
			worker_available: z.boolean(),
			event_description: z.string(),
			task_channel_unique_name: z.string(),
			task_priority: z.number(),
			workspace_sid: z.string(),
			task_canceled_reason: z.string(),
			workflow_sid: z.string(),
			task_assignment_status: z.string(),
			task_add_on_attributes: z.string(),
			task_queue_target_expression: z.string(),
			eventtype: z.string(),
			worker_version: z.number(),
			task_channel_sid: z.string(),
			task_virtual_start_time: z.string(),
			timestamp: z.string(),
			task_queue_sid: z.string(),
			worker_name: z.string(),
			resource_type: z.string(),
			reservation_timeout: z.number(),
			worker_channel_capacity: z.number(),
			workflow_name: z.string(),
			task_queue_name: z.string(),
			task_version: z.number(),
			reservation_sid: z.string(),
			worker_activity_sid: z.string(),
			workspace_name: z.string(),
			task_age: z.number(),
			operating_unit_sid: z.string(),
			resource_sid: z.string(),
			account_sid: z.string(),
			task_timeout: z.number(),
			task_attributes: z.string(),
			reservation_version: z.number(),
			worker_channel_consumed_capacity: z.number(),
			task_date_created: z.string(),
			reservation_reason_code: z.number(),
			task_sid: z.string(),
			worker_sid: z.string(),
			sid: z.string(),
			worker_attributes: z.string(),
			task_age_in_queue: z.number(),
			worker_activity_name: z.string(),
			reservation_status: z.string(),
			task_queue_entered_date: z.string(),
		}),
		payload_type: z.string(),
		group: z.string(),
		sid: z.string(),
	}),
});

type EventStream = z.infer<typeof eventStreamSchema>;

export const ServerRoute = createServerFileRoute(
	"/api/taskrouter/log-event",
).methods({
	POST: async ({ request }) => {
		const supabase = createClient();

		const response = (await request.json()) as EventStream[];

		await Promise.all(
			response.map((event) =>
				supabase.from("taskrouter_events").insert({
					event_type: event.data.payload.eventtype,
					reservation_sid: event.data.payload.reservation_sid,
					payload: {
						...event.data.payload,
						task_attributes: JSON.parse(event.data.payload.task_attributes),
						worker_attributes: JSON.parse(event.data.payload.worker_attributes),
					},
					task_sid: event.data.payload.task_sid,
					worker_sid: event.data.payload.worker_sid,
				}),
			),
		);

		return json({ status: 200 });
	},
});
