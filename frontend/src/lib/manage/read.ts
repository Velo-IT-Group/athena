import {
	baseHeaders,
	type Conditions,
	generateParams,
} from "@/utils/manage/params";
import type {
	Activity,
	AuditTrailEntry,
	Board,
	BoardItem,
	BoardStatus,
	BoardSubType,
	BoardType,
	CatalogComponent,
	CatalogItem,
	CommunicationItem,
	CommunicationType,
	Company,
	CompanyNote,
	Configuration,
	ConfigurationStatus,
	ConfigurationType,
	Contact,
	ContactNote,
	Document,
	Holiday,
	Location,
	Priority,
	ProductsItem,
	Project,
	ProjectTemplate,
	ProjectWorkPlan,
	RecordType,
	Schedule,
	ScheduleEntry,
	ServiceTicket,
	ServiceTicketNote,
	ServiceTicketTask,
	Site,
	SystemMember,
	TimeEntry,
} from "@/types/manage";
import type { FacetedFilter } from "@/components/ui/data-table/toolbar";
import { env } from "../utils";
import { createServerFn } from "@tanstack/react-start";
import type { NavItem } from "@/types/nav";

interface SearchItem extends NavItem {
	id: any;
	title: string;
	type: "ticket" | "company" | "contact" | "configuration";
	additionalInfo?: Record<string, unknown>;
}

export const search = createServerFn()
	.validator((props: { value: string; pageParam: number }) => props)
	.handler<SearchItem[]>(async ({ data: { value, pageParam } }) => {
		try {
			const names = value.trim().split(" ");
			const firstName = names?.[0];
			const lastName = names?.[1];

			const nameSearch = lastName
				? `firstName contains '${firstName}' and (company/name contains '${lastName}' or lastName contains '${lastName}')`
				: `company/name contains '${firstName}' or firstName contains '${firstName}' or lastName contains '${firstName}'`;

			const contactConditions = value
				? `inactiveFlag = false and (${nameSearch})`
				: undefined;
			const [
				{ data: tickets },
				{ data: companies },
				{ data: contacts },
				{ data: configurations },
			] = await Promise.all([
				getTickets({
					data: {
						conditions:
							`summary contains '${value}' or company/name contains '${value}' or contact/name contains '${value}'`,
					},
				}),
				getCompanies({
					data: {
						conditions:
							`deletedFlag = false and (name contains '${value}' or status/name contains '${value}' or country/name contains '${value}' or territory/name contains '${value}' and market/name contains '${value}' and defaultContact/name contains '${value}')`,
						childConditions: { "types/id": 1 },
						orderBy: { key: "name", order: "asc" },
						fields: ["id", "name"],
					},
				}),
				getContacts({
					data: {
						conditions: contactConditions,
						childConditions: "types/id = 17 or types/id = 21",
						page: pageParam,
						orderBy: { key: "firstName" },
						fields: ["id", "firstName", "lastName", "company"],
					},
				}),
				getConfigurations({
					data: {
						conditions:
							`activeFlag = true and (name contains '${value}' or type/name contains '${value}' or company/name contains '${value}' or contact/name contains '${value}' and site/name contains '${value}' and location/name contains '${value}' and department/name contains '${value}')`,
						page: pageParam,
						orderBy: { key: "name" },
					},
				}),
			]);

			const ticketSearchItems: SearchItem[] = tickets.map((ticket) => ({
				id: ticket.id,
				title: ticket.summary,
				to: `/tickets/$id`,
				params: { id: ticket.id.toString() },
				type: "ticket",
				additionalInfo: {
					company: ticket.company?.name,
					contact: ticket.contact?.name,
				},
			}));

			const companySearchItems: SearchItem[] = companies.map((
				company,
			) => ({
				id: company.id,
				title: company.name,
				to: `/companies/$id`,
				params: { id: company.id.toString() },
				type: "company",
			}));

			const contactSearchItems: SearchItem[] = contacts.map((
				contact,
			) => ({
				id: contact.id,
				title: contact.firstName + " " + contact.lastName,
				to: `/contacts/$id`,
				params: { id: contact.id.toString() },
				type: "contact",
				additionalInfo: {
					company: contact.company?.name,
				},
			}));

			const configurationSearchItems: SearchItem[] = configurations.map((
				configuration,
			) => ({
				id: configuration.id,
				title: configuration.name,
				to: `/`,
				// params: { id: configuration.id.toString() },
				type: "configuration",
				additionalInfo: {
					company: configuration.company?.name,
					contact: configuration.contact?.name,
					site: configuration.site?.name,
					location: configuration.location?.name,
				},
			}));

			return [
				...ticketSearchItems,
				...companySearchItems,
				...contactSearchItems,
				...configurationSearchItems,
			] as SearchItem[];
		} catch (error) {
			console.error(error);
			return [] as SearchItem[];
		}
	});

