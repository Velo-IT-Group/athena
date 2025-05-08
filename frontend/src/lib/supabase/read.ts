import { DAY_IN_MS } from "@/components/template-catalog";
import type { UseSupabaseUploadOptions } from "@/hooks/use-supabase-upload";
import { createClient } from "@/lib/supabase/server";
import { createServerFn } from "@tanstack/react-start";

interface PinnedItemOptions {
	record_type: string;
	params: Record<string, string>;
}

export type EngagementQueryOptions = { call_date?: string | string[] };

export const getEngagementSummaryByPeriod = createServerFn()
	.validator((options?: EngagementQueryOptions) => options)
	.handler(async ({ data: options }) => {
		const supabase = createClient();

		const query = supabase
			.schema("reporting")
			.from("call_summary_by_period")
			.select();

		if (options?.call_date) {
			if (Array.isArray(options.call_date)) {
				query.gte("call_date", options.call_date[0]);
				query.lt("call_date", options.call_date[1]);
			} else if (options.call_date) {
				query.eq("call_date", options.call_date);
			}
		}

		query.order("call_date");

		query.range(0, 1);

		console.log(query);

		const { data, error } = await query;

		if (error) {
			throw new Error(
				"Error in getting call summary by period " + error.message,
				{
					cause: error,
				},
			);
		}

		return data;
	});

export const getEngagements = createServerFn()
	.validator((options?: EngagementQueryOptions) => options)
	.handler(async ({ data: options }) => {
		const supabase = createClient();

		const query = supabase
			.schema("reporting")
			.from("engagements")
			.select(
				"*, reservations:engagement_reservations(*)",
				{ count: "exact" },
			);

		if (options?.call_date) {
			if (Array.isArray(options.call_date)) {
				query.gte("created_at", options.call_date[0]);
				query.lt("created_at", options.call_date[1]);
			} else if (options.call_date) {
				query.eq("created_at", options.call_date);
			}
		}

		query.order("created_at", { ascending: false });

		query.range(0, 25);

		const { data, error, count } = await query;

		if (error) {
			throw new Error("Error in getting engagements " + error.message, {
				cause: error,
			});
		}

		return JSON.parse(
			JSON.stringify({ data: data ?? [], count: count ?? 0 }),
		);
	});

export const getEngagement = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
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

export const getPinnedItems = createServerFn()
	.handler(async ({ data }) => {
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

export const getProposals = createServerFn()
	.validator((options?: ProposalQueryOptions) => options)
	.handler(async ({ data }) => {
		const supabase = createClient();

		const proposalsQuery = supabase
			.from("proposals")
			.select("*", { count: "exact" });

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
			proposalsQuery.in(
				"company_id",
				data?.companyFilters.map((u) => Number(u)),
			);
		}

		const { data: proposals, error, count } = await proposalsQuery;

		if (error) {
			throw new Error("Error in getting proposals", { cause: error });
		}

		return { data: JSON.parse(JSON.stringify(proposals)), count: count };
	});

export const getConversations = createServerFn()
	.validator((
		{ contactId, companyId, workerId, limit }: {
			contactId?: number;
			companyId?: number;
			workerId?: string;
			limit?: number;
		},
	) => ({ contactId, companyId, workerId, limit }))
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

export const getTaskRouterEvents = createServerFn()
	.handler(async () => {
		const supabase = createClient();

		const { data, error } = await supabase.from("taskrouter_events")
			.select();

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

		const { data, error } = await supabase.from("profiles").select().eq(
			"id",
			id,
		).single();

		if (error) {
			console.error(error);
			throw new Error("Error in getting profile", { cause: error });
		}

		return data;
	});

export const getProfilePhoneNumber = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase.from("phone_numbers").select()
			.eq(
				"assigned_to",
				id,
			).single();

		if (error) {
			console.error(error);
			throw new Error("Error in getting profile", { cause: error });
		}

		return data;
	});

