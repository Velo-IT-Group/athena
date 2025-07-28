// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
	Context,
	ServerlessCallback,
	type ServerlessEventObject,
	ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
const createTicket =
	require(Runtime.getFunctions()["helpers/ticket_functions"].path)
		.createTicket;
const createAttachment =
	require(Runtime.getFunctions()["helpers/ticket_functions"].path)
		.createAttachment;
// This is your new function. To start, set the name and path on the left.

type MyEvent = {
	taskSid?: string;
	RecordingUrl?: string;
	RecordingSid?: string;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
	TWILIO_WORKSPACE_SID?: string;
};

export const handler: ServerlessFunctionSignature = async function (
	context: Context<MyContext>,
	event: ServerlessEventObject<MyEvent>,
	callback: ServerlessCallback,
) {
	const client = context.getTwilioClient(),
		taskSid = event.taskSid,
		segmentLink = event.RecordingUrl;

	if (!taskSid) return callback("No taskSid provided", undefined);

	let twiml = new Twilio.twiml.VoiceResponse();

	try {
		// retrieve the task this voicemail recording corresponds to
		const task = await client.taskrouter.workspaces(
			context.TWILIO_WORKSPACE_SID!,
		).tasks(taskSid).fetch();

		// parse the task attributes - lets append some Insights specific attributes
		// this will let Insights know this task was a voicemail and not an abandoned call
		let taskAttributes = JSON.parse(task.attributes);
		taskAttributes.conversations = taskAttributes.conversations || {};
		taskAttributes.conversations = Object.assign(
			taskAttributes.conversations,
			{
				segment_link: segmentLink,
				abandoned: "Follow-Up",
				abandoned_phase: "Voicemail",
			},
		);

		const ticket = await createTicket({
			id: taskAttributes.userId,
			name: taskAttributes.customers?.name,
			companyId: taskAttributes.companyId,
			phoneNumber: taskAttributes.from,
		});

		await createAttachment({
			attachmentUrl: segmentLink,
			ticketId: ticket.id,
		});

		taskAttributes.ticketId = ticket.id;
		// taskAttributes.recordingUrl = segmentLink

		// update the task attributes with the Insights specific information
		await client.taskrouter
			.workspaces(context.TWILIO_WORKSPACE_SID!)
			.tasks(taskSid)
			.update({
				attributes: JSON.stringify(taskAttributes),
			});

		// Remove attributes we definitely don't want to persist to the new task
		delete taskAttributes.call_sid;
		delete taskAttributes.reservation_attributes;
		delete taskAttributes.conference;
		// delete taskAttributes.conversations?.abandoned;
		// delete taskAttributes.conversations?.hang_up_by;
		delete taskAttributes.name;
		taskAttributes.name = `Voicemail (${taskAttributes.from}) - ${
			ticket.id ? ` #${ticket.id}` : ""
		}`;
		taskAttributes.taskType = "voicemail";
		taskAttributes.callBackData = {
			numberToCall: taskAttributes.from,
			numberToCallFrom: taskAttributes.to,
			attempts: 1,
			mainTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			utcDateTimeReceived: new Date(),
			recordingSid: event.RecordingSid,
			recordingUrl: segmentLink,
			isDeleted: false,
		};

		await client.taskrouter.v1.workspaces(context.TWILIO_WORKSPACE_SID!)
			.tasks.create({
				timeout: 3600,
				attributes: JSON.stringify(taskAttributes),
				workflowSid: process.env.TWILIO_WORKFLOW_SID,
				taskChannel: "voice",
			});
	} catch (error) {
		console.error(error);
		// twiml.setStatusCode(500);
		return callback(error as string, undefined);
	}

	// end
	return callback(null, twiml);
};
