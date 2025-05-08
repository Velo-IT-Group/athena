import { createClient } from "@/lib/supabase/server";
import type { UserMetadata } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";

export const updateProposalSettings = createServerFn().validator((
  { version, settings }: { version: string; settings: ProposalSettingsUpdate },
) => ({ version, settings })).handler(
  async ({ data: { version, settings } }) => {
    const supabase = createClient();
    const { error } = await supabase.from("proposal_settings").update(settings)
      .eq(
        "version",
        version,
      );

    if (error) {
      throw new Error("Error updating proposal settings " + error.message, {
        cause: error,
      });
    }
  },
);

export const updatePinnedItem = createServerFn().validator((
  { id, item }: { id: string; item: PinnedItemUpdate },
) => ({ id, item })).handler(async ({ data: { id, item } }) => {
  const supabase = createClient();
  const { error } = await supabase.from("pinned_items").update(item).eq(
    "id",
    id,
  );

  if (error) {
    throw new Error("Error updating pinned item " + error.message, {
      cause: error,
    });
  }
});

/**
 * Updates Product In Supabase.
 * @param {string} id - The id of the product.
 * @param {ProductUpdate} product - The product you're wanting to update.
 */
export const updateProduct = createServerFn().validator((
  { id, product }: { id: string; product: ProductUpdate },
) => ({ id, product })).handler(async ({ data: { id, product } }) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update(product)
    .eq("unique_id", id);

  console.log(id, product, error);
  console.log("running func");

  if (error) {
    console.error(error);
    throw Error("Error updating product...", { cause: error });
  }
});

/**
 * Updates Proposal In Supabase.
 * @param {string} id - The id of the proposal you're wanting to update.
 * @param {ProposalUpdate} proposal - The proposal you're wanting to update.
 */
export const updateProposal = createServerFn().validator((
  { id, proposal }: { id: string; proposal: ProposalUpdate },
) => ({ id, proposal })).handler(async ({ data: { id, proposal } }) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("proposals")
    .update(proposal)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Error updating proposal " + error.message, {
      cause: error,
    });
  }
});

/**
 * Updates Ticket In Supabase.
 * @param {string} id - The id of the ticket you're wanting to update.
 * @param {TicketUpdate} ticket - The ticket you're wanting to update.
 */
export const updateTicket = createServerFn().validator((
  { id, ticket }: { id: string; ticket: TicketUpdate },
) => ({ id, ticket })).handler(async ({ data: { id, ticket } }) => {
  const supabase = createClient();
  const { error } = await supabase.from("tickets").update(ticket).eq("id", id);

  if (error) {
    console.error(error);
    return;
  }
});

/**
 * Upsert Ticket In Supabase.
 * @param {string} id - The id of the ticket you're wanting to update.
 * @param {TicketUpdate} ticket - The ticket you're wanting to update.
 */
export const upsertTickets = createServerFn().validator((
  { ticket }: { ticket: TicketInsert | TicketInsert[] },
) => ({ ticket })).handler(async ({ data: { ticket } }) => {
  const supabase = await createClient();
  // @ts-ignore
  const { error } = await supabase.from("tickets").upsert(ticket);

  if (error) {
    console.error(error);
    return;
  }
});

/**
 * Upsert Ticket In Supabase.
 * @param {string} id - The id of the ticket you're wanting to update.
 * @param {TicketUpdate} ticket - The ticket you're wanting to update.
 */
export const upsertTasks = createServerFn().validator((
  { task }: { task: TaskInsert | TaskInsert[] },
) => ({ task })).handler(async ({ data: { task } }) => {
  const supabase = createClient();
  // @ts-ignore
  const { error } = await supabase.from("tasks").upsert(task);

  if (error) {
    console.error(error);
    return;
  }
});

/**
 * Updates Phase In Supabase.
 * @param {string} id - The id of the phase you're wanting to update.
 * @param {PhaseUpdate} phase - The phase you're wanting to update.
 */
export const updatePhase = createServerFn().validator((
  { id, phase }: { id: string; phase: PhaseUpdate },
) => ({ id, phase })).handler(async ({ data: { id, phase } }) => {
  const supabase = createClient();
  console.log(id, phase);
  const { error } = await supabase.from("phases").update(phase).eq("id", id);

  if (error) {
    throw new Error("Error updating phase " + error.message, { cause: error });
  }
});

