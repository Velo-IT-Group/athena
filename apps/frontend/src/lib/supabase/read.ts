import { createServerFn } from "@tanstack/react-start";
import { formatDate, startOfDay } from "date-fns";
import { z, ZodArray } from "zod";
import { DAY_IN_MS } from "@/components/template-catalog";
import type { UseSupabaseUploadOptions } from "@/hooks/use-supabase-upload";
import { createClient } from "@/lib/supabase/server";
import { env, filterSchema, paginationSchema, sortSchema } from "@/lib/utils";
import type { Database as DB } from "@/types/supabase.d.ts";

type Workflow = Database["system"]["Tables"]["workflow_entity"]["Row"];

const engagmentQueryOptionsSchema = z.object({
	call_date: z.date().or(z.array(z.date())).optional(),
	contactId: z.number().optional(),
	companyId: z.number().optional(),
	in_business_hours: z.boolean().optional(),
});

export type EngagementQueryOptions = z.infer<
	typeof engagmentQueryOptionsSchema
>;

export interface EngagementSortOptions {
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export const getEngagementSummaryByPeriod = createServerFn()
	.validator((options?: EngagementQueryOptions) => options)
	.handler(async ({ data: options }) => {
		const supabase = createClient();

		const query = supabase
			.schema("reporting")
			.from("call_summary_by_period")
			.select();

		if (Array.isArray(options?.call_date)) {
			query.gte(
				"call_date",
				options.call_date[0].toISOString().split("T")[0],
			);
			query.lt(
				"call_date",
				options.call_date[1].toISOString().split("T")[0],
			);
		} else {
			query.eq(
				"call_date",
				(options?.call_date ?? new Date())?.toISOString().split("T")[0],
			);
		}

		query.order("call_date", { ascending: false });

		// query.range(0, 1);

		const { data } = await query.throwOnError();

		return data;
	});

export const getEngagementReservations = createServerFn()
	.validator((sid: string) => sid)
	.handler(async ({ data: sid }) => {
		const supabase = createClient();

		const { data, error, count } = await supabase
			.schema("reporting")
			.from("engagement_reservations")
			.select("*, engagement:enagement_id(*)", { count: "exact" })
			.eq("worker_sid", sid)
			.order("created_at", { ascending: false })
			.range(0, 25);

		if (error) {
			throw new Error(
				"Error in getting engagement reservations " + error.message,
				{
					cause: error,
				},
			);
		}

		return JSON.parse(
			JSON.stringify({ data: data ?? [], count: count ?? 0 }),
		);
	});

// @ts-ignore
export const getEngagements = createServerFn()
	.validator(
		z
			.object({
				options: engagmentQueryOptionsSchema.optional(),
				sort: sortSchema.optional(),
				pagination: paginationSchema.optional(),
			})
			.optional(),
	)
	.handler<{ data: Engagement[]; count: number }>(
		async ({ data: filters }) => {
			const supabase = createClient();

			const query = supabase
				.schema("reporting")
				.from("engagements")
				.select("*, reservations:engagement_reservations(*)");

			// console.log(filters?.options?.call_date);

			if (
				filters?.options?.call_date &&
				Array.isArray(filters?.options.call_date)
			) {
				console.log(filters.options.call_date?.[0].toISOString());
				query.gte(
					"created_at",
					filters.options.call_date?.[0].toISOString(),
				);
				query.lt(
					"created_at",
					filters.options.call_date?.[1].toISOString(),
				);
			} else if (
				filters?.options?.call_date &&
				!Array.isArray(filters?.options.call_date)
			) {
				console.log(filters?.options?.call_date);
				query.gte(
					"created_at",
					(filters?.options.call_date ?? new Date()).toISOString(),
				);
			}

			if (filters?.options?.contactId) {
				query.eq("contact->id", filters.options.contactId);
			}

			if (filters?.options?.companyId) {
				query.eq("company->id", filters.options.companyId);
			}

			query.order(filters?.sort?.field ?? "created_at", {
				ascending: filters?.sort?.direction === "asc",
			});

			query.eq("workspace_sid", env.VITE_TWILIO_WORKSPACE_SID);

			if (filters?.options?.in_business_hours) {
				query.eq(
					"in_business_hours",
					filters?.options?.in_business_hours,
				);
			}

			if (filters?.pagination) {
				query.range(
					(filters.pagination?.pageSize ?? 25) *
						(filters.pagination?.page ?? 1),
					(filters.pagination?.pageSize ?? 25) *
							(filters.pagination?.page ?? 1) +
						(filters.pagination?.pageSize ?? 25),
				);
			} else {
				// query.range(0, 25);
			}

			const { data, count } = await query.throwOnError();

			return { data: data ?? [], count: count ?? 0 };
		},
	);

// @ts-ignore
export const getEngagement = createServerFn()
	.validator(z.string())
	.handler<Engagement>(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.schema("reporting")
			.from("engagements")
			.select()
			.eq("id", id)
			.single();

		if (error) {
			throw new Error(
				"Error in getting engagement for id " + id + " " +
					error.message,
				{
					cause: error,
				},
			);
		}

		return JSON.parse(JSON.stringify(data));
	});

