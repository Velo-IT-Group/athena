import type {
	CatalogItem,
	CommunicationItem,
	Opportunity,
	ProductsItem,
	Project,
	ProjectPhase,
	ProjectTemplateTask,
	ProjectTemplateTicket,
	ServiceTicket,
	TicketNote,
} from '@/types/manage';
import { baseHeaders } from '@/utils/manage/params';
import { createClient } from '@/lib/supabase/server';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { z } from 'zod';
import { env } from '../utils';

export const createTicketNote = async (id: number, body: TicketNote) => {
	const headers = new Headers(baseHeaders);
	headers.set('access-control-allow-origin', '*');

	const response = await fetch(`${env.VITE_CONNECT_WISE_URL}/service/tickets/${id}/notes`, {
		headers,
		method: 'post',
		body: JSON.stringify(body),
	});

	console.log(response.status);

	if (response.status !== 201) throw Error(response.statusText);

	return await response.json();
};

export const createContactCommunication = async (id: number, body: CommunicationItem) => {
	const headers = new Headers(baseHeaders);
	headers.set('access-control-allow-origin', '*');

	const response = await fetch(`${env.VITE_CONNECT_WISE_URL}/company/contacts/${id}/communications`, {
		headers,
		method: 'post',
		body: JSON.stringify(body),
	});

	console.log(response.status);

	if (response.status !== 201) throw Error(response.statusText);

	revalidatePath('/');

	return await response.json();
};

export const createCompanyNote = async (companyId: number, operation: z.infer<typeof createNoteSchema>) => {
	// const headers = await getUserHeaders();

	const config: AxiosRequestConfig = {
		headers,
	};

	const data = await axios.post(
		`${env.VITE_CONNECT_WISE_URL}/company/companies/${companyId}/notes`,
		operation,
		config
	);

	// revalidatePath('/');

	return data.data;
};

export const createOpportunity = async (
	proposal: Proposal,
	ticket: ServiceTicket
): Promise<Opportunity | undefined> => {
	try {
		const headers = await getUserHeaders();

		const config: AxiosRequestConfig = {
			headers,
		};

		const data = JSON.stringify({
			name: proposal.name,
			type: {
				id: 5,
			},
			// site: { id: 1002 },
			primarySalesRep: {
				// @ts-ignore
				id: proposal.created_by?.manage_reference_id,
			},
			company: {
				id: ticket.company?.id,
				// id: 19297,
			},
			contact: {
				// id: 17804,
				id: ticket.contact?.id,
			},
			stage: {
				id: 6,
			},
			// status: {
			// 	id: 2,
			// },
		});

		const response = await axios.post(`${env.VITE_CONNECT_WISE_URL}/sales/opportunities`, data, config);

		console.log(response.statusText);

		// await updateProposal(proposal.id, { opportunity_id: response.data.id });

		// if (proposal.products) {
		// 	await Promise.all(
		// 		proposal.products.map((p) => createManageProduct(response.data.id, { id: p.catalog_item!, productClass: p.product_class! as ProductClass }, p))
		// 	);
		// }

		return response.data;
	} catch (error) {
		console.error('Error creating opportunity:', error);
		throw new Error('Failed to create opportunity.'); // Rethrow the error with a clear message
	}
};

export const createManageProduct = async (
	opportunityId: number,
	catalogItem: CatalogItem,
	product: NestedProduct
): Promise<ProductsItem | undefined> => {
	const isBundle = catalogItem.productClass === 'Bundle';

	const data = JSON.stringify({
		catalogItem: {
			id: product.id,
		},
		price: isBundle ? null : product.price,
		cost: isBundle ? null : product.cost,
		quantity: product.quantity,
		billableOption: 'Billable',
		// ...product.overrides,
		opportunity: {
			id: opportunityId,
		},
	});

	console.log(data);

	const headers = await getUserHeaders();

	const config: AxiosRequestConfig = {
		headers,
	};

	// const config: AxiosRequestConfig = {
	//     ...baseConfig,
	//     url: '/procurement/products',
	//     method: 'post',
	//     headers: {
	//         ...baseConfig.headers,
	//         'Content-Type': 'application/json',
	//     },
	//     data,
	// }

	try {
		const response: AxiosResponse<ProductsItem, Error> = await axios.request(config);

		console.log('CREATING PRODUCT', 'created successfully');

		return response.data;
	} catch (error) {
		console.error('Error creating product:', error);
		throw new Error('Failed to create product.'); // Rethrow the error with a clear message
	}
};

export const convertOpportunityToProject = async (opportunity: Opportunity, projectId: number) => {
	let data = JSON.stringify({ projectId, includeAllProductsFlag: true });

	const headers = await getUserHeaders();

	const config: AxiosRequestConfig = {
		headers,
	};

	// let config = {
	//     ...baseConfig,
	//     method: 'patch',
	//     url: `/sales/opportunities/${opportunity.id}/convertToProject`,
	//     headers: {
	//         ...baseConfig.headers,
	//         'Content-Type': 'application/json',
	//     },
	//     data,
	// }

	try {
		// Assuming you're using axios for requests
		await axios.request(config);
	} catch (error) {
		console.error('convertOpportunityToProject Error:', error);
		throw new Error('Error converting opportunity to project', {
			cause: error,
		});
	}
};

