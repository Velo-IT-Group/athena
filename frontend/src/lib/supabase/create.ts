import type { ProjectTemplate } from "@/types/manage";
import { createClient } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/manage/read";
import { updateProposal } from "./update";
import { createServerFn } from "@tanstack/react-start";

export const createPinnedItem = createServerFn().validator((
	item: PinnedItemInsert,
) => item).handler(async ({ data: item }) => {
	const supabase = createClient();
	const { error, data } = await supabase.from("pinned_items").insert(item)
		.single();

	if (error) {
		throw new Error("Error creating pinned item " + error.message, {
			cause: error,
		});
	}

	return data;
});

export const createProposalFollower = createServerFn().validator((
	follower: ProposalFollowerInsert,
) => follower).handler(async ({ data: follower }) => {
	const supabase = createClient();
	const { error } = await supabase.from("proposal_followers").insert(
		follower,
	);

	if (error) {
		throw new Error("Error creating proposal follower " + error.message, {
			cause: error,
		});
	}
});

export const createSection = createServerFn().validator((
	section: SectionInsert,
) => section).handler(async ({ data: section }) => {
	const supabase = createClient();
	const { error } = await supabase.from("sections").insert(section);

	if (error) {
		throw new Error("Error creating section " + error.message, {
			cause: error,
		});
	}
});

// type WebToken = {
// 	user_id: string;
// 	connect_wise: {
// 		public_key: string;
// 		secret_key: string;
// 	};
// };

// export const encryptToken = createServerFn()
// 	.validator((formData: FormData) => formData)
// 	.handler(async ({ data }) => {
// 		const public_key = (data.get("public_key") as string)?.trim();
// 		const secret_key = (data.get("secret_key") as string)?.trim();
// 		const user_id = (data.get("user_id") as string)?.trim();

// 		if (!public_key || !secret_key || !user_id) {
// 			throw redirect({ to: "/login" });
// 		}

// 		const supabase = createClient();

// 		const token: WebToken = {
// 			user_id,
// 			connect_wise: { public_key, secret_key },
// 		};

// 		const value = sign(
// 			token,
// 			{},
// 		);

// 		const { error } = await supabase.from("profile_keys").insert({
// 			user_id,
// 			key: value,
// 		});

// 		if (error) throw new Error(error.message);

// 		await signInWithAzure();
// 	});

/**
 * Creates Phases, Tickets and Tasks In Supabase.
 * @param {string} proposal - The id of the proposal to add the template to.
 * @param {ProjectTemplate} template - The CW Manage object that will be used to create the phases, tickets and tasks.
 * @param {number} order - The index of the item the first template phase will be added after.
 */
export const newTemplate = createServerFn().validator(({
	template,
	order,
	version,
}: {
	template: ProjectTemplate;
	order: number;
	version: string;
}) => ({ template, order, version })).handler(
	async ({ data: { template, order, version } }) => {
		if (!template || !template.workplan || !template.workplan.phases) {
			throw new Error("Invalid template structure.");
		}

		console.log(order);

		// Await all phase creation promises
		await Promise.all(
			template.workplan.phases.map((phase, phaseIndex) =>
				createPhase(
					{
						data: {
							phase: {
								order: order + phaseIndex + 1,
								description: phase.description,
								version,
							},
							tickets: phase.tickets.map((ticket, i) => ({
								phase: "",
								summary: ticket.summary,
								budget_hours: ticket.budgetHours,
								order: i,
								tasks: ticket.tasks?.map((task, index) => {
									const taskInsert: TaskInsert = {
										notes: task.notes ?? "",
										summary: task.summary ?? "",
										priority: task.priority ?? 0,
										ticket: "",
										order: index,
									};
									console.log(taskInsert);
									return taskInsert;
								}) ?? [],
							})),
						},
					},
				)
			),
		);
	},
);

/**
 * Creates Ticket in Supabase.
 * @param {TaskInsert} task - The object that will be used to create the task.
 */
export const createTask = createServerFn().validator((task: TaskInsert) => task)
	.handler(async ({ data: task }) => {
		const supabase = createClient();
		const { error } = await supabase.from("tasks").insert(task);
		console.log("CREATE TASK FUNCTION", task);

		if (error) {
			console.error(error);
			throw new Error("Error creating task.", { cause: error });
		}
	});

/**
 * Creates Tasks in Supabase.
 * @param {TaskInsert[]} tasks - The object that will be used to create the task.
 */
export const createTasks = createServerFn().validator((tasks: TaskInsert[]) =>
	tasks
)
	.handler(async ({ data: tasks }) => {
		const supabase = createClient();
		const { error } = await supabase.from("tasks").insert(tasks);

		if (error) {
			throw new Error("Error creating tasks... " + error.message, {
				cause: error,
			});
		}
	});

/**
 * Creates Proposal in Supabase.
 * @param {ProposalInsert} proposal - The object that will be used to create the task.
 */