export const getTickets = createServerFn()
	.validator((conditions?: Conditions<ServiceTicket>) =>
		generateParams(conditions)
	)
	.handler(async ({ data }) => {
		console.log("get tickets params", data);
		const [ticketResponse, countResponse] = await Promise.all([
			fetch(`${env.VITE_CONNECT_WISE_URL}/service/tickets${data}`, {
				headers: baseHeaders,
			}),
			fetch(`${env.VITE_CONNECT_WISE_URL}/service/tickets/count${data}`, {
				headers: baseHeaders,
			}),
		]);

		if (!ticketResponse.ok || !countResponse.ok) {
			console.error(
				ticketResponse.statusText,
				await ticketResponse.json(),
			);
			throw new Error(ticketResponse.statusText);
		}

		return {
			data: (await ticketResponse.json()) as ServiceTicket[],
			count: (await countResponse.json()).count as number,
		};
	});

export const getPriorities = createServerFn()
	.validator((conditions?: Conditions<Priority>) =>
		generateParams(conditions)
	)
	.handler(async ({ data }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/service/priorities/${data}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			throw Error("Error fetching priorities...", {
				cause: response.statusText,
			});
		}

		return await response.json();
	});

export const getCompany = createServerFn()
	.validator((
		{ id, conditions }: { id: number; conditions?: Conditions<Company> },
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/company/companies/${id}${conditions}`,
			{
				headers: baseHeaders,
			},
		);
		return (await response.json()) as Company;
	});

export const getCompanies = createServerFn()
	.validator((conditions?: Conditions<Company>) => generateParams(conditions))
	.handler(async ({ data }) => {
		const [response, countResponse] = await Promise.all([
			fetch(`${env.VITE_CONNECT_WISE_URL}/company/companies${data}`, {
				headers: baseHeaders,
				method: "GET",
			}),
			fetch(
				`${env.VITE_CONNECT_WISE_URL}/company/companies/count${data}`,
				{
					headers: baseHeaders,
					method: "GET",
				},
			),
		]);

		if (!response.ok || !countResponse.ok) {
			console.error(response.statusText);
			throw new Error(countResponse.statusText || response.statusText);
		}

		return {
			data: (await response.json()) as Company[],
			count: (await countResponse.json()).count as number,
		};
	});

export const getCompanySites = createServerFn()
	.validator((
		{ id, conditions }: { id: number; conditions?: Conditions<Site> },
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/company/companies/${id}/sites${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		return await response.json();
	});

export const getCompanyNotes = createServerFn()
	.validator((
		{ id, conditions }: {
			id: number;
			conditions?: Conditions<CompanyNote>;
		},
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const [dataResponse, countResponse] = await Promise.all([
			fetch(
				`${env.VITE_CONNECT_WISE_URL}/company/companies/${id}/notes${conditions}`,
				{
					headers: baseHeaders,
				},
			),
			fetch(
				`${env.VITE_CONNECT_WISE_URL}/company/companies/${id}/notes/count${conditions}`,
				{
					headers: baseHeaders,
				},
			),
		]);

		return {
			data: await dataResponse.json(),
			count: (await countResponse.json()).count,
		};
	});

export const getContact = createServerFn()
	.validator((
		{ id, conditions }: { id: number; conditions?: Conditions<Contact> },
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/company/contacts/${id}/${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		if (response.status !== 200) {
			throw Error("Could not find contact...");
		}

		return (await response.json()) as Contact;
	});

export const getCommunicationTypes = createServerFn()
	.validator((conditions?: Conditions<CommunicationType>) =>
		generateParams(conditions)
	)
	.handler(async ({ data }) => {
		try {
			const response = await fetch(
				`${env.VITE_CONNECT_WISE_URL}/company/communicationTypes${data}`,
				{
					headers: baseHeaders,
				},
			);

			if (!response.ok) {
				throw new Error(
					"Could not find communication types " + response.statusText,
					{
						cause: await response.json(),
					},
				);
			}

			return (await response.json()) as CommunicationType[];
		} catch (error) {
			console.error(error);
		}
	});

export const getContactCommunications = async (
	id?: number,
	conditions?: Conditions<CommunicationItem>,
): Promise<CommunicationItem[] | undefined> => {
	if (!id) return [];
	try {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/company/contacts/${id}/communications${
				generateParams(conditions)
			}`,
			{ headers: baseHeaders },
		);

		if (response.status !== 200) {
			throw Error("Could not find contact communications...");
		}

		return await response.json();
	} catch (error) {
		console.error(error);
	}
};