interface ProjectCreate {
	name: string;
	board: { id: number };
	// status: { id: number };
	// company: { id: number };
	estimatedStart: string;
	estimatedEnd: string;
}

export const createProject = async (
	project: ProjectCreate,
	proposalId: string,
	opportunityId: number
): Promise<Project | undefined> => {
	const supabase = await createClient();

	let config: RequestInit = {
		method: 'POST',
		headers: baseHeaders,
		body: JSON.stringify({
			...project,
			includeAllNotesFlag: true,
			includeAllDocumentsFlag: true,
			includeAllProductsFlag: true,
		}),
	};

	try {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/sales/opportunities/${opportunityId}/convertToProject`,
			config
		);

		if (response.status !== 201) {
			throw new Error(`Error creating project: ${response.statusText}`, {
				cause: await response.json(),
			});
		}

		const data = await response.json();

		await supabase.from('proposals').update({ project_id: data.id }).eq('id', proposalId);

		return data;
	} catch (error) {
		console.error('createProject Error:', error);
		// await wait(5000)

		try {
			await createProject(project, proposalId, opportunityId);
		} catch (error) {
			throw error; // Rethrow the error after logging it
		}
	}
};

export const createProjectPhase = async (projectId: number, phase: NestedPhase): Promise<ProjectPhase | undefined> => {
	let config: RequestInit = {
		method: 'POST',
		headers: baseHeaders,
		body: JSON.stringify({
			projectId,
			description: phase.description,
			wbsCode: String(phase.order),
		} as ProjectPhase),
	};

	console.log('NON ERROR PHASE BODY', config.body);

	try {
		const response = await fetch(`${env.VITE_CONNECT_WISE_URL}/project/projects/${projectId}/phases`, config);

		if (!response.ok) throw new Error(`Error creating phase: ${response.statusText}`);

		const data = await response.json();

		if (phase.tickets) {
			const { tickets } = phase;
			for (const ticket of tickets.sort((a, b) => a.order - b.order)) {
				try {
					await createProjectTicket(data.id, ticket);
				} catch (error) {
					console.error(`Failed to create phase: ${phase.description}`, error);
				}
				// Wait for 500ms before making the next request
				// await wait(1000)
			}
			// const ticketPromises = phase.tickets.map(
			// 	(t) => new Promise((resolve, reject) => setTimeout(resolve, 100, createProjectTicket(data.id, t)))
			// );
			// await Promise.all(ticketPromises);
		}

		return data;
	} catch (error) {
		console.error('createProjectPhase Error:', error);
	}
};

interface ProjectTicketInsert {
	summary: string;
	budgetHours: number;
	phase: {
		id: number;
	};
}

export const createProjectTicket = async (
	phaseId: number,
	ticket: NestedTicket
): Promise<ProjectTemplateTicket | undefined> => {
	const { summary, budget_hours: budgetHours } = ticket;

	let config: RequestInit = {
		method: 'POST',
		headers: baseHeaders,
		body: JSON.stringify({
			summary,
			budgetHours,
			phase: {
				id: phaseId,
			},
		} as ProjectTicketInsert),
	};

	try {
		let response = await fetch(`${env.VITE_CONNECT_WISE_URL}/project/tickets`, config);

		if (!response.ok) throw new Error(`Error creating project ticket: ${response.statusText}`);

		const data = await response.json();

		if (ticket.tasks && ticket.tasks.length) {
			const { tasks } = ticket;
			for (const task of tasks.sort((a, b) => a.priority - b.priority)) {
				try {
					await createProjectTask(data.id, task);
				} catch (error) {
					console.error(`Failed to create phase: ${task.id}`, error);
				}
				// Wait for 500ms before making the next request
				// await wait(1000)
			}
			// const ticketPromises = ticket.tasks.map(
			// 	(t) => new Promise((resolve, reject) => setTimeout(resolve, 100, createProjectTask(data.id, t)))
			// );
			// await Promise.all(ticketPromises);
		}

		return data;
	} catch (error) {
		console.error('createProjectTicket Error:', error);
	}
};

interface ProjectTaskInsert {
	// ticketId: number;
	notes?: string;
	// summary: string;
	priority: number;
}

export const createProjectTask = async (ticketId: number, task: Task): Promise<ProjectTemplateTask | undefined> => {
	const { summary, notes, priority } = task;
	const body = JSON.stringify({
		notes,
		priority,
	} as ProjectTaskInsert);

	let config: RequestInit = {
		method: 'POST',
		headers: baseHeaders,
		body,
	};

	console.log('NON ERROR TASK BODY', config.body);

	try {
		let response = await fetch(`${env.VITE_CONNECT_WISE_URL}/project/tickets/${ticketId}/tasks`, config);

		if (!response.ok) throw new Error(`Error creating task: ${response.statusText}`);

		const data = await response.json();

		return data;
	} catch (error) {
		console.error(error);
		// throw new Error('Error creating project task', { cause: error });
	}
};
