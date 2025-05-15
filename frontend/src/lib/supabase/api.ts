import { DAY_IN_MS } from "@/components/template-catalog";
import type { UseSupabaseUploadOptions } from "@/hooks/use-supabase-upload";
import {
    type EngagementQueryOptions,
    getConversations,
    getEngagementReservations,
    getEngagements,
    getEngagementSummaryByPeriod,
    getNotifications,
    getPhase,
    getPhases,
    getPinnedItem,
    getPinnedItems,
    getProducts,
    getProfiles,
    getProposal,
    getProposalFollowers,
    getProposals,
    getProposalSettings,
    getProposalTotals,
    getSection,
    getSectionProducts,
    getSections,
    getStorageFile,
    getStorageFiles,
    getTasks,
    getTeams,
    getTemplate,
    getTemplates,
    getTickets,
    getVersions,
    type ProposalQueryOptions,
} from "@/lib/supabase/read";
import { baseHeaders } from "@/utils/manage/params";
import { env } from "@/lib/utils";
import { FileObject } from "@supabase/storage-js";
import { queryOptions } from "@tanstack/react-query";
import type { ProjectWorkPlan } from "@/types/manage";
import type { ProjectTemplate } from "@/types/manage";
import { createClient } from "@/lib/supabase/server";
import { createServerFn } from "@tanstack/react-start";

export const getSectionProductsQuery = (
    {
        sectionId,
        versionId,
        proposalId,
    }: {
        sectionId: string;
        versionId: string;
        proposalId: string;
    },
) => queryOptions({
    queryKey: [
        "proposals",
        proposalId,
        versionId,
        "sections",
        sectionId,
        "products",
    ],
    queryFn: () =>
        getSectionProducts({ data: { id: sectionId, version: versionId } }),
});

export const getEngagementSummaryByPeriodQuery = (
    options?: EngagementQueryOptions,
) => queryOptions({
    queryKey: ["engagements", "call_summary_by_period", options],
    queryFn: () =>
        getEngagementSummaryByPeriod({
            data: options,
        }),
});

export const getProposalQuery = (
    id: string,
    version: string,
) => queryOptions({
    queryKey: ["proposals", id, version],
    queryFn: () => getProposal({ data: id }) as Promise<NestedProposal>,
    staleTime: Infinity,
    gcTime: DAY_IN_MS,
});

export const getProposalFollowersQuery = (
    id: string,
    version: string,
) => queryOptions({
    queryKey: ["proposals", id, version, "followers"],
    queryFn: () => getProposalFollowers({ data: id }),
    staleTime: Infinity,
    gcTime: DAY_IN_MS,
});

export const getProposalsQuery = (
    options?: ProposalQueryOptions,
) => queryOptions({
    queryKey: ["proposals", options],
    queryFn: () => getProposals({ data: options }),
    staleTime: Infinity,
});

export const getProposalSettingsQuery = (
    id: string,
    version: string,
) => queryOptions({
    queryKey: ["proposals", id, version, "settings"],
    queryFn: () => getProposalSettings({ data: { id, version } }),
});

export const getEngagementsQuery = (
    options?: EngagementQueryOptions,
) => queryOptions({
    queryKey: ["engagements", options],
    queryFn: () =>
        getEngagements({ data: options }) as Promise<
            { data: NestedEngagement[]; count: number }
        >,
    staleTime: Infinity,
});

export const getStorageFilesQuery = (
    options: UseSupabaseUploadOptions,
) => queryOptions({
    queryKey: ["storage-files", options],
    queryFn: () => getStorageFiles({ data: options }),
});

export const getProposalTotalsQuery = (id: string, version: string) =>
    queryOptions({
        queryKey: ["proposals", id, version, "totals"],
        queryFn: () => getProposalTotals({ data: { id, version } }),
        staleTime: Infinity,
    });

export const getVersionsQuery = (id: string) =>
    queryOptions({
        queryKey: ["versions", id],
        queryFn: () => getVersions({ data: id }) as Promise<Version[]>,
        staleTime: Infinity,
    });