export const createProposal = createServerFn().validator((
	proposal: ProposalInsert,
) => proposal)
	.handler(async ({ data: proposal }) => {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("proposals")
			.insert(proposal)
			.select("id, organization(slug)")
			.returns<{ id: string; organization: { slug: string } }[]>()
			.single();

		if (error || !data) {
			throw new Error("Error creating proposal.", { cause: error });
		}

		const version = await createVersion({ data: data.id });
		await createSection({ data: { name: "Hardware", version, order: 0 } });
		await createProposalSettings({
			data: {
				proposal: data.id,
				version,
				assumptions:
					"<p>The following assumptions were used to frame this proposal. Should these assumptions not hold true, Velo will provide you with options for proceeding and come to an agreement regarding any changes to the schedule, deliverables, or investment before proceeding.</p><ol><li><p>All work will be completed during business hours (0800-1700 CST)</p></li><li><p>Any changes to the agreed-upon project scope after the initiation phase will require a formal change request, possibly leading to adjustments in cost and timeline.</p></li><li><p>Any work that requires downtime will be scheduled with client to be completed either after hours or when the downtime is allowed.&nbsp; Client will manage communications to all end users in timely manner.</p></li><li><p>Key stakeholders, including project sponsors and high-level management, will provide the necessary support and backing for the project.</p></li><li><p>Criteria for what constitutes a successful project completion have been clearly defined in the scope and business outcome, with communication to all involved parties.</p></li><li><p>External vendors or third-party solutions will deliver on their commitments within the stipulated timeframes and specifications.</p></li></ol>",
			},
		});

		if (proposal.templates_used && proposal.templates_used.length) {
			const templates = await Promise.all(
				proposal.templates_used.map(getTemplate),
			);

			if (templates && templates.length) {
				await Promise.all(
					templates.map((template) =>
						newTemplate({
							data: {
								template: template!,
								order: 0,
								version,
							},
						})
					),
				);
			}
		}

		return { id: data.id, version };
	});

export const duplicateProposal = createServerFn().validator((
	proposal: ProposalInsert,
) => proposal)
	.handler(async ({ data: proposal }) => {
		const supabase = createClient();
		delete proposal["updated_at"];
		delete proposal["fts"];

		const { data: returnedProposal, error } = await supabase
			.from("proposals")
			.insert({
				...proposal,
				name: `${proposal.name} - Copy`,
				working_version: null,
				id: undefined,
			})
			.select("id")
			.returns<Array<{ id: string }>>()
			.single();

		if (error || !returnedProposal) {
			console.log(error);
			throw new Error("Error duplicating proposal.", { cause: error });
		}

		const version = await createVersion({ data: returnedProposal.id });

		console.log(version, proposal?.working_version);

		await supabase.rpc("copy_version_data", {
			old_version: proposal.id ?? "",
			new_version: version,
		});

		return version;
	});

export const createPhase = createServerFn().validator((
	{ phase, tickets }: {
		phase: PhaseInsert;
		tickets: Array<TicketInsert & { tasks?: Array<TaskInsert> }>;
	},
) => ({ phase, tickets })).handler(async ({ data: { phase, tickets } }) => {
	const supabase = createClient();
	// @ts-ignore
	delete phase.tickets;
	const { data, error } = await supabase.from("phases").insert(phase).select()
		.single();

	if (error) {
		console.error(error);
		throw new Error("Error creating phase... " + error.message, {
			cause: error,
		});
	}

	if (tickets.length) {
		const seteteled = await Promise.allSettled(
			tickets.map((ticket) => {
				const ticketTasks = ticket.tasks;
				delete ticket.tasks;
				console.log(ticketTasks, ticket);
				return createTicket({
					data: {
						ticket: {
							...ticket,
							phase: data.id,
						},
						tasks: ticketTasks ?? [],
					},
				});
			}),
		);

		seteteled.map((result) => {
			if (result.status === "rejected") {
				throw new Error("Error creating ticket... " + result.reason);
			}
		});
	}

	return data;
});

export const createProposalSettings = createServerFn().validator((
	data: ProposalSettingsInsert,
) => data).handler(async ({ data }) => {
	try {
		const supabase = createClient();
		const { error } = await supabase.from("proposal_settings").insert(data);

		if (error) {
			console.error(error);
			throw new Error("Error creating phase.", { cause: error });
		}
	} catch (error) {
		console.error("createPhase Error:", error);
		throw error; // Rethrow the error after logging it
	}
});

export const createTicket = createServerFn().validator(({
	ticket,
	tasks,
}: {
	ticket: TicketInsert;
	tasks: Array<TaskInsert>;
}) => ({ ticket, tasks })).handler(async ({ data: { ticket, tasks } }) => {
	const supabase = createClient();

	const { data, error } = await supabase.from("tickets").insert(ticket)
		.select().single();

	if (error) {
		console.error(error);
		throw new Error("Error creating ticket... " + error.message, {
			cause: error,
		});
	}

	if (tasks?.length) {
		const seteteled = await Promise.allSettled(
			tasks.map((task) =>
				createTask({
					data: {
						...task,
						ticket: data.id,
					},
				})
			),
		);

		seteteled.map((result) => {
			if (result.status === "rejected") {
				throw new Error("Error creating task... " + result.reason);
			}
		});
	}

	return data;
});