export const getContacts = createServerFn()
	.validator((conditions?: Conditions<Contact>) => generateParams(conditions))
	.handler(async ({ data }): Promise<{ data: Contact[]; count: number }> => {
		const [response, countResponse] = await Promise.all([
			await fetch(
				`${env.VITE_CONNECT_WISE_URL}/company/contacts/${data}`,
				{
					headers: baseHeaders,
				},
			),
			await fetch(
				`${env.VITE_CONNECT_WISE_URL}/company/contacts/count${data}`,
				{
					headers: baseHeaders,
				},
			),
		]);

		return {
			data: await response.json(),
			count: (await countResponse.json()).count,
		};
	});

export const getContactNotes = async (
	id: number,
	conditions?: Conditions<Contact>,
): Promise<ContactNote[]> => {
	const generatedConditions = generateParams(conditions);
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/company/contacts/${id}/notes${generatedConditions}`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		console.error(response.statusText, await response.json());
		throw new Error(`Could not fetch contacts... ${response.statusText}`);
	}

	return response.json();
};

export const getConfiguration = async (
	id: number,
	conditions?: Conditions<Configuration>,
): Promise<Configuration> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/company/configurations/${id}/${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);

	if (response.status !== 200) {
		throw Error(`Could not fetch configuration for ${id}...`);
	}

	return await response.json();
};

export const getConfigurationTypes = async (
	conditions?: Conditions<ConfigurationType>,
): Promise<ConfigurationType[]> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/company/configurations/types${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);

	if (response.status !== 200) throw new Error(response.statusText);

	return await response.json();
};

export const getConfigurations = createServerFn()
	.validator((conditions?: Conditions<Configuration>) =>
		generateParams(conditions)
	)
	.handler(async ({ data: conditions }) => {
		const [response, countResponse] = await Promise.all([
			fetch(
				`${env.VITE_CONNECT_WISE_URL}/company/configurations${conditions}`,
				{
					headers: baseHeaders,
				},
			),
			fetch(
				`${env.VITE_CONNECT_WISE_URL}/company/configurations/count${conditions}`,
				{
					headers: baseHeaders,
				},
			),
		]);

		if (response.status !== 200 || countResponse.status !== 200) {
			throw new Error("Could not fetch configurations...");
		}

		return {
			data: (await response.json()) as Configuration[],
			count: (await countResponse.json()).count as number,
		};
	});

export const getTasks = async (
	id: number,
	conditions?: Conditions<ServiceTicketTask>,
): Promise<ServiceTicketTask[]> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/service/tickets/${id}/tasks${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);

	return await response.json();
};

// conditions?: Conditions<ServiceTicket>): Promise<{ data: ServiceTicket[]; count: number }>

// export const getTickets = createServerFn()
//   .validator((conditions?: Conditions<ServiceTicket>) =>
//     generateParams(conditions),
//   )
//   .handler(async ({ data }) => {
//     console.log(data);
//     const [ticketResponse, countResponse] = await Promise.all([
//       axios.get<unknown, AxiosResponse<ServiceTicket[]>>(
//         `${env.VITE_CONNECT_WISE_URL}/service/tickets${data}`,
//         {
//           headers: baseHeaders,
//         },
//       ),
//       axios.get<unknown, AxiosResponse<{ count: number }>>(
//         `${env.VITE_CONNECT_WISE_URL}/service/tickets/count${data}`,
//         {
//           headers: baseHeaders,
//         },
//       ),
//     ]);

//     // if (!ticketResponse.ok || !countResponse.ok) {
//     // 	console.error(ticketResponse.statusText, await ticketResponse.json());
//     // 	throw new Error(ticketResponse.statusText);
//     // }

//     // const [ticketData, count] = await Promise.all([, countResponse.data]);

//     console.log(countResponse.data);

//     return {
//       data: ticketResponse.data,
//       count: countResponse.data?.count ?? 0,
//     };
//   });

export const getTicketCount = createServerFn()
	.validator((conditions?: Conditions<ServiceTicket>) =>
		generateParams(conditions)
	)
	.handler(async ({ data }) => {
		const responseCount = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/service/tickets/count${data}`,
			{
				headers: baseHeaders,
			},
		);

		return responseCount.json();
	});

