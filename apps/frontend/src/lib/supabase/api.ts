import type { FileObject } from '@supabase/storage-js';
import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import type { z } from 'zod';
import { DAY_IN_MS } from '@/components/template-catalog';
import type { UseSupabaseUploadOptions } from '@/hooks/use-supabase-upload';
import {
	type EngagementQueryOptions,
	getConversations,
	getEngagementReservations,
	getEngagementSummaryByPeriod,
	getEngagements,
	getNotifications,
	getPhase,
	getPhases,
	getPinnedItem,
	getPinnedItems,
	getProducts,
	getProfiles,
	getProposal,
	getProposalFollowers,
	getProposalSettings,
	getProposals,
	getProposalsWithCount,
	getProposalTotals,
	getSection,
	getSectionProducts,
	getSections,
	getStorageFile,
	getStorageFiles,
	getTasks,
	getTickets,
	getVersions,
	getWorkflow,
	getWorkflows,
	type ProposalQueryOptions,
} from '@/lib/supabase/read';
import { createClient } from '@/lib/supabase/server';
import { env, type paginationSchema, type sortSchema } from '@/lib/utils';
import type { ProjectTemplate, ProjectWorkPlan } from '@/types/manage';
import { baseHeaders } from '@/utils/manage/params';

export const getSectionProductsQuery = ({
	sectionId,
	versionId,
	proposalId,
}: {
	sectionId: string;
	versionId: string;
	proposalId: string;
}) =>
	queryOptions({
		queryKey: ['proposals', proposalId, versionId, 'products'],
		queryFn: () =>
			getSectionProducts({
				data: { id: sectionId, version: versionId },
			}) as Promise<NestedProduct[]>,
	});

export const getEngagementSummaryByPeriodQuery = (
	options?: EngagementQueryOptions
) =>
	queryOptions({
		queryKey: ['engagements', 'call_summary_by_period', options],
		queryFn: () =>
			getEngagementSummaryByPeriod({
				data: options,
			}),
	});

export const getProposalQuery = (id: string, version: string) =>
	queryOptions({
		queryKey: ['proposals', id, version],
		queryFn: () => getProposal({ data: id }) as Promise<NestedProposal>,
		staleTime: Infinity,
		gcTime: DAY_IN_MS,
		refetchIntervalInBackground: true,
		refetchInterval: (query) =>
			query.state.data?.is_getting_converted ? 2000 : false,
	});

export const getProposalFollowersQuery = (id: string, version: string) =>
	queryOptions({
		queryKey: ['proposals', id, version, 'followers'],
		queryFn: () => getProposalFollowers({ data: id }),
		staleTime: Infinity,
		gcTime: DAY_IN_MS,
	});

export const getProposalsWithCountQuery = (options?: ProposalQueryOptions) =>
	queryOptions({
		queryKey: ['proposals', options],
		queryFn: () =>
			getProposalsWithCount({ data: options }) as Promise<{
				data: NestedProposal[];
				count: number;
			}>,
		staleTime: Infinity,
	});

export const getProposalsQuery = (options?: ProposalQueryOptions) =>
	queryOptions({
		queryKey: ['proposals', options],
		queryFn: () => getProposalsWithCount({ data: options }),
		staleTime: Infinity,
	});

export const getWorkflowsQuery = () =>
	queryOptions({
		queryKey: ['workflows'],
		queryFn: () => getWorkflows(),
	});

export const getWorkflowQuery = (id: string) =>
	queryOptions({
		queryKey: ['workflows', id],
		queryFn: () => getWorkflow({ data: id }),
	});

export const getProposalSettingsQuery = (id: string, version: string) =>
	queryOptions({
		queryKey: ['proposals', id, version, 'settings'],
		queryFn: () => getProposalSettings({ data: { id, version } }),
	});

export const getEngagementsQuery = (
	options?: EngagementQueryOptions,
	sort?: z.infer<typeof sortSchema>,
	pagination?: z.infer<typeof paginationSchema>
) =>
	queryOptions({
		queryKey: ['engagements', options, sort, pagination],
		queryFn: () =>
			getEngagements({ data: { options, sort, pagination } }) as Promise<{
				data: NestedEngagement[];
				count: number;
			}>,
		// staleTime: Infinity,
	});

export const getStorageFilesQuery = (options: UseSupabaseUploadOptions) =>
	queryOptions({
		queryKey: ['storage-files', options],
		queryFn: () => getStorageFiles({ data: options }),
	});