export const getPinnedItemQuery = (params: Record<string, string>) =>
    queryOptions({
        queryKey: ["pinned_items", params],
        queryFn: () => getPinnedItem({ data: params }) as Promise<PinnedItem>,
        staleTime: Infinity,
        gcTime: DAY_IN_MS,
    });

export const getPinnedItemsQuery = () =>
    queryOptions({
        queryKey: ["pinned_items"],
        queryFn: getPinnedItems as () => Promise<PinnedItem[]>,
        staleTime: Infinity,
        gcTime: DAY_IN_MS,
    });

export const getTeamsQuery = () =>
    queryOptions({
        queryKey: ["teams"],
        queryFn: getTeams,
        staleTime: Infinity,
    });

export const getAttachmentsQuery = (id: string) =>
    queryOptions(
        {
            queryKey: ["attachments", id],
            queryFn: () =>
                getStorageFiles({
                    data: { bucketName: "attachments", path: id },
                }) as Promise<{ data: FileObject[]; count: number }>,
        },
    );

export const getRecordingUrlQuery = (id: string) =>
    queryOptions(
        {
            queryKey: ["attachments", "recordings", id],
            queryFn: () =>
                getStorageFile({
                    data: { bucketName: "attachments", path: id },
                }),
        },
    );

export const getEngagementReservationsQuery = (id: string) =>
    queryOptions({
        queryKey: ["engagement-reservations", id],
        queryFn: () => getEngagementReservations({ data: id }),
        staleTime: Infinity,
    });

export const getNotificationsQuery = () =>
    queryOptions({
        queryKey: ["notifications"],
        queryFn: () => getNotifications() as Promise<AppNotification[]>,
        staleTime: Infinity,
    });

export const getProductsQuery = (id: string) =>
    queryOptions({
        queryKey: ["sections", id, "products"],
        queryFn: () => getProducts({ data: id }) as Promise<NestedProduct[]>,
    });

export const getSectionQuery = (
    sectionId: string,
) => queryOptions({
    queryKey: ["sections", sectionId],
    queryFn: () =>
        getSection({ data: sectionId }) as Promise<
            NestedSection
        >,
});

export const getSectionsQuery = (
    proposalId: string,
    versionId: string,
) => queryOptions({
    queryKey: ["proposals", proposalId, versionId, "sections"],
    queryFn: () =>
        getSections({ data: { versionId, proposalId } }) as Promise<
            NestedSection[]
        >,
});

export const getPhasesQuery = (proposalId: string, versionId: string) =>
    queryOptions({
        queryKey: ["proposals", proposalId, versionId, "phases"],
        queryFn: () =>
            getPhases({ data: { versionId, proposalId } }) as Promise<
                NestedPhase[]
            >,
        staleTime: Infinity,
    });

export const getProfilesQuery = (
    { search, userIds }: { search?: string; userIds?: string[] },
) => queryOptions({
    queryKey: ["profiles", search, userIds],
    queryFn: () => getProfiles({ data: { search, userIds } }),
    staleTime: Infinity,
    gcTime: DAY_IN_MS,
    networkMode: "offlineFirst",
});

export const getConversationsQuery = (
    { contactId, companyId, limit = 7 }: {
        contactId?: number;
        companyId?: number;
        limit?: number;
    },
) => queryOptions({
    queryKey: [
        contactId ? "contacts" : "companies",
        contactId ?? companyId,
        "conversations",
    ],
    queryFn: () => getConversations({ data: { contactId, companyId, limit } }),
});

export const getTasksQuery = (id: string) =>
    queryOptions({
        queryKey: ["tickets", id, "tasks"],
        queryFn: () => getTasks({ data: id }),
    });

export const getTicketsQuery = (id: string) =>
    queryOptions({
        queryKey: ["phases", id, "tickets"],
        queryFn: () => getTickets({ data: id }) as Promise<NestedTicket[]>,
    });

export const getPhaseQuery = (id: string) =>
    queryOptions({
        queryKey: ["phases", id],
        queryFn: () => getPhase({ data: id }),
    });