export const getTicket = createServerFn()
	.validator((
		{ id, conditions }: {
			id: number;
			conditions?: Conditions<ServiceTicket>;
		},
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/service/tickets/${id}/${conditions}`,
			{
				headers: baseHeaders,
			},
		);
		return (await response.json()) as ServiceTicket;
	});

export const getTicketConfigurations = createServerFn()
	.validator((
		{ id, conditions }: {
			id: number;
			conditions?: Conditions<Configuration>;
		},
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/service/tickets/${id}/configurations${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		return (await response.json()) as Configuration[];
	});

type CountResponse = {
	count: number;
};

export const getTicketConfigurationsCount = async (
	id: number,
): Promise<CountResponse> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/service/tickets/${id}/configurations/count`,
		{
			headers: baseHeaders,
		},
	);

	return await response.json();
};

export const getTicketNotes = createServerFn()
	.validator((
		{ id, conditions }: {
			id: number;
			conditions?: Conditions<ServiceTicketNote>;
		},
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/service/tickets/${id}/allNotes${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		return (await response.json()) as ServiceTicketNote[];
	});

export const getSystemMember = async (
	id: number,
	conditions?: Conditions<SystemMember>,
): Promise<SystemMember> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/system/members/${id}/${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);

	return await response.json();
};

export const getContactImage = createServerFn({ response: "data" })
	.validator(({ id }: { id: number }) => ({ id }))
	.handler(async ({ data: { id } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/company/contacts/${id}/image`,
			{
				headers: baseHeaders,
			},
		);

		return await response.blob();
	});

export const getSystemMemberImage = async (id: number): Promise<Blob> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/system/members/${id}/image`,
		{
			headers: baseHeaders,
		},
	);

	return await response.blob();
};

export const getSystemMembers = createServerFn()
	.validator((conditions?: Conditions<SystemMember>) =>
		generateParams(conditions)
	)
	.handler(async ({ data }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/system/members/${data}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			throw new Error(
				"Error fetching system members... " + response.statusText,
				{
					cause: response.statusText,
				},
			);
		}

		return (await response.json()) as SystemMember[];
	});

export const getStatuses = async (
	id: number,
	conditions?: Conditions<BoardStatus>,
): Promise<BoardStatus[]> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/service/boards/${id}/statuses/${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		console.error(response.statusText);
		throw Error("Error fetching service board statuses...", {
			cause: response.statusText,
		});
	}

	return await response.json();
};

export const getConfigurationStatuses = async (
	conditions?: Conditions<ConfigurationStatus>,
): Promise<{ data: ConfigurationStatus[]; count: number }> => {
	const [response, countResponse] = await Promise.all([
		fetch(
			`${env.VITE_CONNECT_WISE_URL}/company/configurations/statuses/${
				generateParams(conditions)
			}`,
			{
				headers: baseHeaders,
			},
		),
		fetch(
			`${env.VITE_CONNECT_WISE_URL}/company/configurations/statuses/count${
				generateParams(conditions)
			}`,
			{
				headers: baseHeaders,
			},
		),
	]);

	if (!response.ok || !countResponse.ok) {
		console.error(response.statusText);
		throw Error("Error fetching configuration statuses...", {
			cause: response.statusText,
		});
	}

	return {
		data: await response.json(),
		count: (await countResponse.json()).count,
	};
};

export const getBoardTypes = createServerFn()
	.validator((
		{ id, conditions }: { id: number; conditions?: Conditions<BoardType> },
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/service/boards/${id}/types/${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			console.error(response.statusText);
			throw new Error(
				"Error fetching service board types... " + response.statusText,
				{
					cause: response,
				},
			);
		}

		return await response.json();
	});

export const getBoardSubTypes = createServerFn()
	.validator((
		{ id, conditions }: {
			id: number;
			conditions?: Conditions<BoardSubType>;
		},
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/service/boards/${id}/subTypes${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			console.error(response.statusText);
			throw new Error(
				"Error fetching service board subtypes... " +
					response.statusText,
				{
					cause: response,
				},
			);
		}

		return await response.json();
	});

