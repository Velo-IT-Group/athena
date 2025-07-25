// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
	Context,
	ServerlessCallback,
	type ServerlessEventObject,
	ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

type MyEvent = {
	TaskSid?: string;
	taskSid?: string;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {};

export const handler: ServerlessFunctionSignature = async function (
	context: Context<MyContext>,
	event: ServerlessEventObject<MyEvent>,
	callback: ServerlessCallback,
) {
	let taskSid = event.taskSid ?? event.TaskSid;
	let actionUrl =
		`https://${context.DOMAIN_NAME}/voicemail_complete?taskSid=${taskSid}`;

	let twiml = new Twilio.twiml.VoiceResponse();

	twiml.play("/Prompt_User_To_Leave_Voicemail.wav");

	twiml.record({
		action: encodeURI(actionUrl),
		playBeep: true,
		transcribe: false,
		trim: "do-not-trim",
		timeout: 5,
	});

	callback(null, twiml);
};
