// Imports global types
import '@twilio-labs/serverless-runtime-types';
// Fetches specific types
import {
	Context,
	ServerlessCallback,
	ServerlessEventObject,
	ServerlessFunctionSignature,
} from '@twilio-labs/serverless-runtime-types/types';

type EventType = 'onMessageAdded' | 'onConversationAdded';

type NumberReturnType = {
	userId?: number;
	companyId?: number;
	name: string;
	territoryName: string;
};

const getContactFromAuthor = async (
	author: string
): Promise<NumberReturnType> => {
	// This function is a placeholder for the actual implementation
	// that fetches contact information based on a phone number.
	const myRegexp = /rcs:(.*)/;
	const match = myRegexp.exec(author);

	const phoneNumber = match ? match[1] : author;

	// if (!phoneNumber) return callback(null, response);

	const params = new URLSearchParams();

	params.set('from', phoneNumber);
	const res = await fetch(
		'https://athena.velomethod.com/api/search_number' +
			`?${params.toString()}`
	);

	return (await res.json()) as NumberReturnType;
};

interface MyEvent {
	RetryCount?: string;
	EventType?: EventType;
	Attributes?: string;
	Author?: string;
	ChatServiceSid?: string;
	ParticipantSid?: string;
	Body?: string;
	AccountSid?: string;
	Source?: string;
	MessageSid?: string;
	ConversationSid?: string;
}

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

export const handler: ServerlessFunctionSignature = async function (
	context: Context<MyContext>,
	event: ServerlessEventObject<MyEvent>,
	callback: ServerlessCallback
) {
	const response = new Twilio.Response();
	const client = context.getTwilioClient();
	response.setStatusCode(200);
	console.log(event);
	if (event.EventType === 'onConversationAdded') {
		console.log(event.EventType, event.Author);
		const { name, territoryName, companyId, userId } =
			await getContactFromAuthor(event.Author ?? '');

		const task = await client.taskrouter.v1
			.workspaces(context.TWILIO_WORKSPACE_SID!)
			.tasks.create({
				taskChannel: 'sms',
				workflowSid: 'WW764bd35f4ef764879eb0c4b70ee712b9',
				attributes: JSON.stringify({
					conversationSid: event?.ConversationSid,
					name,
					team: territoryName,
					companyId,
					contactId: userId,
				}),
				virtualStartTime: new Date(),
			});

		response.setBody({
			message: 'Task created successfully',
			taskSid: task.sid,
			conversationSid: event.ConversationSid,
		});

		return callback(null, response);
	} else if (event.EventType === 'onMessageAdded') {
		console.log(event.EventType, event.Author);
		try {
			const tasks = await client.taskrouter.v1
				.workspaces(context.TWILIO_WORKSPACE_SID!)
				.tasks.list({
					evaluateTaskAttributes: `conversationSid == '${event?.ConversationSid}'`,
					assignmentStatus: [
						'pending',
						'reserved',
						'assigned',
						'wrapping',
					],
					limit: 1,
				});

			console.log(tasks);

			if (tasks.length) {
				// If a task already exists for this conversation, we update the message attributes
				console.log('Task already exists', tasks[0].sid);

				await client.conversations.v1
					.conversations(event.ConversationSid!)
					.messages(event.MessageSid!)
					.update({
						attributes: JSON.stringify({
							taskSid: tasks[0].sid,
						}),
					});

				return callback(null, response);
			}

			// if (tasks.length)

			// If the event is onMessageAdded, we need to fetch the contact information
			// from the Author field, which is expected to be in the format "rcs:<phone_number>".
			const { name, territoryName, companyId, userId } =
				await getContactFromAuthor(event.Author ?? '');

			console.log(name, territoryName);

			const task = await client.taskrouter.v1
				.workspaces(context.TWILIO_WORKSPACE_SID!)
				.tasks.create({
					taskChannel: 'sms',
					workflowSid: 'WW764bd35f4ef764879eb0c4b70ee712b9',
					attributes: JSON.stringify({
						conversationSid: event?.ConversationSid,
						name,
						team: territoryName,
						companyId,
						contactId: userId,
					}),
					virtualStartTime: new Date(),
				});

			console.log(task);

			await client.conversations.v1
				.conversations(event.ConversationSid!)
				.messages(event.MessageSid!)
				.update({
					attributes: JSON.stringify({
						taskSid: task.sid,
					}),
				});

			response.setBody({
				message: 'Task created successfully',
				taskSid: task.sid,
				conversationSid: event.ConversationSid,
			});

			return callback(null, response);
		} catch (error) {
			console.error('Error processing message:', error);
			response.setStatusCode(500);
			response.setBody({
				message: 'Internal Server Error',
				// @ts-ignore
				error: error?.message,
			});
			return callback(null, response);
		}
	}

	callback(null, response);
};