export const getProposalTotalsQuery = (id: string, version: string) =>
	queryOptions({
		queryKey: ['proposals', id, version, 'totals'],
		queryFn: () => getProposalTotals({ data: { id, version } }),
		staleTime: Infinity,
	});

export const getVersionsQuery = (id: string) =>
	queryOptions({
		queryKey: ['versions', id],
		queryFn: () => getVersions({ data: id }) as Promise<Version[]>,
		staleTime: Infinity,
	});

export const getPinnedItemQuery = (params: Record<string, string>) =>
	queryOptions({
		queryKey: ['pinned_items', params],
		queryFn: () => getPinnedItem({ data: params }) as Promise<PinnedItem>,
		staleTime: Infinity,
		gcTime: DAY_IN_MS,
	});

export const getPinnedItemsQuery = () =>
	queryOptions({
		queryKey: ['pinned_items'],
		queryFn: getPinnedItems as () => Promise<PinnedItem[]>,
		staleTime: Infinity,
		gcTime: DAY_IN_MS,
	});

export const getAttachmentsQuery = (id: string) =>
	queryOptions({
		queryKey: ['attachments', id],
		queryFn: () =>
			getStorageFiles({
				data: { bucketName: 'attachments', path: id },
			}) as Promise<{ data: FileObject[]; count: number }>,
	});

export const getRecordingUrlQuery = (id: string) =>
	queryOptions({
		queryKey: ['attachments', 'recordings', id],
		queryFn: () =>
			getStorageFile({
				data: { bucketName: 'attachments', path: id },
			}),
	});

export const getEngagementReservationsQuery = (id?: string) =>
	queryOptions({
		queryKey: ['engagements', 'reservations', id],
		queryFn: () =>
			getEngagementReservations({ data: id! }) as Promise<{
				data: (EngagementReservation & { engagement: Engagement })[];
				count: number;
			}>,
		staleTime: Infinity,
		enabled: !!id,
	});

export const getNotificationsQuery = () =>
	queryOptions({
		queryKey: ['notifications'],
		queryFn: () => getNotifications() as Promise<AppNotification[]>,
		staleTime: Infinity,
	});

export const getProductsQuery = (id: string) =>
	queryOptions({
		queryKey: ['sections', id, 'products'],
		queryFn: () => getProducts({ data: id }) as Promise<NestedProduct[]>,
	});

export const getSectionQuery = (sectionId: string) =>
	queryOptions({
		queryKey: ['sections', sectionId],
		queryFn: () =>
			getSection({ data: sectionId }) as Promise<NestedSection>,
	});

export const getSectionsQuery = (proposalId: string, versionId: string) =>
	queryOptions({
		queryKey: ['proposals', proposalId, versionId, 'sections'],
		queryFn: () =>
			getSections({ data: { versionId, proposalId } }) as Promise<
				Section[]
			>,
	});

export const getPhasesQuery = (proposalId: string, versionId: string) =>
	queryOptions({
		queryKey: ['proposals', proposalId, versionId, 'phases'],
		queryFn: () =>
			getPhases({ data: { versionId, proposalId } }) as Promise<
				NestedPhase[]
			>,
		staleTime: Infinity,
	});

export const getProfilesQuery = ({
	search,
	userIds,
}: {
	search?: string;
	userIds?: string[];
}) =>
	queryOptions({
		queryKey: ['profiles', search, userIds],
		queryFn: () => getProfiles({ data: { search, userIds } }),
		staleTime: Infinity,
		gcTime: DAY_IN_MS,
		networkMode: 'offlineFirst',
	});

export const getConversationsQuery = ({
	contactId,
	companyId,
	limit = 7,
}: {
	contactId?: number;
	companyId?: number;
	limit?: number;
}) =>
	queryOptions({
		queryKey: [
			contactId ? 'contacts' : 'companies',
			contactId ?? companyId,
			'conversations',
		],
		queryFn: () =>
			getConversations({ data: { contactId, companyId, limit } }),
	});

export const getTasksQuery = (id: string) =>
	queryOptions({
		queryKey: ['tickets', id, 'tasks'],
		queryFn: () => getTasks({ data: id }),
		staleTime: DAY_IN_MS,
	});

export const getTicketsQuery = (id: string) =>
	queryOptions({
		queryKey: ['phases', id, 'tickets'],
		queryFn: () => getTickets({ data: id }) as Promise<NestedTicket[]>,
		staleTime: DAY_IN_MS / 2,
	});

export const getPhaseQuery = (id: string) =>
	queryOptions({
		queryKey: ['phases', id],
		queryFn: () => getPhase({ data: id }),
		staleTime: DAY_IN_MS / 2,
	});
