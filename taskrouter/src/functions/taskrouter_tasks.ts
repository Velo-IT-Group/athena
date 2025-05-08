// Imports global types
import "@twilio-labs/serverless-runtime-types";
import { RuntimeSyncServiceContext } from "@twilio-labs/serverless-runtime-types/types";
import { Twilio } from "twilio";

type Params = {
	client: Twilio;
	syncService: RuntimeSyncServiceContext;
};

exports.taskrouterTasks = async function syncTaskrouterTasks(
	parameters: Params,
) {
	const { client } = parameters;
	const WORKSPACE_SID = process.env.TWILIO_WORKSPACE_SID;
	try {
		const tasks = await client.taskrouter
			.v1
			.workspaces(WORKSPACE_SID!)
			.tasks.list({ ordering: "Priority:desc,DateCreated:asc" });

		const taskResults = tasks.map((task) => ({
			TaskSid: task.sid,
			Priority: task.priority,
			...JSON.parse(task.attributes),
			TaskStatus: task.assignmentStatus,
		}));

		return taskResults;
	} catch (error) {
		console.error(error);
		return [];
	}
};
