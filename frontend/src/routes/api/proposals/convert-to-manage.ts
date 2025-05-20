import {
    convertOpportunityToProject,
    createManageProduct,
    createOpportunity,
} from "@/lib/manage/create";
import { createClient } from "@/lib/supabase/server";
import {
    createProductSchema,
    type Opportunity,
    type Project,
    type ServiceTicket,
} from "@/types/manage";
import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { rateLimit } from "@tanstack/pacer";
import type { z } from "zod";

const rateLimitedApi = rateLimit(
    (product: z.infer<typeof createProductSchema>) =>
        createManageProduct({ data: product }),
    {
        limit: 5,
        window: 5 * 1000, // 5 seconds in milliseconds
        // windowType: 'fixed', // default
        onReject: (rateLimiter) => {
            console.log(
                `Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
            );
        },
    },
);

type ConvertToManageRequest = {
    proposalId: string;
    versionId: string;
};

export const APIRoute = createAPIFileRoute("/api/proposals/convert-to-manage")({
    POST: async ({ request, params }) => {
        const { proposalId, versionId }: ConvertToManageRequest = await request
            .json();

        if (!proposalId || !versionId) {
            return json({ error: "proposalId and versionId are required" }, {
                status: 400,
            });
        }

        const supabase = createClient();

        const { error: proposalUpdateError } = await supabase.from("proposals")
            .update({ is_getting_converted: true }).eq(
                "id",
                proposalId,
            );

        if (proposalUpdateError) {
            return json({ error: proposalUpdateError.message }, {
                status: 500,
            });
        }

        const [
            { data: proposal, error: proposalError },
            { data: products, error: productsError },
            { data: phases, error: phasesError },
        ] = await Promise.all([
            supabase.from("proposals").select(
                "*, created_by(system_member_id)",
            ).eq(
                "id",
                proposalId,
            ).single(),
            supabase.from("products").select("*").eq(
                "version",
                versionId,
            ),
            supabase.from("phases").select("*, tickets(*, tasks(*))").eq(
                "version",
                versionId,
            ),
        ]);

        if (proposalError || productsError || phasesError) {
            return json({
                error: proposalError?.message || productsError?.message ||
                    phasesError?.message,
            }, { status: 500 });
        }

        let opportunity: Opportunity | undefined;

        if (!proposal.opportunity_id) {
            opportunity = await createOpportunity({
                data: {
                    name: proposal.name,
                    type: { id: 5 },
                    primarySalesRep: {
                        id: proposal.created_by?.system_member_id ?? -1,
                    },
                    company: { id: proposal.company_id ?? -1 },
                    contact: { id: proposal.contact_id ?? -1 },
                    stage: { id: 6 },
                    status: { id: 2 },
                },
            });
        }

        if (!opportunity) {
            return json({ error: "Couldn't create opportunity..." }, {
                status: 500,
            });
        }

        await supabase.from("proposals").update({
            opportunity_id: opportunity.id,
        }).eq(
            "id",
            proposalId,
        );

        // Create default service product
        if (!products.some((product) => product.id === 15)) {
            await createManageProduct(
                {
                    data: {
                        catalogItem: { id: 15 },
                        price: proposal.labor_rate,
                        quantity: phases.reduce(
                            (acc, current) => acc + current.hours,
                            0,
                        ),
                        billableOption: "Billable",
                    },
                },
            );
        }

        // Create all products
        const createdProducts = await Promise.all(
            products.map((product) =>
                rateLimitedApi({
                    catalogItem: { id: product.id! },
                    opportunity: { id: opportunity.id },
                    quantity: product.quantity,
                    price: product.price ?? undefined,
                    cost: product.cost ?? undefined,
                    billableOption: "Billable",
                })
            ),
        );

        let project: Project | undefined;

        if (!proposal.project_id) {
            project = await convertOpportunityToProject({
                data: {
                    id: opportunity.id,
                    body: {
                        includeAllProductsFlag: true,
                        board: {
                            id: 1,
                        },
                        estimatedStart: new Date().toISOString(),
                        estimatedEnd: new Date().toISOString(),
                    },
                },
            });
        }

        await supabase.from("proposals")
            .update({ project_id: project?.id }).eq(
                "id",
                proposalId,
            );

        await supabase.from("proposals")
            .update({ is_getting_converted: false }).eq(
                "id",
                proposalId,
            );

        return json({ message: "Success" });
    },
});
