import { DAY_IN_MS } from "@/components/template-catalog";
import {
	getBoardItems,
	getBoards,
	getBoardSubTypes,
	getBoardTypes,
	getCommunicationTypes,
	getCompanies,
	getCompany,
	getCompanyNotes,
	getCompanySites,
	getConfigurations,
	getConfigurationsCount,
	getContact,
	getContactImage,
	getContacts,
	getDocuments,
	getPriorities,
	getProjects,
	getScheduleEntries,
	getSystemMemberImage,
	getSystemMembers,
	getTemplates,
	getTicket,
	getTicketConfigurations,
	getTicketCount,
	getTicketNotes,
	getTickets,
	getTimeEntries,
	search,
} from "@/lib/manage/read";
import type {
	Board,
	BoardItem,
	BoardSubType,
	BoardType,
	CommunicationType,
	Company,
	CompanyNote,
	Configuration,
	Contact,
	Priority,
	Project,
	ScheduleEntry,
	ServiceTicket,
	Site,
	SystemMember,
	TimeEntry,
} from "@/types/manage";
import type { Conditions } from "@/utils/manage/params";
import { queryOptions, useMutation } from "@tanstack/react-query";

// type QueryKeys = {
// 	boards: {
// 		all: () => ['boards'];
// 	}
// };

export const queryKeys = {
	boards: {
		all: () => ["boards"],
		getBoards: (params?: Conditions<Board>) => [
			...queryKeys.boards.all(),
			params,
		],
		byId: (id: number, params?: Conditions<Board>) => [
			...queryKeys.boards.all(),
			id,
			params,
		],
	},
};

export const boardQueries = {
	fetch: (params?: Conditions<Board>) =>
		queryOptions({
			queryKey: queryKeys.boards.getBoards(params),
			queryFn: () =>
				getBoards({ data: { orderBy: { key: "name" }, ...params } }),
			staleTime: Infinity,
		}),
	byId: (id: number, params?: Conditions<Board>) =>
		queryOptions({
			queryKey: queryKeys.boards.byId(id, params),
			queryFn: () =>
				getBoards({ data: { orderBy: { key: "name" }, ...params } }),
			staleTime: Infinity,
		}),
};

export const getTimeEntriesQuery = (params?: Conditions<TimeEntry>) =>
	queryOptions({
		queryKey: ["time", "entries", params],
		queryFn: async () =>
			getTimeEntries({
				data: params,
			}),
		staleTime: Infinity,
	});

export const getCompaniesQuery = (params?: Conditions<Company>) =>
	queryOptions({
		queryKey: ["companies", params],
		queryFn: async () =>
			getCompanies({
				data: {
					conditions: { deletedFlag: false, "status/id": 1 },
					childConditions: { "types/id": 1 },
					orderBy: { key: "identifier", order: "asc" },
					fields: ["id", "identifier", "name", "territory"],
					...params,
				},
			}),
		staleTime: Infinity,
	});

export const getScheduleEntriesQuery = (params?: Conditions<ScheduleEntry>) =>
	queryOptions({
		queryKey: ["schedule-entries", params],
		queryFn: () =>
			getScheduleEntries({
				data: params,
			}),
		staleTime: Infinity,
	});

export const getSystemMemberImageQuery = (id: number | null = 0) =>
	queryOptions({
		queryKey: ["members", id, "image"],
		queryFn: async () => (await getSystemMemberImage({ data: id! })).blob(),
		staleTime: Infinity,
		enabled: !!id && id > 0,
	});

export const getTicketsQuery = (params?: Conditions<ServiceTicket>) =>
	queryOptions({
		queryKey: ["tickets", params],
		queryFn: async () =>
			getTickets({
				data: {
					conditions: {
						closedFlag: false,
						parentTicketId: null,
					},
					fields: [
						"id",
						"summary",
						"board",
						"status",
						"priority",
						"owner",
						"contact",
						"company",
						"slaStatus",
						"subType",
						"type",
						"impact",
						"source",
						"_info",
					],
					orderBy: {
						key: "id",
						order: "desc",
					},
					...params,
				},
			}),
		staleTime: Infinity,
	});

export const getTicketsCountQuery = (params?: Conditions<ServiceTicket>) =>
	queryOptions({
		queryKey: ["tickets", params, "count"],
		queryFn: async () =>
			getTicketCount({
				data: {
					conditions: {
						closedFlag: false,
						parentTicketId: null,
						// "board/id": [22, 26, 30, 31],
					},
					fields: [
						"id",
						"summary",
						"board",
						"status",
						"priority",
						"owner",
						"contact",
						"company",
						"slaStatus",
						"subType",
						"type",
						"impact",
						"source",
						"_info",
					],
					orderBy: {
						key: "id",
						order: "desc",
					},
					...params,
				},
			}),
		staleTime: Infinity,
	});