export const getBoardItems = createServerFn()
	.validator((
		{ id, conditions }: { id: number; conditions?: Conditions<BoardItem> },
	) => ({
		id,
		conditions: generateParams(conditions),
	}))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/service/boards/${id}/items${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			console.error(response.statusText);
			throw new Error(
				"Error fetching service board subtypes... " +
					response.statusText,
				{
					cause: response,
				},
			);
		}

		return await response.json();
	});

export const getBoards = createServerFn()
	.validator((conditions?: Conditions<Board>) => generateParams(conditions))
	.handler(async ({ data }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/service/boards/${data}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			throw Error("Error fetching boards...", {
				cause: response.statusText,
			});
		}

		return await response.json();
	});

export const getProjects = createServerFn()
	.validator((conditions?: Conditions<Project>) => generateParams(conditions))
	.handler(async ({ data }) => {
		const [response, countResponse] = await Promise.all([
			fetch(`${env.VITE_CONNECT_WISE_URL}/project/projects${data}`, {
				headers: baseHeaders,
			}),
			fetch(
				`${env.VITE_CONNECT_WISE_URL}/project/projects/count${data}`,
				{
					headers: baseHeaders,
				},
			),
		]);

		if (!response.ok || !countResponse.ok) {
			throw new Error("Error fetching projects " + response.statusText, {
				cause: await response.json(),
			});
		}

		return {
			data: (await response.json()) as Project[],
			count: (await countResponse.json()).count as number,
		};
	});

// export const getProjects = async (
// 	conditions?: Conditions<Project>,
// ): Promise<{ data: Project[]; count: number }> => {
// 	const headers = new Headers(baseHeaders);
// 	headers.set(
// 		"Authorization",
// 		"Basic " + btoa("velo+X32LB4Xx5GW5MFNz:XcwrfwGpCODhSpvD"),
// 	);
// 	const [response, countResponse] = await Promise.all([
// 		fetch(
// 			`${env.VITE_CONNECT_WISE_URL}/project/projects${
// 				generateParams(conditions)
// 			}`,
// 			{
// 				headers,
// 			},
// 		),
// 		fetch(
// 			`${env.VITE_CONNECT_WISE_URL}/project/projects/count${
// 				generateParams(conditions)
// 			}`,
// 			{
// 				headers,
// 			},
// 		),
// 	]);

// 	if (!response.ok || !countResponse.ok) {
// 		throw new Error("Error fetching projects...", {
// 			cause: await response.json(),
// 		});
// 	}

// 	return {
// 		data: await response.json(),
// 		count: (await countResponse.json()).count,
// 	};
// };

export const getAuditTrail = createServerFn()
	.validator((
		params: {
			type: RecordType;
			id: number;
			conditions?: Conditions<AuditTrailEntry>;
		},
	) => params)
	.handler(async ({ data }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/system/audittrail?type=${data.type}&id=${data.id}${data.conditions}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			throw new Error("Error fetching audit trail...", {
				cause: response.statusText,
			});
		}

		return (await response.json()) as AuditTrailEntry[];
	});

export const getDocuments = createServerFn()
	.validator((
		params: {
			recordType: RecordType;
			id: number;
			conditions?: Conditions<Document>;
		},
	) => params)
	.handler(async ({ data: { recordType, id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/system/documents?recordType=${recordType}&recordId=${id}${
				generateParams(
					conditions,
				)?.replace("?", "&")
			}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) throw Error("Error fetching documents...");

		return (await response.json()) as Document[];
	});

export const getSchedule = async (
	id: number = 2,
	conditions?: Conditions<Schedule>,
): Promise<Schedule> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/schedule/calendars/${id}${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) throw Error("Error fetching schedule...");

	return await response.json();
};

