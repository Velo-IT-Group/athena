// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
	Context,
	ServerlessCallback,
	ServerlessEventObject,
	ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import type { TaskInstance } from "twilio/lib/rest/taskrouter/v1/workspace/task";

const { notifyWorker } = require(
	Runtime.getFunctions()["helpers/twilio/call_operations"].path,
);
const { getTicket } = require(
	Runtime.getFunctions()["helpers/manage/ticket_functions"].path,
);
const { syncTaskrouterWorkers, syncTaskrouterTasks } = require(
	Runtime.getFunctions()[
		"helpers/twilio/sync/sync_operations"
	].path,
);

type MyEvent = {
	EventType?: TaskRouterEventType;
	TaskSid?: string;
	TaskAttributes?: string;
	TaskQueueName?: string;
	WorkerName?: string;
	WorkerSid?: string;
	WorkflowName?: string;
};

type QueueStatus = {
	calls_in_queue: number;
	status: string;
	voicemails_in_queue: number;
	workers_available: number;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
export type MyContext = {
	ACCOUNT_SID?: string;
	AUTH_TOKEN?: string;
	CLIENT_ID?: string;
	CW_AUTH?: string;
	TWILIO_SYNC_SID?: string;
	TWILIO_SYNC_MAP_SID?: string;
	TWILIO_SYNC_DOC_SID?: string;
	TWILIO_WORKSPACE_SID?: string;
};

const syncMapTypes = [
	"reservation.accepted",
	"task.created",
	"task.canceled",
	"worker.activity.update",
	"worker.attributes.update",
];

export const handler: ServerlessFunctionSignature = async function (
	context: Context<MyContext>,
	event: ServerlessEventObject<MyEvent>,
	callback: ServerlessCallback,
) {
	const client = context.getTwilioClient();
	const response = new Twilio.Response();
	response.setStatusCode(200);
	const { TWILIO_SYNC_SID } = context;
	const syncService = client.sync.v1.services(TWILIO_SYNC_SID!);

	if (syncMapTypes.includes(event.EventType ?? "")) {
		const params = new URLSearchParams();
		params.set("eventType", event.EventType ?? "");
		if (event.TaskAttributes) {
			params.set("TaskAttributes", event.TaskAttributes ?? "");
		}

		await fetch(
			`${
				context.DOMAIN_NAME.includes("localhost")
					? "http"
					: "https"
			}://${context.DOMAIN_NAME}/sync-queue-status`,
			{
				method: "POST",
				body: params,
			},
		);
	}

	try {
		const requestDict = event;
		const eventType = requestDict.EventType;

		// if (
		// 	(eventType === "reservation.accepted" ||
		// 		eventType === "reservation.created") && requestDict.TaskSid
		// ) {
		// 	const parsedAttributes = JSON.parse(
		// 		requestDict.TaskAttributes ?? "",
		// 	);
		// 	await client.taskrouter.v1
		// 		.workspaces(context.TWILIO_WORKSPACE_SID!)
		// 		.tasks(requestDict.TaskSid)
		// 		.update({
		// 			attributes: JSON.stringify({
		// 				...parsedAttributes,
		// 				worker_sid: requestDict.WorkerSid,
		// 				worker_name: requestDict.WorkerName,
		// 			}),
		// 		});
		// }

		// if (eventType?.startsWith("worker.")) {
		// 	await syncTaskrouterWorkers({ client, syncService });
		// }

		// if (
		// 	eventType?.startsWith("task.") ||
		// 	eventType?.startsWith("reservation.")
		// ) {
		// 	await syncTaskrouterTasks({ client, syncService });
		// }
		// if (
		// 	event.EventType?.startsWith("worker.") ||
		// 	event.EventType?.startsWith("task.")
		// ) {
		// 	const queueStatusDocument = syncService.documents("Queue Status");
		// 	const tasks = await syncService.syncMaps("SyncTaskRouterTasks")
		// 		.syncMapItems.list();

		// 	const workersAvailableAndNotOnCalls = tasks.map((item) => {
		// 		const worker = item.data as TaskInstance;
		// 		const taskAttributes = JSON.parse(worker.attributes ?? "{}");
		// 		if (taskAttributes.on_call === false) {
		// 			doc.workers_available += 1;
		// 		}
		// 	});

		// 	const document = await queueStatusDocument.fetch();
		// 	const attributes = JSON.parse(event.TaskAttributes ?? "{}");
		// 	console.log(attributes);
		// 	var doc = document.data as QueueStatus;

		// 	if (event.EventType === "task.created") {
		// 		attributes.taskType === "voicemail"
		// 			? (doc.voicemails_in_queue += 1)
		// 			: (doc.calls_in_queue += 1);
		// 	} else if (event.EventType === "task.deleted") {
		// 		attributes.taskType === "voicemail"
		// 			? (doc.voicemails_in_queue -= 1)
		// 			: (doc.calls_in_queue -= 1);
		// 	} else if (event.EventType === "task.system-deleted") {
		// 		attributes.taskType === "voicemail"
		// 			? (doc.voicemails_in_queue -= 1)
		// 			: (doc.calls_in_queue -= 1);
		// 	} else if (event.EventType === "task.canceled") {
		// 		attributes.taskType === "voicemail"
		// 			? (doc.voicemails_in_queue -= 1)
		// 			: (doc.calls_in_queue -= 1);
		// 	}

		// 	console.log(doc);

		// 	await queueStatusDocument.update({
		// 		data: doc,
		// 	});
		// }
	} catch (error) {
		console.error(error);
		return callback(error as string, undefined);
	}

	if (
		event.EventType === "task-queue.entered" &&
		event.WorkflowName === "Voicemail" && event.TaskAttributes
	) {
		try {
			let taskSid = event.TaskSid;

			let taskAttributes = JSON.parse(event.TaskAttributes);

			const ticket = await getTicket(taskAttributes.ticketId);

			// check if ticket is off of triage board or the status isn't new
			if (ticket.board?.id !== 30 || ticket.status?.id !== 530) {
				await client.taskrouter.v1.workspaces(
					context.TWILIO_WORKSPACE_SID!,
				).tasks(taskSid!).remove();

				response.setStatusCode(200);
				response.setBody("Success");

				return callback(null, response);
			}

			// let formattedTeam = taskAttributes.territoryName.split(' ').join('');

			let targetWorkersExpression = "";

			// create proper targetWorkerExpression
			switch (event.TaskQueueName) {
				case "On Call Engineers":
					targetWorkersExpression = `on_call == true`;
					// if (formattedTeam) {
					// 	// targetWorkersExpression = `on_call == true AND roles HAS '${formattedTeam}'`;
					// } else {

					// }
					break;
				case "Escalations Engineers":
					targetWorkersExpression =
						`job_title CONTAINS 'Escalations'`;

					break;
				case "Strength Engineers":
					targetWorkersExpression = `job_title CONTAINS 'Strength'`;
					break;
				case "Executive Team":
					targetWorkersExpression =
						`job_title CONTAINS 'Director' OR job_title CONTAINS 'President'`;
					break;

				default:
					return callback(null, response);
			}

			const workers = await client.taskrouter.v1.workspaces(
				context.TWILIO_WORKSPACE_SID!,
			).workers.list({
				targetWorkersExpression: targetWorkersExpression,
				limit: 20,
			});

			if (!workers.length) {
				throw new Error(
					`No workers found with the following expression: ${targetWorkersExpression}`,
				);
			}

			response.setStatusCode(200);
			response.setBody(workers);

			let worker = workers[0];

			// if (event.TaskQueueName === "Executive Team") {
			//     worker = workers.find(({ attributes }) =>
			//         JSON.parse(attributes ?? "").job_title.includes("President")
			//     );
			// }

			const { direct_dial, work_phone } = JSON.parse(
				worker?.attributes ?? "",
			);

			const notification = await notifyWorker({
				context,
				To: work_phone || direct_dial,
				Url: taskAttributes.callBackData?.recordingUrl ||
					taskAttributes.recordingUrl,
			});

			if (event.TaskQueueName === "Executive Team") {
				taskAttributes = { ...taskAttributes, called_doo: true };

				await client.taskrouter.v1
					.workspaces(context.TWILIO_WORKSPACE_SID!)
					.tasks(taskSid!)
					.update({
						attributes: JSON.stringify(taskAttributes),
					});
			}

			response.setStatusCode(200);
			response.setBody(notification);

			return callback(null, response);
		} catch (error) {
			response.setStatusCode(400);
			return callback(error as string);
		}
	}

	if (
		event.EventType === "task-queue.entered" &&
		event.TaskQueueName === "Voicemail"
	) {
		const taskSid = event.TaskSid;
		const taskAttributes = JSON.parse(event.TaskAttributes!);
		const callSid = taskAttributes.call_sid;

		const url =
			`https://${context.DOMAIN_NAME}/voicemail?taskSid=${taskSid}`;

		// redirect call to voicemail
		try {
			await client.calls(callSid).update({
				method: "POST",
				url: encodeURI(url),
			});

			return callback(null, response);
		} catch (error) {
			response.setStatusCode(500);
			console.error(error);
			return callback(error as string);
		}
	}

	callback(null, response);
};