export const getProfiles = createServerFn().handler(async () => {
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

		const { data, error } = await supabase.from("proposals").select()
			.eq("id", id).single();

		if (error) {
			throw new Error("Error in getting proposal", { cause: error });
		}

		return JSON.parse(JSON.stringify(data));
	});

export const getTeams = createServerFn().handler(async () => {
	const supabase = createClient();

	const { data, error } = await supabase.from("teams").select();

	if (error) {
		throw new Error("Error in getting teams", { cause: error });
	}

	return data;
});

export const getTickets = async (
	id: string,
): Promise<Array<Ticket & { tasks: Task[] }>> => {
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
};

export const getTasks = createServerFn().validator((id: string) => id).handler(
	async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase.from("tasks").select().eq(
			"ticket",
			id,
		).order("order");

		if (!data || error) {
			throw new Error("Error in getting tickets", { cause: error });
		}

		return data;
	},
);

export const getPhases = createServerFn().validator((id: string) => id).handler(
	async ({ data: id }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("phases")
			.select("*, tickets(*, tasks(*))")
			.eq("version", id)
			.order("order")
			.order("order", { referencedTable: "tickets" });

		if (!data || error) {
			throw Error("Error in getting phases", { cause: error });
		}

		return data;
	},
);

export const getSections = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { data: sections, error } = await supabase
			.from("sections")
			.select("*, products(*, products(*))")
			.eq("version", id)
			.is("products.parent", null)
			.order("order")
			.order("order", { referencedTable: "products" });

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

		const { data: section, error } = await supabase
			.from("products")
			.select("*, products(*, products(*))")
			.match({
				section: id,
				version,
			})
			.is("parent", null)
			.order("sequence_number");

		if (!section || error) {
			throw Error("Error in getting sections", { cause: error });
		}

		return JSON.parse(JSON.stringify(section));
	});

export const getProducts = createServerFn().validator((id: string) => id)
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

	const { data, error } = await supabase.from("organizations").select(
		"profiles(*)",
	).single();

	if (!data || error) {
		throw Error("Error in getting members", { cause: error });
	}

	return data.profiles;
};

export const getStorageFiles = createServerFn().validator((
	data: UseSupabaseUploadOptions,
) => data).handler(async ({ data: { bucketName, path } }) => {
	const supabase = createClient();

	const { data, error } = await supabase.storage
		.from(bucketName)
		.list(path);

	if (error) {
		throw new Error("Error in getting files" + error.message, {
			cause: error,
		});
	}

	return { data: data ?? [], count: data?.length ?? 0 };
});

export const getStorageFile = createServerFn().validator((
	data: UseSupabaseUploadOptions,
) => data).handler(async ({ data: { bucketName, path } }) => {
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

export const getProposalSettings = createServerFn().validator((
	{ id, version }: { id: string; version: string },
) => ({ id, version })).handler(async ({ data: { id, version } }) => {
	const supabase = createClient();
	console.log(version, id);

	const { data, error } = await supabase.from("proposal_settings")
		.select().match({
			version,
			proposal: id,
		}).single();

	console.log(data);

	if (error) {
		throw new Error("Error in getting proposal settings " + error.message, {
			cause: error,
		});
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

	const { data, error } = await supabase.from("integrations").select().order(
		"name",
		{ ascending: true },
	);

	if (!data || error) {
		throw Error("Error in getting integrations", { cause: error });
	}

	return data;
};

export type ProposalQueryOptions = {
	order?: keyof Proposal;
	searchText?: string;
	userFilters?: string[];
	companyFilters?: string[];
};

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

export const getVersions = createServerFn().validator((id: string) => id)
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

export const getVersion = async (id: string) => {
	const supabase = createClient();

	const { data, error } = await supabase.from("versions").select().eq(
		"id",
		id,
	).single();

	if (error || !data) {
		throw Error("Can't fetch version...", { cause: error });
	}

	return data;
};

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