export const getHoliday = async (
	id: number = 13,
	date: string = Intl.DateTimeFormat("en-US", { dateStyle: "short" }).format(
		new Date(),
	),
	conditions?: Conditions<Holiday>,
): Promise<Holiday[]> => {
	const params = generateParams(
		conditions ? conditions : { conditions: `date = [${date}]` },
	);

	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/schedule/holidayLists/${id}/holidays${
			params ?? ""
		}`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) throw Error("Error fetching holiday...");

	return await response.json();
};

export const getLocations = async (
	conditions?: Conditions<Location>,
): Promise<Location[]> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/system/locations${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);

	const res = await response.json();
	return res as Promise<Location[]>;
};

export const getLocation = async (
	id: number,
	conditions?: Conditions<Location>,
): Promise<Location> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/system/locations/${id}${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);

	return await response.json();
};

export const getTimeEntries = async (
	conditions?: Conditions<TimeEntry>,
): Promise<TimeEntry[]> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/time/entries${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);
	return await response.json();
};

export const getActivities = async (
	conditions?: Conditions<Activity>,
): Promise<Activity[]> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/sales/activities${
			generateParams(conditions)
		}`,
		{
			headers: baseHeaders,
		},
	);
	return await response.json();
};

export const getTemplates = createServerFn()
	.validator(
		(
			conditions: Conditions<ProjectTemplate> = {
				fields: ["id", "name", "description"],
				orderBy: { key: "name" },
			},
		) => generateParams(conditions),
	)
	.handler(async ({ data: conditions }): Promise<ProjectTemplate[]> => {
		const projectTemplateResponse = await fetch(
			`${env
				.VITE_CONNECT_WISE_URL!}/project/projectTemplates?${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		if (!projectTemplateResponse.ok) {
			console.error(projectTemplateResponse.statusText);
			throw Error(
				"Error fetching project templates... " +
					projectTemplateResponse.statusText,
				{
					cause: projectTemplateResponse.statusText,
				},
			);
		}

		const templates: ProjectTemplate[] = await projectTemplateResponse
			.json();

		const workplans: ProjectWorkPlan[] = await Promise.all(
			templates.map(({ id }) => getWorkplan({ data: { id } })),
		);

		return templates.map((template) => {
			return {
				...template,
				workplan: workplans.find((workplan) =>
					workplan.templateId === template.id
				),
			};
		});
	});

export const getTemplate = async (id: number) => {
	const templateResponse = await fetch(
		`${env.VITE_CONNECT_WISE_URL!}/project/projectTemplates/${id}`,
		{
			// next: {
			// 	revalidate: 21600,
			// 	tags: ['templates'],
			// },
			headers: baseHeaders,
		},
	);

	if (!templateResponse.ok) {
		throw Error("Error fetching template...", {
			cause: templateResponse.statusText,
		});
	}

	const template: ProjectTemplate = await templateResponse.json();

	const workplanResponse = await fetch(
		`${env
			.VITE_CONNECT_WISE_URL!}/project/projectTemplates/${template.id}/workplan`,
		{
			// next: {
			// 	revalidate: 21600,
			// 	tags: ['workplans'],
			// },
			headers: baseHeaders,
		},
	);

	if (!workplanResponse.ok) {
		throw Error("Error fetching template...", {
			cause: workplanResponse.statusText,
		});
	}

	const workplan: ProjectWorkPlan = await workplanResponse.json();

	return { ...template, workplan: workplan ?? [] };
};

export const getProducts = createServerFn()
	.validator((conditions?: Conditions<ProductsItem>) =>
		generateParams(conditions)
	)
	.handler(async ({ data: conditions }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL!}/procurement/products${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			throw Error(
				"Error fetching products... " + (await response.json()),
				{
					cause: response.statusText,
				},
			);
		}

		return (await response.json()) as ProductsItem[];
	});

export const getOpportunityTypes = async (): Promise<
	{ id: number; description: string }[]
> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/sales/opportunities/types?fields=id,description&orderBy=description`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		throw Error("Error fetching opportunity types...", {
			cause: response.statusText,
		});
	}

	return await response.json();
};

export const getOpportunityStatuses = async (): Promise<
	{ id: number; name: string }[]
> => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/sales/opportunities/statuses?fields=id,name&orderBy=name`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		throw Error("Error fetching opportunity statuses...", {
			cause: response.statusText,
		});
	}

	return await response.json();
};

export const getProjectStatuses = async () => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/project/statuses?fields=id,name&orderBy=name`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		throw Error("Error fetching project statuses...", {
			cause: response.statusText,
		});
	}

	return await response.json();
};

