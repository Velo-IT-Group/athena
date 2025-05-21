import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/dropzone';
import OverviewRight from '@/components/overview-right';
import { columns } from '@/components/table-columns/file';
import Tiptap from '@/components/tip-tap';
import { DataTable } from '@/components/ui/data-table';
import useProposal from '@/hooks/use-proposal';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import {
	getAttachmentsQuery,
	getProposalQuery,
	getProposalSettingsQuery,
	getStorageFilesQuery,
} from '@/lib/supabase/api';
import { useQuery, useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/proposals/$id/$version/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id, version } = Route.useParams();

	const [{ data: proposalSettings }, { data: initialProposal }] = useSuspenseQueries({
		queries: [getProposalSettingsQuery(id, version), getProposalQuery(id, version)],
	});

	const {
		data: { data: files, count },
		isLoading,
	} = useQuery({
		...getAttachmentsQuery(`proposals/${id}/${version}`),
		initialData: { data: [], count: 0 },
	});

	const props = useSupabaseUpload({
		bucketName: 'attachments',
		path: `proposals/${id}/${version}`,
		allowedMimeTypes: ['image/*'],
		maxFiles: 2,
		maxFileSize: 1000 * 1000 * 10, // 10MB,
		upsert: true,
	});

	const {
		data: proposal,
		handleProposalSettingsUpdate,
		handleProposalUpdate,
	} = useProposal({ id, version, initialData: initialProposal });

	if (!proposalSettings) return <></>;

	return (
		<div className='flex h-full w-full flex-[auto]'>
			<div className='px-12 my-8 flex flex-col justify-center h-full w-full'>
				<div className='ProjectOverview-content w-full space-y-9 max-w-[748px] mx-auto'>
					<section className='space-y-3'>
						<h2 className='text-2xl font-medium'>Description​</h2>

						<div className='border border-transparent hover:border-border rounded-md px-3 -ml-3'>
							<Tiptap
								content={proposalSettings?.description ?? ''}
								placeholder='What’s this proposal about?'
								className='-ml-3 min-h-48'
								onBlur={({ editor }) =>
									handleProposalSettingsUpdate.mutate({
										settings: { description: editor.getHTML() },
									})
								}
							/>
						</div>
					</section>

					<section className='space-y-3'>
						<h2 className='text-2xl font-medium'>Assumptions</h2>

						<div className='border border-transparent hover:border-border rounded-md px-3 -ml-3'>
							<Tiptap
								content={proposalSettings?.assumptions ?? ''}
								placeholder='What assumptions do you have when creating this proposal?'
								className='-ml-3 min-h-48'
								onBlur={({ editor }) =>
									handleProposalSettingsUpdate.mutate({
										settings: { description: editor.getHTML() },
									})
								}
							/>
						</div>
					</section>

					<section>
						<div
							className='EditableDescriptionOverviewSection-headingContainer'
							style={{
								alignItems: 'center',
								marginBottom: '8px',
								display: 'flex',
							}}
						>
							<h4 className='text-2xl font-medium'>Key resources</h4>

							<div
								className='EditableDescriptionOverviewSection-headingExtraContent'
								style={{ marginLeft: '4px' }}
							/>
						</div>

						<div className='w-full'>
							<Dropzone {...props}>
								<DropzoneEmptyState />

								<DropzoneContent />
							</Dropzone>
						</div>
					</section>
				</div>
			</div>

			<OverviewRight
				proposal={proposal!}
				onProposalUpdate={(proposalUpdate) => {
					handleProposalUpdate.mutate({
						proposal: proposalUpdate,
					});
				}}
			/>
		</div>
	);
}
