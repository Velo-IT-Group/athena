// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
	Context,
	ServerlessCallback,
	type ServerlessEventObject,
	ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import { WorkerInstance } from "twilio/lib/rest/taskrouter/v1/workspace/worker";
const getTicket = require(
	Runtime.getFunctions()["helpers/ticket_operations"]
		.path,
).getTicket;
const { makeCall, notifyWorker } = require(
	Runtime.getFunctions()[
		"helpers/call_operations"
	].path,
);

type MyEvent = {
	taskSid?: string;
	ticketId?: number;
	TaskQueueName?: string;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
	WORKSPACE_SID?: string;
};

type ReferenceType = {
	id: number;
	identity?: string;
	name: string;
};

type Ticket = {
	id: number;
	summary: string;
	board?: {
		id: number;
		name: string;
	};
	status?: {
		id: number;
		name: string;
	};
};

export const handler: ServerlessFunctionSignature = async function (
	context: Context<MyContext>,
	event: ServerlessEventObject<MyEvent>,
	callback: ServerlessCallback,
) {
	const client = context.getTwilioClient();
	const response = new Twilio.Response();
	const taskSid = event.taskSid;
	const ticketId = event.ticketId;

	if (!taskSid) return callback("No task sid provided.", undefined);
	if (!ticketId) return callback("No ticeket id provided.", undefined);

	try {
		const ticket: Ticket = await getTicket(ticketId);

		// check if ticket is off of triage board or the status isn't new
		if (ticket.board?.id !== 30 || ticket.status?.id !== 530) {
			await client.taskrouter.v1
				.workspaces(context.WORKSPACE_SID!)
				.tasks(taskSid)
				.remove();

			response.setStatusCode(200);
			response.setBody("Task removed successfully");

			return callback(null, response);
		}

		let targetWorkersExpression = "";

		// create proper targetWorkerExpression
		switch (event.TaskQueueName) {
			case "On Call Engineers":
				targetWorkersExpression = `on_call == true`;
				break;
			case "Escalations Engineers":
				targetWorkersExpression = `job_title CONTAINS 'Escalations'`;
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

		const workers = await client.taskrouter.v1
			.workspaces(context.WORKSPACE_SID!)
			.workers.list({
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

		let worker;

		if (event.TaskQueueName === "Executive Team") {
			worker = workers.find(({ attributes }) =>
				JSON.parse(attributes).job_title.includes("President")
			);
		}

		worker = workers[0];

		const { direct_dial, work_phone } = JSON.parse(worker.attributes);

		const notification = await notifyWorker({
			context,
			To: work_phone || direct_dial,
			// Url: taskAttributes.callBackData?.recordingUrl || taskAttributes.recordingUrl,
		});

		if (event.TaskQueueName === "Executive Team") {
			// taskAttributes = { ...taskAttributes, called_doo: true };
			// await client.taskrouter.v1
			// 	.workspaces(process.env.WORKSPACE_SID)
			// 	.tasks(taskSid)
			// 	.update({
			// 		attributes: JSON.stringify(taskAttributes),
			// 	});
		}

		response.setStatusCode(200);
		response.setBody(notification);

		return callback(null, response);
	} catch (error) {
		response.setStatusCode(400);
		return callback(error as string, undefined);
	}

	callback(null, response);
};