export const getPinnedItems = createServerFn().handler(async ({ data }) => {
	const supabase = createClient();

	const { data: pinnedItems, error } = await supabase
		.from("pinned_items")
		.select();

	if (error) {
		throw new Error("Error in getting pinned items " + error.message, {
			cause: error,
		});
	}

	return JSON.parse(JSON.stringify(pinnedItems));
});

export const getNotifications = createServerFn().handler(async () => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("notifications")
		.select()
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error("Error in getting notifications " + error.message, {
			cause: error,
		});
	}

	return JSON.parse(JSON.stringify(data));
});

export const getPinnedItem = createServerFn()
	.validator((params: Record<string, string>) => params)
	.handler(async ({ data }) => {
		const supabase = createClient();

		if (!data) {
			throw new Error("No data provided");
		}

		const { data: pinnedItem, error } = await supabase
			.from("pinned_items")
			.select()
			.match(data)
			.single();

		if (error) {
			console.error(error);
			return null;
		}

		return JSON.parse(JSON.stringify(pinnedItem));
	});

// @ts-ignore
export const getProposalsWithCount = createServerFn()
	.validator((options?: ProposalQueryOptions) => options)
	.handler<{ data: Proposal[]; count: number }>(async ({ data }) => {
		const supabase = createClient();

		const proposalsQuery = supabase.from("proposals").select("*", {
			count: "exact",
		});

		if (data?.order) {
			proposalsQuery.order("updated_at", { ascending: false });
		}

		if (data?.searchText) {
			proposalsQuery.textSearch("name", data.searchText, {
				type: "websearch",
				config: "english",
			});
		}

		if (data?.userFilters?.length) {
			proposalsQuery.in(
				"created_by",
				data.userFilters.map((u) => u),
			);
		}

		if (data?.companyFilters?.length) {
			proposalsQuery.eq(
				"company->id",
				data?.companyFilters.map((u) => Number(u)).toString(),
			);
		}

		const { data: proposals, error, count } = await proposalsQuery;

		if (error) {
			throw new Error("Error in getting proposals", { cause: error });
		}

		return { data: JSON.parse(JSON.stringify(proposals)), count: count };
	});

export const getProposals = createServerFn()
	.validator((options?: ProposalQueryOptions) => options)
	.handler<Proposal[]>(async ({ data }) => {
		const supabase = createClient();

		const proposalsQuery = supabase.from("proposals").select("*");

		if (data?.order) {
			proposalsQuery.order("updated_at", { ascending: false });
		}

		if (data?.searchText) {
			proposalsQuery.textSearch("name", data.searchText, {
				type: "plain",
				config: "english",
			});
		}

		if (data?.userFilters?.length) {
			proposalsQuery.in(
				"created_by",
				data.userFilters.map((u) => u),
			);
		}

		if (data?.companyFilters?.length) {
			proposalsQuery.eq(
				"company->id",
				data?.companyFilters.map((u) => Number(u)).toString(),
			);
		}

		proposalsQuery.range(data?.range?.[0] ?? 0, data?.range?.[1] ?? 25);

		const { data: proposals, error } = await proposalsQuery;

		if (error) {
			throw new Error("Error in getting proposals", { cause: error });
		}

		return JSON.parse(JSON.stringify(proposals));
	});

// @ts-ignore
export const getWorkflows = createServerFn().handler<{
	data: Workflow[];
	count: number;
}>(async () => {
	const supabase = createClient();

	const { data, error, count } = await supabase
		.schema("system")
		.from("workflow_entity")
		.select("*");

	if (error) {
		throw new Error("Error in getting workflows " + error.message, {
			cause: error,
		});
	}

	return { data, count };
});

export const getWorkflow = createServerFn()
	.validator(z.string())
	.handler<{ data: Workflow; count: number }>(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error, count } = await supabase
			.schema("system")
			.from("workflow_entity")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			throw new Error("Error in getting workflows " + error.message, {
				cause: error,
			});
		}

		return { data, count };
	});

