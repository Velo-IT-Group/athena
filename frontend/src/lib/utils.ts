"use server";
import { z } from "zod";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { QueryClient } from "@tanstack/react-query";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const sortSchema = z.object({
	field: z.string(),
	direction: z.enum(["asc", "desc"]).default("asc"),
});

export const paginationSchema = z.object({
	page: z.number(),
	pageSize: z.number(),
});

// export const filterSchema = z.object({
// 	filter: dataTableFilterQuerySchema.optional(),
// 	pagination: paginationSchema.optional(),
// 	sort: sortSchema.optional(),
// });

const envSchema = z.object({
	MODE: z.enum(["development", "production", "test"]),
	VITE_ATLASSIAN_API_TOKEN: z.string(),
	VITE_CONNECT_WISE_CLIENT_ID: z.string(),
	VITE_CONNECT_WISE_PASSWORD: z.string(),
	VITE_CONNECT_WISE_URL: z.string(),
	VITE_CONNECT_WISE_USERNAME: z.string(),
	VITE_FLAGS_SECRET: z.string(),
	VITE_JIRA_BASE_URL: z.string(),
	VITE_JIRA_EMAIL: z.string(),
	VITE_JIRA_PROJECT_KEY: z.string(),
	VITE_SECRET_KEY: z.string(),
	VITE_SUPABASE_ANON_KEY: z.string(),
	VITE_SUPABASE_URL: z.string(),
	VITE_TWILIO_ACCOUNT_SID: z.string(),
	VITE_TWILIO_API_KEY_SECRET: z.string(),
	VITE_TWILIO_API_KEY_SID: z.string(),
	VITE_TWILIO_AUTH_TOKEN: z.string(),
	VITE_TWILIO_CHAT_SID: z.string(),
	VITE_TWILIO_DEFAULT_ACTIVITY_SID: z.string(),
	VITE_TWILIO_PHONE_NUMBER: z.string(),
	VITE_TWILIO_SYNC_SID: z.string(),
	VITE_TWILIO_TASK_QUEUE_SID: z.string(),
	VITE_TWILIO_WORKFLOW_SID: z.string(),
	VITE_TWILIO_WORKSPACE_SID: z.string(),
});

console.log(import.meta.env);

export const env = envSchema.parse(import.meta.env);

export const delay = async (delay = 1000) => {
	const delayPromise = (ms: number) =>
		new Promise((res) => setTimeout(res, ms));
	await delayPromise(delay);
};

/**
 * Updates the query cache with a new item
 * @param {QueryClient} queryClient
 * @param {readonly unknown[]} queryKey
 * @param {any} item
 * @return {Promise<{ previousItem: T, newItem?: T }>}
 */
export const updateCacheItem = async <T>(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
	item: any,
): Promise<{ previousItem: T; newItem?: T }> => {
	const previousItem = queryClient.getQueryData<T>(queryKey) ?? [];

	// Cancel any outgoing refetches
	// (so they don't overwrite our optimistic update)
	await queryClient.cancelQueries({
		queryKey,
	});

	if (!previousItem) return { previousItem: item };

	const updatedItem = { ...previousItem, ...item };

	// Optimistically update to the new value
	queryClient.setQueryData(queryKey, updatedItem);

	/// Returning context for optimistic updates
	return { previousItem: previousItem as T, newItem: updatedItem as T };
};

/**
 * Updates the query cache with a new item
 * @param {QueryClient} queryClient
 * @param {readonly unknown[]} queryKey
 * @param {T} item
 * @param {Function} comparisonFn
 * @return {Promise<{ previousItems: T[], newItems: T[] }>}
 */
export const updateArrayCacheItem = async <T>(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
	item: any,
	comparisonFn: (item: T) => boolean,
): Promise<{ previousItems: T[]; newItems: T[] }> => {
	const previousItems = queryClient.getQueryData<T[]>(queryKey) ?? [];

	// Cancel any outgoing refetches
	// (so they don't overwrite our optimistic update)
	await queryClient.cancelQueries({
		queryKey,
	});

	const updatedItem = previousItems?.find(comparisonFn);

	const newItemTest = { ...updatedItem, ...item };

	const newItems = [
		...previousItems.filter((item) => !comparisonFn(item)),
		newItemTest,
	];

	// Optimistically update to the new value
	queryClient.setQueryData(queryKey, newItems);

	/// Returning context for optimistic updates
	return { previousItems, newItems };
};

export const deleteCacheItem = async <T>(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
	comparisonFn: (item: T) => boolean,
): Promise<{ previousItems: T[]; newItems: T[] }> => {
	const previousItems = queryClient.getQueryData<T[]>(queryKey) ?? [];
	const newItems = previousItems.filter((item) => !comparisonFn(item));
	queryClient.setQueryData(queryKey, newItems);
	return { previousItems, newItems };
};

export const addCacheItem = async <T>(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
	item: T,
): Promise<{ previousItems: T[]; newItems: T[] }> => {
	const previousItems = queryClient.getQueryData<T[]>(queryKey) ?? [];
	const newItems = [...previousItems, item];
	queryClient.setQueryData(queryKey, newItems);
	return { previousItems, newItems };
};

export const moveTicketsBetweenPhases = (
	from: NestedPhase,
	to: NestedPhase,
	targetedIndex: number,
) => {
	const fromPhaseTickets = from.tickets;
	const toPhaseTickets = to.tickets;

	if (!fromPhaseTickets || !toPhaseTickets) {
		return { fromPhase: from, toPhase: to };
	}

	const newFromPhaseTickets = fromPhaseTickets?.filter((ticket) =>
		ticket.id !== to.id
	);
	const newToPhaseTickets = [...toPhaseTickets, ...fromPhaseTickets];

	const newFromPhase = { ...from, tickets: newFromPhaseTickets };
	const newToPhase = { ...to, tickets: newToPhaseTickets };

	return { fromPhase: newFromPhase, toPhase: newToPhase };
};

export const parsePhoneNumber = (phoneNumber: string) => {
	const regex = "^(\\+\\d{1,2}\\s)?\\(?\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}$";
	const isValid = phoneNumber.match(regex);

	return {
		isValid,
		formattedNumber: phoneNumber.replace(regex, "+1 ($1) $2-$3"),
	};
};

export function isSame(oldArray: string[], newArray: string[]): boolean {
	if (oldArray.length !== newArray.length) return false;
	for (let i = 0; i < newArray.length; i++) {
		if (newArray[i] !== oldArray[i]) {
			return false;
		}
	}
	return true;
}