export const getTemplateQuery = (id: string) =>
    queryOptions({
        queryKey: ["proposal-templates", id],
        queryFn: () => getTemplate({ data: id }),
    });

export const getTemplatesQuery = () =>
    queryOptions({
        queryKey: ["proposal-templates"],
        queryFn: () => getTemplates(),
    });

export const syncTemplates = createServerFn().handler(async () => {
    const projectTemplateResponse = await fetch(
        `${env
            .VITE_CONNECT_WISE_URL!}/project/projectTemplates`,
        {
            headers: baseHeaders,
        },
    );

    if (!projectTemplateResponse.ok) {
        console.error(projectTemplateResponse.statusText);
        throw Error(
            "Error fetching project templates... " +
                projectTemplateResponse.statusText,
            {
                cause: projectTemplateResponse.statusText,
            },
        );
    }

    const templates: ProjectTemplate[] = await projectTemplateResponse
        .json();

    const workplansResponse = await Promise.all(
        templates.map(({ id }) =>
            fetch(
                `${env
                    .VITE_CONNECT_WISE_URL!}/project/projectTemplates/${id}/workplan`,
                {
                    // next: {
                    // 	revalidate: 21600,
                    // 	tags: ['workplans'],
                    // },
                    headers: baseHeaders,
                },
            )
        ),
    );

    const workplans: ProjectWorkPlan[] = await Promise.all(
        workplansResponse.map((r) => r.json()),
    );

    const fullTemplates: ProjectTemplate[] = templates.map((template) => {
        return {
            ...template,
            workplan: workplans.find((workplan) =>
                workplan.templateId === template.id
            ),
        };
    });

    const supabase = createClient();

    const templateData = await Promise.all(
        fullTemplates.map(async (template) => {
            const { data: templateData, error } = await supabase
                .from("proposal_templates")
                .insert({
                    name: template.name,
                    description: template.description,
                })
                .select();

            console.log(templateData, error);

            if (template.workplan) {
                await Promise.all(
                    template.workplan?.phases.map(async (phase) => {
                        const { data: phaseData, error: phaseError } =
                            await supabase
                                .from("phase_templates")
                                .insert({
                                    description: phase.description,
                                    order: parseInt(phase.wbsCode),
                                    template_id: templateData?.[0].id ?? "",
                                    bill_phase_separately:
                                        phase.billPhaseSeparately,
                                    mark_as_milestone_flag:
                                        phase.markAsMilestoneFlag,
                                })
                                .select();

                        console.log(phaseData, phaseError);

                        if (phase.tickets) {
                            await Promise.all(
                                phase.tickets.map(async (ticket, index) => {
                                    const {
                                        data: ticketData,
                                        error: ticketError,
                                    } = await supabase
                                        .from(
                                            "ticket_templates",
                                        )
                                        .insert({
                                            summary: ticket.summary,
                                            description: ticket.description,
                                            budgetHours: ticket.budgetHours,
                                            order: ticket.wbsCode
                                                ? parseInt(
                                                    ticket.wbsCode
                                                        .split(
                                                            ".",
                                                        )[0],
                                                )
                                                : index,
                                            phase_id: phaseData?.[0].id ??
                                                "",
                                        }).select();

                                    console.log(ticketData, ticketError);

                                    if (ticket.tasks) {
                                        await Promise.all(
                                            ticket.tasks.map(
                                                async (task) => {
                                                    const {
                                                        data: taskData,
                                                        error: taskError,
                                                    } = await supabase
                                                        .from(
                                                            "task_templates",
                                                        )
                                                        .insert({
                                                            summary:
                                                                task.summary ??
                                                                    "",
                                                            notes: task.notes ??
                                                                "",
                                                            priority:
                                                                task.priority ??
                                                                    0,
                                                            ticket_id:
                                                                ticketData
                                                                    ?.[0]
                                                                    .id ??
                                                                    "",
                                                        });

                                                    console.log(
                                                        taskData,
                                                        taskError,
                                                    );
                                                },
                                            ),
                                        );
                                    }
                                    return ticketData;
                                }),
                            );
                        }
                    }),
                );
            }

            return templateData;
        }),
    );

    return templateData;
});