export const upsertPhase = createServerFn().validator((
  { phase }: { phase: PhaseInsert | PhaseInsert[] },
) => ({ phase })).handler(async ({ data: { phase } }) => {
  const supabase = createClient();
  // @ts-ignore
  const { error } = await supabase.from("phases").upsert(phase);

  if (error) {
    console.error(error);
    return;
  }
});

/**
 * Updates Task In Supabase.
 * @param {string} id - The id of the task you're wanting to update.
 * @param {TaskUpdate} task - The task you're wanting to update.
 */
export const updateTask = createServerFn().validator((
  { id, task }: { id: string; task: TaskUpdate },
) => ({ id, task })).handler(async ({ data: { id, task } }) => {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").update(task).eq("id", id);

  if (error) {
    console.error(error);
    return;
  }
});

/**
 * Updates Organization In Supabase.
 * @param {string} id - The id of the organization you're wanting to update.
 * @param {OrganizationUpdate} organization - The organization you're wanting to update.
 */
export const updateOrganization = createServerFn().validator((
  { id, organization }: { id: string; organization: OrganizationUpdate },
) => ({ id, organization })).handler(async ({ data: { id, organization } }) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("organizations")
    .update(organization)
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }
});

/**
 * Updates Organization's Integration In Supabase.
 * @param {string} id - The id of the organization's integration you're wanting to update.
 * @param {OrganizationIntegrationUpdate} orgIntegration - The organization's integration you're wanting to update.
 */
export const updateOrganizationIntegration = createServerFn().validator((
  { id, orgIntegration }: {
    id: string;
    orgIntegration: OrganizationIntegrationUpdate;
  },
) => ({ id, orgIntegration })).handler(
  async ({ data: { id, orgIntegration } }) => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("organization_integrations")
      .update(orgIntegration)
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }
  },
);

// export const updateHomeSortCookie = (sort: keyof Proposal) => {
// 	const cookieStore = cookies() as unknown as UnsafeUnwrappedCookies;
// 	cookieStore.set('homeSort', sort);
// 	revalidateTag('proposals');
// };

// export const updateMyProposalsCookie = (ids: string[]) => {
// 	// const cookieStore = (cookies() as unknown as UnsafeUnwrappedCookies);

// 	// if (ids.length) {
// 	// 	cookieStore.set('myProposals', JSON.stringify(ids));
// 	// } else {
// 	// 	cookieStore.delete('myProposals');
// 	// }
// 	revalidatePath('/');
// };

export const updateSection = createServerFn().validator((
  { id, section }: { id: string; section: SectionUpdate },
) => ({ id, section })).handler(async ({ data: { id, section } }) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("sections")
    .update(section)
    .eq("id", id);

  console.log("SECTION ID", section.id);

  if (error) {
    throw Error("Error updating section...", { cause: error });
  }
});

export const upsertSection = createServerFn().validator((
  { section }: { section: SectionInsert },
) => ({ section })).handler(async ({ data: { section } }) => {
  const supabase = createClient();
  const { error } = await supabase.from("sections").upsert(section);
  // .eq('id', section.id!)

  console.log("SECTION ID", section.id);

  if (error) {
    throw Error("Error updating section...", { cause: error });
  }
});

export const updateVersion = createServerFn().validator((
  { id, version }: { id: string; version: VersionUpdate },
) => ({ id, version })).handler(async ({ data: { id, version } }) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("versions")
    .update(version)
    .eq("id", version.id!);

  console.log("SECTION ID", version.id);

  if (error) {
    throw Error("Error updating version...", { cause: error });
  }
});

export const updateUserMetadata = createServerFn().validator((
  { data, user_metadata }: { data: FormData; user_metadata: UserMetadata },
) => ({ data, user_metadata })).handler(
  async ({ data: { data, user_metadata } }) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      data: {
        ...user_metadata,
        first_name: data.get("first_name") as string,
        last_name: data.get("last_name") as string,
      },
    });

    if (error) throw Error("Error updating profile", { cause: error.message });
  },
);
