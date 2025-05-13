import { z } from "zod";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { QueryClient } from "@tanstack/react-query";
import { dataTableFilterQuerySchema } from "@/components/ui/data-table";

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

export const filterSchema = z.object({
	filter: dataTableFilterQuerySchema.optional(),
	pagination: paginationSchema.optional(),
	sort: sortSchema.optional(),
});

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

export const env = envSchema.parse(import.meta.env);

export const delay = async (delay = 1000) => {
	const delayPromise = (ms: number) =>
		new Promise((res) => setTimeout(res, ms));
	await delayPromise(delay);
};

/**
 * Updates the query cache with a new item
 * @param {QueryClient} queryClient
 * @param {unknown[]} queryKey
 * @param {T} newItem
 * @param {Function} comparisonFn
 * @return {Promise<{ previousItems: T[] | undefined, newItems: T[] }>}
 */
export const updateArrayQueryCache = async <T>(
	queryClient: QueryClient,
	queryKey: unknown[],
	newItem: T,
	comparisonFn?: (item: T) => boolean,
): Promise<{ previousItems: T[] | undefined; newItems: T[] }> => {
	let newItems: T[] = [];
	const previousItems = queryClient.getQueryData<T[]>(queryKey) ?? [];

	// Cancel any outgoing refetches
	// (so they don't overwrite our optimistic update)
	await queryClient.cancelQueries({
		queryKey,
	});

	if (comparisonFn) {
		// Snapshot the previous value
		console.log(previousItems);
		const updatedItem = previousItems?.find(comparisonFn);

		const newItemTest = { ...updatedItem, ...newItem };

		newItems = [
			...previousItems.filter((item) => !comparisonFn(item)),
			newItemTest,
		];
	} else {
		newItems = [...previousItems, newItem];
	}

	console.log(newItems, previousItems);

	// Optimistically update to the new value
	queryClient.setQueryData(queryKey, newItems);

	/// Returning context for optimistic updates
	return { previousItems, newItems };
};

/**
 * Updates the query cache with a new item
 * @param {QueryClient} queryClient
 * @param {unknown[]} queryKey
 * @param {T} newItem
 * @return {Promise<{ previousItems: T | undefined, newItems: T }>}
 */
export const updateQueryCache = async <T>(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
	newItem: T,
): Promise<{ previousItem: T | undefined; newItem: T }> => {
	const previousItem = queryClient.getQueryData<T>(queryKey);

	// Cancel any outgoing refetches
	// (so they don't overwrite our optimistic update)
	await queryClient.cancelQueries({
		queryKey,
	});

	const updatedItem: T = { ...previousItem, ...newItem };

	// Optimistically update to the new value
	queryClient.setQueryData(queryKey, updatedItem);

	/// Returning context for optimistic updates
	return { previousItem, newItem: updatedItem };
};

export const parsePhoneNumber = (phoneNumber: string) => {
	const regex = "^(\\+\\d{1,2}\\s)?\\(?\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}$";
	const isValid = phoneNumber.match(regex);

	return {
		isValid,
		formattedNumber: phoneNumber.replace(regex, "+1 \($1\) $2-$3"),
	};
};
