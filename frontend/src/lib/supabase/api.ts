import type { UseSupabaseUploadOptions } from "@/hooks/use-supabase-upload";
import {
    type EngagementQueryOptions,
    getEngagements,
    getProposals,
    getStorageFiles,
    type ProposalQueryOptions,
} from "@/lib/supabase/read";
import type {
    DefinedInitialDataOptions,
    UndefinedInitialDataOptions,
    UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import { FileObject } from "@supabase/storage-js";

export const getProposalsQuery = (
    options?: ProposalQueryOptions,
): UseSuspenseQueryOptions<{ data: NestedProposal[]; count: number }> => ({
    queryKey: ["proposals", options],
    queryFn: () => getProposals({ data: options }),
    staleTime: Infinity,
});

export const getEngagementsQuery = (
    options?: { call_date?: string },
): UseSuspenseQueryOptions<{ data: NestedEngagement[]; count: number }> => ({
    queryKey: ["engagements", options],
    queryFn: () =>
        getEngagements({ data: options }) as Promise<
            { data: NestedEngagement[]; count: number }
        >,
});

export const getStorageFilesQuery = (
    options: UseSupabaseUploadOptions,
): UseSuspenseQueryOptions<{ data: FileObject[]; count: number }> => ({
    queryKey: ["storage-files", options],
    queryFn: () => getStorageFiles({ data: options }),
});
