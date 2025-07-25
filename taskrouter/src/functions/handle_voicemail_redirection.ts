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
	callSid?: string;
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
	const client = context.getTwilioClient();
	const response = new Twilio.Response();

	const taskSid = event.taskSid;
	const callSid = event.callSid;

	if (!taskSid) return callback("No task sid provided", undefined);
	if (!callSid) return callback("No call sid provided", undefined);

	const url = `https://${context.DOMAIN_NAME}/voicemail?taskSid=${taskSid}`;

	// redirect call to voicemail
	try {
		await client.calls(callSid).update({
			method: "POST",
			url: encodeURI(url),
		});

		return callback(null, response);
	} catch (error) {
		response.setStatusCode(500);
		return callback(error as string, response);
	}
};
