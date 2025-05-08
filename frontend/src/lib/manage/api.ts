import { DAY_IN_MS } from "@/components/template-catalog";
import {
    getBoardItems,
    getBoards,
    getBoardSubTypes,
    getBoardTypes,
    getCompanies,
    getCompanySites,
    getConfigurations,
    getContacts,
    getPriorities,
    getSystemMembers,
    getTickets,
} from "@/lib/manage/read";
import type {
    Board,
    BoardItem,
    BoardSubType,
    BoardType,
    Company,
    Configuration,
    Contact,
    Priority,
    ServiceTicket,
    Site,
    SystemMember,
} from "@/types/manage";
import type { Conditions } from "@/utils/manage/params";
import type {
    DefinedInitialDataOptions,
    UndefinedInitialDataOptions,
    UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export const getCompaniesQuery = (
    params?: Conditions<Company>,
):
    | DefinedInitialDataOptions<{ data: Company[]; count: number }>
    | UndefinedInitialDataOptions<{ data: Company[]; count: number }>
    | UseSuspenseQueryOptions<{ data: Company[]; count: number }> => ({
        queryKey: ["companies", params],
        queryFn: async () =>
            getCompanies({
                data: {
                    conditions: { deletedFlag: false, "status/id": 1 },
                    childConditions: { "types/id": 1 },
                    orderBy: { key: "name", order: "asc" },
                    fields: ["id", "identifier", "name", "territory"],
                    ...params,
                },
            }),
        staleTime: Infinity,
    });

export const getTicketsQuery = (
    params?: Conditions<ServiceTicket>,
): UseSuspenseQueryOptions<{ data: ServiceTicket[]; count: number }> => ({
    queryKey: ["tickets", params],
    queryFn: async () =>
        getTickets({
            data: {
                conditions: {
                    closedFlag: false,
                    parentTicketId: null,
                    "board/id": [22, 26, 30, 31],
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
    // staleTime: Infinity,
});

export const getContactsQuery = (
    params?: Conditions<Contact>,
): UseSuspenseQueryOptions<{ data: Contact[]; count: number }> => ({
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

export const getConfigurationsQuery = (
    params?: Conditions<Configuration>,
):
    | DefinedInitialDataOptions<{ data: Configuration[]; count: number }>
    | UndefinedInitialDataOptions<{ data: Configuration[]; count: number }>
    | UseSuspenseQueryOptions<{ data: Configuration[]; count: number }> => ({
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

export const getBoardsQuery = (
    params?: Conditions<Board>,
):
    | DefinedInitialDataOptions<Board[]>
    | UndefinedInitialDataOptions<Board[]>
    | UseSuspenseQueryOptions<Board[]> => ({
        queryKey: ["boards", params],
        queryFn: () =>
            getBoards({ data: { orderBy: { key: "name" }, ...params } }),
        staleTime: Infinity,
    });

export const getPrioritiesQuery = (
    params?: Conditions<Priority>,
):
    | DefinedInitialDataOptions<Priority[]>
    | UndefinedInitialDataOptions<Board[]>
    | UseSuspenseQueryOptions<Board[]> => ({
        queryKey: ["boards", params],
        queryFn: () =>
            getPriorities({
                data: { orderBy: { key: "sortOrder" }, ...params },
            }),
        staleTime: Infinity,
    });

export const getMembersQuery = (
    params?: Conditions<SystemMember>,
):
    | DefinedInitialDataOptions<SystemMember[]>
    | UndefinedInitialDataOptions<SystemMember[]>
    | UseSuspenseQueryOptions<SystemMember[]> => ({
        queryKey: ["members"],
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
):
    | DefinedInitialDataOptions<BoardType[]>
    | UndefinedInitialDataOptions<BoardType[]>
    | UseSuspenseQueryOptions<BoardType[]> => ({
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
):
    | DefinedInitialDataOptions<BoardSubType[]>
    | UndefinedInitialDataOptions<BoardSubType[]>
    | UseSuspenseQueryOptions<BoardSubType[]> => ({
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
):
    | DefinedInitialDataOptions<BoardItem[]>
    | UndefinedInitialDataOptions<BoardItem[]>
    | UseSuspenseQueryOptions<BoardItem[]> => ({
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

export const getCompanySitesQuery = (
    id: number,
    params?: Conditions<Site>,
):
    | DefinedInitialDataOptions<Site[]>
    | UndefinedInitialDataOptions<Site[]>
    | UseSuspenseQueryOptions<Site[]> => ({
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