export const getConversations = createServerFn()
	.validator(
		({
			contactId,
			companyId,
			workerId,
			limit,
		}: {
			contactId?: number;
			companyId?: number;
			workerId?: string;
			limit?: number;
		}) => ({ contactId, companyId, workerId, limit }),
	)
	.handler(async ({ data: { contactId, companyId, workerId, limit } }) => {
		const supabase = createClient();

		const query = supabase.schema("reporting").from("conversations")
			.select();

		if (contactId) {
			query.eq("contact_id", contactId);
		}

		if (companyId) {
			query.eq("company_id", companyId);
		}

		if (workerId) {
			query.eq("worker_id", workerId);
		}

		if (limit) {
			query.limit(limit);
		}

		query.order("date", { ascending: false });

		const { data, error } = await query;

		if (error) {
			throw new Error("Error in getting taskrouter events", {
				cause: error,
			});
		}

		return data;
	});

export const getTaskRouterEvents = createServerFn().handler(async () => {
	const supabase = createClient();

	const { data, error } = await supabase.from("taskrouter_events").select();

	if (error) {
		throw new Error("Error in getting taskrouter events", {
			cause: error,
		});
	}

	return JSON.parse(JSON.stringify(data));
});

export const getProfile = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("profiles")
			.select()
			.eq("id", id)
			.single();

		if (error) {
			throw new Error("Error in getting profile", { cause: error });
		}

		return data;
	});

export const getProfiles = createServerFn()
	.validator((params: { search?: string; userIds?: string[] }) => params)
	.handler(async () => {
		const supabase = createClient();

		const { data, error } = await supabase.from("profiles").select();

		if (error) {
			console.error(error);
			throw new Error("Error in getting profiles", { cause: error });
		}

		return data;
	});

export const getProposal = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("proposals")
			.select("*, created_by(first_name, last_name)")
			.eq("id", id)
			.single();

		if (error) {
			throw new Error("Error in getting proposal", { cause: error });
		}

		return JSON.parse(JSON.stringify(data));
	});

export const getProposalTotals = createServerFn()
	.validator(({ id, version }: { id: string; version: string }) => ({
		id,
		version,
	}))
	.handler(async ({ data: { version, id } }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("proposal_totals")
			.select()
			.match({
				proposal_id: id,
				version_id: version,
			})
			.single();

		if (error) {
			throw new Error(
				"Error in getting proposal totals " + error.message,
				{
					cause: error,
				},
			);
		}

		return data;
	});

export const getProposalFollowers = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("proposal_followers")
			.select("...user_id(*)")
			.eq("proposal_id", id);

		if (error) {
			throw new Error(
				"Error in getting proposal followers " + error.message,
				{
					cause: error,
				},
			);
		}

		return data;
	});

export const getTickets = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("tickets")
			.select("*, tasks(*)")
			.eq("phase", id)
			.order("order")
			.order("order", { referencedTable: "tasks" });

		if (!data || error) {
			throw new Error("Error in getting tickets", { cause: error });
		}

		return data;
	});

export const getTasks = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("tasks")
			.select()
			.eq("ticket", id)
			.order("order");

		if (!data || error) {
			throw new Error("Error in getting tasks", { cause: error });
		}

		return data;
	});

export const getPhase = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("phases")
			.select("*, tickets(*, tasks(*))")
			.eq("id", id)
			.order("order", { referencedTable: "tickets" })
			.single();

		if (!data || error) {
			throw Error("Error in getting phases " + error.message, {
				cause: error,
			});
		}

		return data;
	});

export const getPhases = createServerFn()
	.validator(
		(
			{ versionId, proposalId }: {
				versionId: string;
				proposalId: string;
			},
		) => ({
			versionId,
			proposalId,
		}),
	)
	.handler(async ({ data: { versionId } }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("phases")
			.select("*, tickets(*, tasks(*))")
			.match({
				version: versionId,
			})
			.order("order")
			.order("order", { referencedTable: "tickets" })
			.throwOnError();

		console.log(data);

		return data;
	});

export const getSections = createServerFn()
	.validator(
		(
			{ versionId, proposalId }: {
				versionId: string;
				proposalId: string;
			},
		) => ({
			proposalId,
			versionId,
		}),
	)
	.handler(async ({ data: { versionId } }) => {
		const supabase = createClient();

		const { data: sections, error } = await supabase
			.from("sections")
			.select("*")
			.match({
				version: versionId,
			})
			.order("order");

		if (error) {
			throw Error("Error in getting sections + " + error.message, {
				cause: error,
			});
		}

		return JSON.parse(JSON.stringify(sections));
	});

export const getSection = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data: section, error } = await supabase
			.from("sections")
			.select("*, products(*, products(*))")
			.eq("id", id)
			.is("products.parent", null)
			.order("created_at", { referencedTable: "products" })
			.single();

		if (!section || error) {
			throw Error("Error in getting sections", { cause: error });
		}

		return JSON.parse(JSON.stringify(section));
	});

