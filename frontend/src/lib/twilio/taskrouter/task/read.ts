import { env } from '@/lib/utils';
import { createClient } from '@/utils/twilio';
import { createServerFn } from '@tanstack/react-start';
import { WorkflowListInstanceOptions } from 'twilio/lib/rest/taskrouter/v1/workspace/workflow';

export const getTask = createServerFn()
	.validator(({ sid }: { sid: string }) => ({ sid }))
	.handler(async ({ data: { sid } }) => {
		const client = await createClient();
		const task = await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID)
			.tasks(sid)
			.fetch();
		return task.toJSON();
	});

export const getWorkflows = createServerFn()
	.validator((options?: WorkflowListInstanceOptions) => options)
	.handler(async ({ data }) => {
		const client = await createClient();
		const workflows = await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID)
			.workflows.list(data);
		return workflows.map((w) => w.toJSON());
	});

export const getWorkflow = createServerFn()
	.validator(
		(options: { sid: string; options?: WorkflowListInstanceOptions }) =>
			options
	)
	.handler(async ({ data }) => {
		const client = await createClient();
		const workflow = await client.taskrouter.v1
			.workspaces(env.VITE_TWILIO_WORKSPACE_SID)
			.workflows(data.sid)
			.fetch();

		return workflow.toJSON();
	});
