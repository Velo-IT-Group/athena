import { createClient } from "@/utils/twilio";
import type { TaskContextUpdateOptions } from "twilio/lib/rest/taskrouter/v1/workspace/task";
import type { ReservationContextUpdateOptions } from "twilio/lib/rest/taskrouter/v1/workspace/task/reservation";
import type {
	WorkerContextUpdateOptions,
	WorkerInstance,
} from "twilio/lib/rest/taskrouter/v1/workspace/worker";
import { getTask } from "./read";
import { env } from "../utils";
import { createServerFn } from "@tanstack/react-start";
import type { ParticipantContextUpdateOptions } from "twilio/lib/rest/api/v2010/account/conference/participant";

export const updateWorker = createServerFn().validator((
	params: { workerSid: string; options: WorkerContextUpdateOptions },
) => params).handler<WorkerInstance>(
	async ({ data: { workerSid, options } }) => {
		const client = await createClient();
		return (await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
			.workers(workerSid)
			.update(options)).toJSON();
	},
);

export const updateTask = createServerFn()
	.validator((
		{ taskSid, options }: {
			taskSid: string;
			options: TaskContextUpdateOptions;
		},
	) => ({ taskSid, options }))
	.handler(async ({ data: { taskSid, options } }) => {
		const client = await createClient();
		const task = await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
			.tasks(taskSid)
			.update(options);

		return task.toJSON();
	});

export const updateTaskReservation = createServerFn()
	.validator((
		{ taskSid, reservationSid, options }: {
			taskSid: string;
			reservationSid: string;
			options: ReservationContextUpdateOptions;
		},
	) => ({ taskSid, reservationSid, options }))
	.handler(async ({ data: { taskSid, reservationSid, options } }) => {
		const client = await createClient();
		const reservation = await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
			.tasks(taskSid)
			.reservations(reservationSid)
			.update(options);

		const task = await getTask({ data: taskSid });

		return { ...reservation.toJSON(), task };
	});

// export const resToConference = async (
// 	taskSid: string,
// 	reservationSid: string,
// 	params: ReservationContextUpdateOptions = {
// 		instruction: "conference",
// 	},
// ) => {
// 	const client = await createClient();
// 	await client.taskrouter.v1
// 		.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
// 		.tasks(taskSid)
// 		.reservations(reservationSid)
// 		.update(params);
// };

// export const updateOnCallEngineer = async (workerSid: string) => {
// 	const workers = await getWorkers({
// 		targetWorkersExpression: "on_call == true",
// 	});

// 	if (workers.length) {
// 		const attributes = JSON.parse(workers[0].attributes);
// 		await updateWorker(workers[0].sid, {
// 			attributes: JSON.stringify({
// 				...attributes,
// 				on_call: !attributes.on_call,
// 			}),
// 		});
// 	}

// 	const worker = await getWorker(workerSid);
// 	const attributes = JSON.parse(worker.attributes);

// 	const newAttributes = {
// 		...attributes,
// 		on_call: !attributes.on_call,
// 	};

// 	await updateWorker(workerSid, {
// 		attributes: JSON.stringify(newAttributes),
// 	});
// };

export const updateParticipant = createServerFn()
	.validator((
		{ sid, participantSid, options }: {
			sid: string;
			participantSid: string;
			options: ParticipantContextUpdateOptions;
		},
	) => ({ sid, participantSid, options }))
	.handler(async ({ data: { sid, participantSid, options } }) => {
		const client = await createClient();
		return await client.conferences(sid).participants(participantSid)
			.update(options);
	});