export const getProjectBoards = async () => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/service/boards?conditions=projectFlag = true and inactiveFlag = false`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		throw Error("Error fetching project boards...", {
			cause: response.statusText,
		});
	}

	return await response.json();
};

export interface ExtendedCatalogItem extends Omit<CatalogItem, "bundledItems"> {
	bundledItems: CatalogComponent[];
}

export const getCatalogItemComponents = async (id: number) => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/procurement/catalog/${id}/components`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		throw Error("Error getting catalog item components...", {
			cause: response.statusText,
		});
	}

	const components: CatalogComponent[] = await response.json();

	if (!components.length) return [];

	const componentString = components.map((c) => c.catalogItem.id).toString();

	const catalogItemsResponse = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/procurement/catalog?conditions=id in (${componentString})`,
		{
			headers: baseHeaders,
		},
	);

	if (!catalogItemsResponse.ok) {
		throw Error("Error getting catalog items...", {
			cause: catalogItemsResponse.statusText,
		});
	}

	const catalogItems: CatalogItem[] = await catalogItemsResponse.json();

	return components.map((c) => {
		const item = catalogItems.find((i) => i?.id === c?.catalogItem.id);

		return {
			...item,
			...c,
		};
	});
};

export const getCategories = async () => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/procurement/categories?pageSize=1000`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		throw Error("Error fetching categories...", {
			cause: response.statusText,
		});
	}

	return await response.json();
};

export const getBillingCycles = async () => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/finance/billingCycles?pageSize=1000`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		throw Error("Error fetching billing cycles...", {
			cause: response.statusText,
		});
	}

	return await response.json();
};

export const getSubCategories = async () => {
	const response = await fetch(
		`${env.VITE_CONNECT_WISE_URL}/procurement/subcategories?pageSize=1000`,
		{
			headers: baseHeaders,
		},
	);

	if (!response.ok) {
		throw Error("Error fetching subcategories...", {
			cause: response.statusText,
		});
	}

	return await response.json();
};

export const getWorkplan = createServerFn().validator((
	params: { id: number; conditions?: Conditions<ProjectWorkPlan> },
) => ({ id: params.id, conditions: generateParams(params.conditions) }))
	.handler(async ({ data: { id, conditions } }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/project/projectTemplates/${id}/workplan${conditions}`,
			// `${env.VITE_CONNECT_WISE_URL}/project/projectTemplates/${id}/workplan?fields=phases/tickets/id,phases/tickets/summary`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			throw new Error(
				"Error fetching workplan... " + await response.json(),
				{
					cause: response.statusText,
				},
			);
		}

		return (await response.json()) as ProjectWorkPlan;
	});

export const getScheduleEntries = createServerFn()
	.validator((conditions?: Conditions<ScheduleEntry>) =>
		generateParams(conditions)
	)
	.handler(async ({ data: conditions }) => {
		const response = await fetch(
			`${env.VITE_CONNECT_WISE_URL}/schedule/entries${conditions}`,
			{
				headers: baseHeaders,
			},
		);

		if (!response.ok) {
			throw Error("Error fetching schedule entries...", {
				cause: response.statusText,
			});
		}

		return (await response.json()) as ScheduleEntry[];
	});

export const searchProjectTemplates = createServerFn()
	.validator((params?: { query?: string; page?: number }) => params)
	.handler(async ({ data }) => {
		const query = data?.query;
		const page = data?.page;

		return await getTemplates({
			data: {
				page,
				fields: ["id", "name", "description"],
				orderBy: { key: "name" },
				conditions: {
					// @ts-ignore
					name: {
						comparison: "contains",
						value: query,
					},
				},
			},
		});
	});

export const searchContacts = createServerFn()
	.validator((params?: { query?: string; page?: number }) => params)
	.handler(async ({ data }) => {
		const query = data?.query;
		const page = data?.page;
		const names = query?.trim().split(" ");
		const firstName = names?.[0];
		const lastName = names?.[1];

		const nameSearch = lastName
			? `firstName contains '${firstName}' and (company/name contains '${lastName}' or lastName contains '${lastName}')`
			: `company/name contains '${firstName}' or firstName contains '${firstName}' or lastName contains '${firstName}'`;

		const contactConditions = query
			? `inactiveFlag = false and (${nameSearch})`
			: "inactiveFlag = false";

		return (
			await getContacts({
				data: {
					page,
					fields: ["id", "firstName", "lastName", "company"],
					orderBy: { key: "firstName" },
					childConditions: "types/id = 17 or types/id = 21",
					conditions: contactConditions,
				},
			})
		).data;
	});

