import {
	convertOpportunityToProjectSchema,
	createNoteSchema,
	createOpportunitySchema,
	createProductSchema,
	type Opportunity,
	type ProductsItem,
	type Project,
	type ProjectPhase,
} from "@/types/manage";
import { baseHeaders } from "@/utils/manage/params";
import axios, {
	AxiosHeaders,
	type AxiosRequestConfig,
	type AxiosResponse,
} from "axios";
import { z } from "zod";
import { env } from "../utils";
import { createServerFn } from "@tanstack/react-start";
import { asyncThrottle } from "@tanstack/pacer";
import { updateManageProject } from "@/lib/manage/update";
import { Operation } from "@/types";

const headers = new AxiosHeaders(baseHeaders);

headers.set("clientId", import.meta.env.VITE_CONNECT_WISE_CLIENT_ID!);
headers.set("Content-Type", "application/json");

headers.set(
	"Authorization",
	"Basic " +
		btoa(
			"velo+" +
				"maaPiVTeEybbK3SX" +
				":" +
				"eCT1NboeMrXq9P3z",
		),
);

// Throttle UI updates to once every 200ms
const throttledCreateManageProduct = asyncThrottle(
	async (product: z.infer<typeof createProductSchema>) =>
		await createManageProduct({ data: product }),
	{
		wait: 200,
	},
);

const throttledCreateProjectPhase = asyncThrottle(
	async (params: { projectId: number; phase: NestedPhase }) =>
		await createProjectPhase({ data: params }),
	{
		wait: 200,
	},
);

const throttledCreateProjectTicket = asyncThrottle(
	async (params: { phaseId: number; ticket: NestedTicket }) =>
		await createProjectTicket({ data: params }),
	{
		wait: 200,
	},
);

const throttledCreateProjectTask = asyncThrottle(
	async (params: { ticketId: number; task: Task }) =>
		await createProjectTask({ data: params }),
	{
		wait: 200,
	},
);

export const createOpportunity = createServerFn().validator((
	opportunity: z.infer<typeof createOpportunitySchema>,
) => createOpportunitySchema.parse(opportunity)).handler(async (
	{ data: opportunity },
) => {
	const config: AxiosRequestConfig = {
		headers,
	};

	const data = JSON.stringify(opportunity);

	const response = await axios.post<Opportunity>(
		`${env.VITE_CONNECT_WISE_URL}/sales/opportunities`,
		data,
		config,
	);

	if (response.status !== 201) {
		throw new Error(
			"Error creating opportunity: " + response.statusText + " \n\n" +
				response.data,
		);
	}

	return response.data;
});

export const createManageProduct = createServerFn().validator((
	product: z.infer<typeof createProductSchema>,
) => createProductSchema.parse(product)).handler(async (
	{ data: product },
) => {
	const data = JSON.stringify(product);

	const config: AxiosRequestConfig = {
		headers,
	};

	const response: AxiosResponse<ProductsItem, Error> = await axios.post(
		`${env.VITE_CONNECT_WISE_URL}/procurement/products`,
		data,
		config,
	);

	if (response.status !== 201) {
		console.error(response.data);
		throw new Error(
			"Error creating product: " + response.statusText + " \n\n" +
				response.data,
		);
	}

	return response.data;
});

export const convertOpportunityToProject = createServerFn().validator((
	{ id, body }: {
		id: number;
		body: z.infer<typeof convertOpportunityToProjectSchema>;
	},
) => ({ id, body: convertOpportunityToProjectSchema.parse(body) })).handler(
	async (
		{ data: { id, body } },
	) => {
		const data = JSON.stringify(body);

		const config: AxiosRequestConfig = {
			headers: baseHeaders,
		};

		const project = await axios.post<Project>(
			`${env.VITE_CONNECT_WISE_URL}/sales/opportunities/${id}/convertToProject`,
			data,
			config,
		);

		return project.data;
	},
);

export const createProjectPhase = createServerFn().validator((
	{ projectId, phase }: { projectId: number; phase: NestedPhase },
) => ({ projectId, phase })).handler(async (
	{ data: { projectId, phase } },
) => {
	const config: RequestInit = {
		method: "POST",
		headers: baseHeaders,
		body: JSON.stringify({
			projectId,
			description: phase.description,
			wbsCode: String(phase.order),
		} as ProjectPhase),
	};

	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/project/projects/${projectId}/phases`,
		config,
	);

	if (!response.ok) {
		throw new Error(
			`Error creating phase: ${response.statusText} \n\n` +
				await response.json(),
		);
	}

	const data = await response.json();

	if (phase.tickets) {
		for (const ticket of phase.tickets.sort((a, b) => a.order - b.order)) {
			console.log(ticket);
			await throttledCreateProjectTicket({
				phaseId: data.id,
				ticket,
			});
		}
	}

	return data;
});

export const createProjectTicket = createServerFn().validator((
	{ phaseId, ticket }: { phaseId: number; ticket: NestedTicket },
) => ({ phaseId, ticket })).handler(async (
	{ data: { phaseId, ticket } },
) => {
	const { summary, budget_hours: budgetHours } = ticket;

	const config: RequestInit = {
		method: "POST",
		headers: baseHeaders,
		body: JSON.stringify({
			summary,
			budgetHours,
			phase: {
				id: phaseId,
			},
		}),
	};

	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/project/tickets`,
		config,
	);

	if (!response.ok) {
		throw new Error(
			`Error creating project ticket: ${response.statusText} \n\n` +
				await response.json(),
		);
	}

	const data = await response.json();

	if (ticket.tasks && ticket.tasks.length) {
		const { tasks } = ticket;
		for (const task of tasks.sort((a, b) => a.priority - b.priority)) {
			await throttledCreateProjectTask({ ticketId: data.id, task });
		}
	}
});

export const createProjectTask = createServerFn().validator((
	{ ticketId, task }: { ticketId: number; task: Task },
) => ({ ticketId, task })).handler(async (
	{ data: { ticketId, task } },
) => {
	const { notes, priority } = task;
	const body = JSON.stringify({
		notes,
		priority,
	});

	const config: RequestInit = {
		method: "POST",
		headers: baseHeaders,
		body,
	};

	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/project/tickets/${ticketId}/tasks`,
		config,
	);

	if (!response.ok) {
		throw new Error(`Error creating task: ${response.statusText}`);
	}

	const data = await response.json();

	return data;
});

export const createCompanyNote = createServerFn().validator((
	{ companyId, note }: {
		companyId: number;
		note: z.infer<typeof createNoteSchema>;
	},
) => ({ companyId, note })).handler(
	async ({ data: { companyId, note } }) => {
		const config: AxiosRequestConfig = {
			headers: baseHeaders,
		};

		const data = await axios.post(
			`${env.VITE_CONNECT_WISE_URL}/company/companies/${companyId}/notes`,
			note,
			config,
		);

		if (data.status !== 201) {
			throw new Error(
				`Error creating company note: ${data.statusText} \n\n` +
					data.data,
			);
		}
		return data.data;
	},
);