export const createProduct = createServerFn().validator(({
	product,
	bundledItems,
}: {
	product: ProductInsert;
	bundledItems?: ProductInsert[];
}) => ({ product, bundledItems })).handler(
	async ({ data: { product, bundledItems } }) => {
		const supabase = createClient();

		const { data, error } = await supabase.from("products").insert(product)
			.select("unique_id").single();

		if (error || !data) {
			throw new Error("Error creating product" + error.message, {
				cause: error,
			});
		}

		if (bundledItems && bundledItems.length) {
			await createProducts(
				{
					data: bundledItems.map((item) => ({
						...item,
						parent: data.unique_id,
					})),
				},
			);
		}

		return data;
	},
);

export const createProducts = createServerFn().validator((
	products: ProductInsert[],
) => products)
	.handler(async ({ data: products }) => {
		const supabase = createClient();

		const { error } = await supabase.from("products").insert(products);

		if (error) {
			throw new Error("Error creating products" + error.message, {
				cause: error,
			});
		}
	});

export const createOrganizationIntegration = createServerFn().validator((
	organization: OrganizationIntegrationInsert,
) => organization)
	.handler(async ({ data: organization }) => {
		const supabase = await createClient();
		const { error } = await supabase.from("organization_integrations")
			.insert(organization);

		if (error) {
			throw new Error(
				"Error creating organization integration. " + error.message,
				{
					cause: error,
				},
			);
		}
	});

interface MetaData {
	first_name: string;
	last_name: string;
	manage_reference_id: number;
}

export const signUp = createServerFn().validator((
	formData: FormData,
	data?: MetaData,
) => ({ formData, data })).handler(async ({ data: { formData, data } }) => {
	// const origin = (await headers()).get('origin');
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	const supabase = await createClient();

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${origin}/auth/callback`,
			data,
		},
	});

	if (error) {
		throw Error(error.message, { cause: error.cause });
	}

	// return redirect('/login?message=Check email to continue sign in process');
});

export const createVersion = createServerFn().validator((proposal: string) =>
	proposal
).handler(async ({ data: proposal }) => {
	const supabase = createClient();

	const { data, error } = await supabase.from("versions").insert({
		proposal,
	}).select("id").single();

	if (error || !data) {
		throw new Error("Can't create version");
	}

	await updateProposal({
		data: { id: proposal, proposal: { working_version: data.id } },
	});

	// revalidatePath('/proposals');
	return data.id;
});

// Call the function for each phase
export const duplicateTicket = createServerFn().validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();
		const [{ data: ticket }, { data: tasks }] = await Promise.all([
			supabase.from("tickets").select().eq("id", id).single(),
			supabase.from("tasks").select().eq("ticket", id),
		]);

		if (!ticket) return;

		const ticketInsert: TicketInsert = {
			...ticket,
			order: ticket.order + 1,
		};
		delete ticketInsert["id"];
		delete ticketInsert["created_at"];

		const remappedTasks = tasks?.map((task) => {
			const taskInsert: TaskInsert = task;
			delete taskInsert["id"];
			delete taskInsert["created_at"];
			return taskInsert;
		}) || [];

		// await createTicket({ ...ticketInsert, phase: ticket.phase }, remappedTasks);
		await createTicket({
			data: {
				ticket: { ...ticketInsert, phase: ticket.phase },
				tasks: remappedTasks,
			},
		});
	});

// const getURL = () => {
// 	const vercelEnv = env.VERCEL_ENV;
// 	const stagingUrl = "staging.athena.velomethod.com";

// 	let url = !vercelEnv
// 		? "http://localhost:3000"
// 		: vercelEnv === "preview"
// 		? stagingUrl
// 		: productionUrl;

// 	// Make sure to include `https://` when not localhost.
// 	url = url.startsWith("http") ? url : `https://${url}`;
// 	// Make sure to include a trailing `/`.
// 	url = url.endsWith("/") ? url : `${url}`;
// 	return url;
// };

// export const signInWithAzure = createServerFn().handler(async () => {
// 	const supabase = createClient();
// 	console.log("signInWithAzure");
// 	const { data, error } = await supabase.auth.signInWithOAuth({
// 		provider: "azure",
// 		options: {
// 			scopes:
// 				"openid profile email User.Read Calendars.ReadBasic Calendars.Read Calendars.ReadWrite",
// 			redirectTo: `${getURL()}/auth/callback`,
// 		},
// 	});

// 	if (error) throw new Error(error.message);

// 	if (data.url) {
// 		return redirect({ href: data.url }); // use the redirect API for your server framework
// 	}
// });