export const searchServiceTickets = createServerFn()
	.validator((params?: { query?: string; page?: number }) => params)
	.handler(async ({ data }) => {
		const query = data?.query;
		const page = data?.page;

		return (
			await getTickets({
				data: {
					page,
					fields: ["id", "summary", "company", "contact"],
					orderBy: { key: "summary" },
					conditions: query
						? isNaN(Number(query))
							? `summary contains '${query}' and closedFlag = false`
							: `summary contains '${query}' or id = ${query} and closedFlag = false`
						: "closedFlag = false",
				},
			})
		).data;
	});

export const searchCatalogItems = createServerFn()
	.validator((params?: { query?: string; page?: number }) => params)
	.handler(async ({ data }) => {
		const query = data?.query;
		const page = data?.page;

		return (
			await getCatalogItems({
				data: {
					conditions: query
						? `inactiveFlag = false and (description contains '%${query}%' or identifier contains '%${query}%')`
						: `inactiveFlag = false`,
					page,
					orderBy: { key: "description" },
				},
			})
		).data;
	});

export const getCatalogItems = createServerFn()
	.validator((conditions?: Conditions<ExtendedCatalogItem>) =>
		generateParams(conditions)
	)
	.handler(async ({ data: conditions }) => {
		const [response, countResponse] = await Promise.all([
			fetch(
				`${env.VITE_CONNECT_WISE_URL}/procurement/catalog${conditions}`,
				{
					headers: baseHeaders,
					method: "GET",
				},
			),
			fetch(
				`${env.VITE_CONNECT_WISE_URL}/procurement/catalog/count${conditions}`,
				{
					headers: baseHeaders,
					method: "GET",
				},
			),
		]);

		const catalogItems: CatalogItem[] = await response.json();

		const bundles = catalogItems?.filter((item) =>
			item.productClass === "Bundle"
		);
		const bItems = (await Promise.all(bundles.map((b) =>
			getCatalogItemComponents(b.id)
		)))
			.flat()
			.filter((i) =>
				i !== undefined
			);

		const mappedData: ExtendedCatalogItem[] = catalogItems.map((item) => {
			return {
				...item,
				bundledItems: bItems?.filter((bItem) =>
					bItem && bItem.parentCatalogItem.id === item.id
				),
			};
		});

		return {
			data: mappedData as ExtendedCatalogItem[],
			count: (await countResponse.json()).count as number,
		};
	});

export const getTicketFacetedFilters = async (): Promise<
	FacetedFilter<ServiceTicket>[]
> => {
	const [boards, priorities, { data: contacts }, { data: companies }] =
		await Promise.all([
			getBoards({
				conditions: {
					inactiveFlag: false,
					projectFlag: false,
				},
				orderBy: { key: "name" },
				fields: ["id", "name"],
				pageSize: 1000,
			}),
			getPriorities({
				fields: ["id", "name"],
				orderBy: { key: "name" },
				pageSize: 1000,
			}),
			getContacts({
				conditions: {
					//  'company/id': companyId ? [companyId] : undefined,
					inactiveFlag: false,
				},
				orderBy: {
					key: "firstName",
				},
				fields: ["id", "firstName", "lastName"],
				pageSize: 1000,
			}),
			getCompanies({
				childConditions: { "types/id": 1 },
				orderBy: { key: "name", order: "asc" },
				fields: ["id", "name"],
				pageSize: 1000,
			}),
		]);

	return [
		{
			accessoryKey: "board",
			items: boards,
		},
		{
			accessoryKey: "priority",
			items: priorities,
		},
		{
			accessoryKey: "company",
			items: companies,
		},
		{
			accessoryKey: "contact",
			items: contacts.map((contact) => ({
				id: contact.id,
				name: `${contact.firstName} ${contact.lastName}`,
			})),
		},
	];
};

export const getConfigurationFacetedFilters = async (): Promise<
	FacetedFilter<Configuration>[]
> => {
	const [{ data: configurationStatuses }, configurationTypes] = await Promise
		.all([
			getConfigurationStatuses({
				fields: ["id", "description"],
				orderBy: {
					key: "description",
				},
			}),
			getConfigurationTypes({
				orderBy: { key: "name" },
				fields: ["id", "name"],
				pageSize: 1000,
			}),
		]);

	return [
		{
			accessoryKey: "status",
			items: configurationStatuses.map((status) => ({
				id: status.id,
				name: status.description,
			})),
		},
		{
			accessoryKey: "type",
			items: configurationTypes,
		},
	];
};