export const getSectionProducts = createServerFn()
	.validator(({ id, version }: { id: string; version: string }) => ({
		id,
		version,
	}))
	.handler(async ({ data: { id, version } }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("products")
			.select("*, products(*)")
			.match({
				section: id,
				version,
			})
			.is("parent", null)
			.order("sequence_number");

		if (error) {
			throw Error("Error in getting sections", { cause: error });
		}

		return JSON.parse(JSON.stringify(data));
	});

export const getProducts = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data: products, error } = await supabase
			.from("products")
			.select(`*, products(*, products(*))`)
			.eq("version", id)
			.is("parent", null)
			.order("sequence_number");

		if (error) {
			throw new Error("Error in getting products " + error.message, {
				cause: error,
			});
		}

		return JSON.parse(JSON.stringify(products));
	});

export const getProduct = async (id: string) => {
	const supabase = createClient();

	const { data: product, error } = await supabase
		.from("products")
		.select("*, parent(*)")
		.eq("unique_id", id)
		.single();

	if (!product || error) {
		throw Error("Error in getting product...", { cause: error });
	}

	return product;
};

export const getMembers = async () => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("organizations")
		.select("profiles(*)")
		.single();

	if (!data || error) {
		throw Error("Error in getting members", { cause: error });
	}

	return data.profiles;
};

export const getStorageFiles = createServerFn()
	.validator((data: UseSupabaseUploadOptions) => data)
	.handler(async ({ data: { bucketName, path } }) => {
		const supabase = createClient();

		const { data, error } = await supabase.storage.from(bucketName).list(
			path,
		);

		if (error) {
			throw new Error("Error in getting files" + error.message, {
				cause: error,
			});
		}

		return { data: data ?? [], count: data?.length ?? 0 };
	});

export const getStorageFile = createServerFn()
	.validator((data: UseSupabaseUploadOptions) => data)
	.handler(async ({ data: { bucketName, path } }) => {
		const supabase = createClient();

		const { data, error } = await supabase.storage
			.from(bucketName)
			.createSignedUrl(path ?? "", DAY_IN_MS / 12);

		if (error) {
			throw new Error("Error in getting files" + error.message, {
				cause: error,
			});
		}

		return data;
	});

export const getProposalSettings = createServerFn()
	.validator(({ id, version }: { id: string; version: string }) => ({
		id,
		version,
	}))
	.handler(async ({ data: { id, version } }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("proposal_settings")
			.select()
			.match({
				version,
				proposal: id,
			})
			.single();

		if (error) {
			throw new Error(
				"Error in getting proposal settings " + error.message,
				{
					cause: error,
				},
			);
		}

		return data;
	});

export const getOrganization = async () => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("organizations")
		.select("*, organization_integrations(*, integration(*))")
		.single();

	if (!data || error) {
		throw Error("Error in getting organization", { cause: error });
	}

	return data;
};

export const getIntegrations = async () => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("integrations")
		.select()
		.order("name", { ascending: true });

	if (!data || error) {
		throw Error("Error in getting integrations", { cause: error });
	}

	return data;
};

export interface ProposalQueryOptions {
	order?: keyof Proposal;
	searchText?: string;
	userFilters?: string[];
	companyFilters?: string[];
	range?: number[];
}

// export const getProposals = async (options?: ProposalQueryOptions) => {
//   const proposalsQuery = supabase
//     .from("proposals")
//     .select("*")
//     .order(options?.order ?? "updated_at", { ascending: false });

//   if (options?.searchText) {
//     proposalsQuery.textSearch("name", options.searchText, {
//       type: "plain",
//       config: "english",
//     });
//   }

//   if (options?.userFilters?.length) {
//     proposalsQuery.in(
//       "created_by",
//       options.userFilters.map((u) => u),
//     );
//   }

//   type Proposals = QueryData<typeof proposalsQuery>;

//   const { data: proposals, error } = await proposalsQuery;

//   if (error) {
//     throw new Error("Error in getting proposals", { cause: error });
//   }

//   return proposals as Proposals;
// };

export const getVersions = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("versions")
			.select()
			.eq("proposal", id)
			.order("number", { ascending: false });

		if (error || !data) {
			throw Error("Can't fetch versions...", { cause: error });
		}

		return data;
	});

export const getVersion = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("versions")
			.select()
			.eq("id", id)
			.single();

		if (error || !data) {
			throw Error("Can't fetch version...", { cause: error });
		}

		return data;
	});

export const getUsers = async () => {
	const supabase = createClient();

	try {
		const { data, error } = await supabase
			.from("profiles")
			.select("id, first_name, last_name")
			.order("first_name", { ascending: false });
		// .order('last_name', { ascending: false });

		if (error || !data) throw new Error(`Can't fetch users: ${error}`);

		return data;
	} catch (error) {
		console.error(error);
	}
};
