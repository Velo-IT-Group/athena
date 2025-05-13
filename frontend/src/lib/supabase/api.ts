import { DAY_IN_MS } from "@/components/template-catalog";
import type { UseSupabaseUploadOptions } from "@/hooks/use-supabase-upload";
import {
    type EngagementQueryOptions,
    getConversations,
    getEngagementReservations,
    getEngagements,
    getEngagementSummaryByPeriod,
    getPhase,
    getPhases,
    getPinnedItem,
    getPinnedItems,
    getProducts,
    getProfiles,
    getProposal,
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
    getTickets,
    getVersions,
    type ProposalQueryOptions,
} from "@/lib/supabase/read";
import { FileObject } from "@supabase/storage-js";
import { queryOptions } from "@tanstack/react-query";

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
) => queryOptions({
    queryKey: ["proposals", id],
    queryFn: () => getProposal({ data: id }) as Promise<NestedProposal>,
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

export const getProfilesQuery = () =>
    queryOptions({
        queryKey: ["profiles"],
        queryFn: getProfiles,
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
