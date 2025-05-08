import { createClient } from "@/lib/supabase/server";
import { createServerFn } from "@tanstack/react-start";

export const deletePinnedItem = createServerFn().validator((id: string) => id)
	.handler(async ({ data: id }) => {
		console.log("deletePinnedItem", id);
		const supabase = createClient();
		const { error } = await supabase.from("pinned_items").delete().eq(
			"id",
			id,
		);

		if (error) {
			throw new Error("Error deleting pinned item " + error.message, {
				cause: error,
			});
		}
	});

export const deleteProposal = createServerFn().validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();
		const { error } = await supabase.from("proposals").delete().eq(
			"id",
			id,
		);

		if (error) {
			throw new Error("Error deleting proposal " + error.message, {
				cause: error,
			});
		}
	});

export const deleteProduct = createServerFn().validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { error } = await supabase.from("products").delete().eq(
			"unique_id",
			id,
		);

		if (error) {
			console.error(error);
			throw error;
		}
	});

export const deleteTicket = createServerFn().validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { error } = await supabase.from("tickets").delete().eq("id", id);

		if (error) {
			console.error(error);
			return;
		}
	});

export const deletePhase = createServerFn().validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { error } = await supabase.from("phases").delete().eq("id", id);

		if (error) {
			console.error(error);
			return;
		}
	});

export const deleteSection = createServerFn().validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { error } = await supabase.from("sections").delete().eq("id", id);

		if (error) {
			console.error(error);
			return;
		}
	});

export const deleteTask = createServerFn().validator((id: string) => id)
	.handler(async ({ data: id }) => {
		const supabase = createClient();

		const { error } = await supabase.from("tasks").delete().eq("id", id);

		if (error) {
			console.error(error);
			return;
		}
	});