export const getContactsQuery = (params?: Conditions<Contact>) =>
	queryOptions({
		queryKey: ["contacts", params],
		queryFn: async () =>
			getContacts({
				data: {
					childConditions: "types/id = 17 or types/id = 21",
					orderBy: { key: "firstName" },
					fields: [
						"id",
						"firstName",
						"defaultPhoneNbr",
						"communicationItems",
						"lastName",
						"company",
					],
					...params,
				},
			}),
		staleTime: Infinity,
	});

export const getTicketQuery = (
	id: number,
	conditions?: Conditions<ServiceTicket>,
) =>
	queryOptions({
		queryKey: ["tickets", id, conditions],
		queryFn: () => getTicket({ data: { id, conditions } }),
		enabled: id > 0,
	});

export const ticketConfigurationsQuery = (id: number) =>
	queryOptions({
		queryKey: ["tickets", id, "configurations"],
		queryFn: () => getTicketConfigurations({ data: { id } }),
	});

export const getTicketDocumentsQuery = (id: number) =>
	queryOptions({
		queryKey: ["tickets", id, "documents"],
		queryFn: () => getDocuments({ data: { recordType: "Ticket", id } }),
	});

export const getConfigurationsQuery = (params?: Conditions<Configuration>) =>
	queryOptions({
		queryKey: ["configurations", params],
		queryFn: () =>
			getConfigurations({
				data: {
					conditions: { "status/id": 2 },
					pageSize: 1000,
					orderBy: { key: "name" },
					fields: [
						"id",
						"name",
						"site",
						"company",
						"type",
						"contact",
						"questions",
						"lastLoginName",
						"tagNumber",
						"serialNumber",
					],
					...params,
				},
			}),
		staleTime: DAY_IN_MS / 24,
	});

export const getConfigurationsCountQuery = (
	params?: Conditions<Configuration>,
) =>
	queryOptions({
		queryKey: ["configurations", params, "count"],
		queryFn: () =>
			getConfigurationsCount({
				data: {
					conditions: { "status/id": 2 },
					pageSize: 1000,
					orderBy: { key: "name" },
					fields: [
						"id",
						"name",
						"site",
						"company",
						"type",
						"contact",
						"questions",
						"lastLoginName",
						"tagNumber",
						"serialNumber",
					],
					...params,
				},
			}),
		staleTime: DAY_IN_MS / 24,
	});

export const getBoardsQuery = (params?: Conditions<Board>) =>
	queryOptions({
		queryKey: ["boards", params],
		queryFn: () => getBoards({ data: { orderBy: { key: "name" }, ...params } }),
		staleTime: Infinity,
	});

export const getPrioritiesQuery = (params?: Conditions<Priority>) =>
	queryOptions({
		queryKey: ["boards", params],
		queryFn: () =>
			getPriorities({
				data: { orderBy: { key: "sortOrder" }, ...params },
			}),
		staleTime: Infinity,
	});

export const getMembersQuery = (params?: Conditions<SystemMember>) =>
	queryOptions({
		queryKey: ["members", params],
		queryFn: () =>
			getSystemMembers({
				data: {
					conditions: {
						inactiveFlag: false,
					},
					fields: [
						"id",
						"firstName",
						"lastName",
						"homePhone",
						"mobilePhone",
						"officePhone",
						"defaultPhone",
					],
					orderBy: { key: "firstName" },
					pageSize: 1000,
					...params,
				},
			}),
		staleTime: Infinity,
	});

export const getBoardTypesQuery = (
	id: number,
	params?: Conditions<BoardType>,
) =>
	queryOptions({
		queryKey: ["types", id, params],
		queryFn: () =>
			getBoardTypes({
				data: {
					id,
					conditions: { orderBy: { key: "name" }, ...params },
				},
			}),
		staleTime: Infinity,
	});

export const getBoardSubTypesQuery = (
	id: number,
	params?: Conditions<BoardSubType>,
) =>
	queryOptions({
		queryKey: ["subtypes", id, params],
		queryFn: () =>
			getBoardSubTypes({
				data: {
					id,
					conditions: { orderBy: { key: "name" }, ...params },
				},
			}),
		staleTime: Infinity,
	});

export const getBoardItemsQuery = (
	id: number,
	params?: Conditions<BoardItem>,
) =>
	queryOptions({
		queryKey: ["items", id, params],
		queryFn: () =>
			getBoardItems({
				data: {
					id,
					conditions: { orderBy: { key: "name" }, ...params },
				},
			}),
		staleTime: Infinity,
	});

export const getCompanySitesQuery = (id: number, params?: Conditions<Site>) =>
	queryOptions({
		queryKey: ["sites", id, params],
		queryFn: () =>
			getCompanySites({
				data: {
					id,
					conditions: {
						fields: ["id", "name"],
						orderBy: { key: "name" },
						...params,
					},
				},
			}),
		staleTime: Infinity,
	});

export const getTicketNotesQuery = (id: number) =>
	queryOptions({
		queryKey: ["tickets", id, "notes"],
		queryFn: () =>
			getTicketNotes({
				data: {
					id,
					conditions: {
						// @ts-ignore
						orderBy: { key: "dateEntered", order: "desc" },
					},
				},
			}),
		staleTime: Infinity,
	});

export const getCompanyNotesQuery = (
	id: number,
	conditions?: Conditions<CompanyNote>,
) =>
	queryOptions({
		queryKey: ["companies", id, "notes", conditions],
		queryFn: () =>
			getCompanyNotes({
				data: {
					id,
					conditions,
				},
			}),
		staleTime: Infinity,
	});

export const getCompanyQuery = (id: number, conditions?: Conditions<Company>) =>
	queryOptions({
		queryKey: ["companies", id, conditions],
		queryFn: () => getCompany({ data: { id, conditions } }),
		staleTime: Infinity,
	});

export const getGlobalSearchQuery = (value: string, pageParam = 1) =>
	queryOptions({
		queryKey: ["global-search", value, pageParam],
		queryFn: async () => await search({ data: { value, pageParam } }),
	});

export const getTemplatesQuery = () =>
	queryOptions({
		queryKey: ["templates"],
		queryFn: () => getTemplates(),
		staleTime: Infinity,
		gcTime: Infinity,
		networkMode: "offlineFirst",
	});

export const getCompanyProjectsQuery = (
	id: number,
	conditions: Conditions<Project> = {
		conditions: { "company/id": Number(id), "status/id": [1, 15, 19] },
		orderBy: { key: "actualStart", order: "desc" },
	},
) =>
	queryOptions({
		queryKey: ["companies", id, "projects", conditions],
		queryFn: () =>
			getProjects({
				data: conditions,
			}),
	});

export const getCompanyConfigurationsQuery = (
	id: number,
	conditions: Conditions<Configuration> = {
		conditions: { "company/id": Number(id), "status/id": 2 },
		pageSize: 1000,
		orderBy: { key: "name" },
		fields: ["id", "name", "site", "type", "questions"],
	},
) =>
	queryOptions({
		queryKey: ["companies", id, "configurations", conditions],
		queryFn: () =>
			getConfigurations({
				data: conditions,
			}),
	});

export const getCompanyBestPracticesQuery = (
	id: number,
	conditions: Conditions<ServiceTicket> = {
		fields: ["id", "summary"],
	},
) =>
	queryOptions({
		queryKey: ["companies", id, "best-practices"],
		queryFn: () => {
			console.log(conditions);
			return getTickets({
				data: conditions,
			});
		},
	});

export const getCompanyContactsQuery = (
	id: number,
	conditions: Conditions<Contact> = {
		conditions: {
			"company/id": id,
		},
		orderBy: {
			key: "firstName",
		},
		pageSize: 1000,
		fields: ["id", "firstName", "lastName"],
	},
) =>
	queryOptions({
		queryKey: ["companies", id, "contacts", conditions],
		queryFn: () =>
			getContacts({
				data: conditions,
			}),
	});

export const getContactQuery = (
	id: number,
	conditions: Conditions<Contact> = {
		fields: ["id", "firstName", "lastName", "company", "communicationItems"],
	},
) =>
	queryOptions({
		queryKey: ["contacts", id, conditions],
		queryFn: () => getContact({ data: { id, conditions } }),
	});

export const getCommunicationTypesQuery = (
	conditions: Conditions<CommunicationType> = {
		orderBy: { key: "description" },
	},
) =>
	queryOptions({
		queryKey: ["communication-types", conditions],
		queryFn: () => getCommunicationTypes({ data: conditions }),
		staleTime: Infinity,
		gcTime: Infinity,
		networkMode: "offlineFirst",
	});

export const getContactTicketsQuery = (
	id: number,
	conditions?: Conditions<ServiceTicket>,
) =>
	queryOptions({
		queryKey: ["contacts", id, "tickets", conditions],
		queryFn: () =>
			getTickets({
				data: {
					conditions: {
						closedFlag: false,
						parentTicketId: null,
						"contact/id": id,
					},
					fields: [
						"id",
						"summary",
						"board",
						"status",
						"priority",
						"owner",
						"contact",
						"company",
						"slaStatus",
						"subType",
						"type",
						"impact",
						"source",
						"_info",
					],
					orderBy: {
						key: "id",
						order: "desc",
					},
					...conditions,
				},
			}),
		staleTime: Infinity,
		gcTime: Infinity,
		networkMode: "offlineFirst",
	});

export const getContactImageBlobQuery = (id: number) =>
	queryOptions({
		queryKey: ["contacts", id, "blob"],
		queryFn: () => getContactImage({ data: { id } }),
		staleTime: Infinity,
		gcTime: Infinity,
		networkMode: "offlineFirst",
	});
