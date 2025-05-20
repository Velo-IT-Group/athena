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
							<Dropzone
								{...props}
								className='p-0 !border-none'
							>
								<DropzoneEmptyState className='w-full'>
									{count > 0 ? (
										<DataTable
											columns={columns}
											options={getStorageFilesQuery({
												bucketName: 'attachments',
												path: `proposals/${id}/${version}`,
											})}
											hideFilter
											hidePagination
											hideHeader
										/>
									) : (
										<div
											className='ProjectOverviewKeyResourcesEmptyState-withoutBrief'
											style={{
												border: '1px solid #edeae9',
												borderRadius: '8px',
												boxSizing: 'border-box',
												justifyContent: 'center',
												alignItems: 'center',
												width: '100%',
												minWidth: '458px',
												maxWidth: '748px',
												display: 'flex',
											}}
										>
											<img
												className='Illustration Illustration--medium Illustration--spot ProjectOverviewKeyResourcesEmptyState-illustration HighlightSol HighlightSol--core'
												src='https://d3ki9tyy5l5ruj.cloudfront.net/obj/f696815edc59be79affd1063efd6728836b8e5e4/key_resources.svg'
												style={{
													margin: '0px',
													padding: '0px',
													verticalAlign: 'baseline',
													fontFamily: 'inherit',
													fontSize: '100%',
													border: '0px',
													height: '160px',
													minHeight: '160px',
													width: '160px',
													minWidth: '160px',
												}}
											/>

											<div
												className='ProjectOverviewKeyResourcesEmptyState-content'
												style={{
													padding: '12px',
													flexDirection: 'column',
													justifyContent: 'center',
													maxWidth: '320px',
													display: 'flex',
												}}
											>
												<span
													className='TypographyPresentation TypographyPresentation--medium HighlightSol HighlightSol--buildingBlock'
													style={{
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontSize: '14px',
														lineHeight: '22px',
													}}
												>
													Align your team around a shared vision with a project brief and
													supporting resources.
												</span>

												<div className='ProjectOverviewKeyResourcesEmptyState-buttons'>
													<div
														className='ButtonThemeablePresentation--isEnabled ButtonThemeablePresentation ButtonThemeablePresentation--large ButtonSubtlePresentation ButtonSubtlePresentation--sentimentDefault ButtonSubtlePresentation--enabled SubtleButton--isCompact SubtleButton ProjectOverviewKeyResourcesEmptyState-projectBriefButton HighlightSol HighlightSol--core HighlightSol--buildingBlock Stack Stack--align-center Stack--direction-row Stack--display-inline Stack--justify-center'
														aria-disabled='false'
														role='button'
														tabIndex={0}
														style={{
															alignItems: 'center',
															flexDirection: 'row',
															display: 'inline-flex',
															justifyContent: 'center',
															border: '1px solid',
															borderRadius: '6px',
															overflow: 'hidden',
															boxSizing: 'border-box',
															userSelect: 'none',
															flexShrink: 0,
															transitionProperty: 'background, border, color, fill',
															transitionDuration: '0.2s',
															marginTop: '12px',
															marginRight: '8px',
															cursor: 'pointer',
															height: '36px',
															fontSize: '14px',
															lineHeight: '36px',
															background: '0px 0px',
															borderColor: 'transparent',
															color: '#6d6e6f',
															fill: '#6d6e6f',
															fontWeight: 500,
															padding: '0px 4px',
														}}
													>
														<svg
															className='Icon ButtonThemeablePresentation-leftIcon BriefIcon HighlightSol HighlightSol--core'
															aria-hidden='true'
															focusable='false'
															viewBox='0 0 32 32'
															style={{
																marginRight: '4px',
																flex: '0 0 auto',
																width: '16px',
																height: '16px',
																overflow: 'hidden',
															}}
														>
															<path d='M22 0H10C6.691 0 4 2.691 4 6v20c0 3.309 2.691 6 6 6h12c3.309 0 6-2.691 6-6V6c0-3.309-2.691-6-6-6Zm4 26c0 2.206-1.794 4-4 4H10c-2.206 0-4-1.794-4-4V6c0-2.206 1.794-4 4-4h12c2.206 0 4 1.794 4 4v20ZM22.611 8.75l-4.083-.597-1.822-3.714a.778.778 0 0 0-.706-.44.778.778 0 0 0-.706.44l-1.822 3.714-4.083.597a.786.786 0 0 0-.437 1.339l2.958 2.901-.697 4.09a.788.788 0 0 0 1.143.827l3.645-1.927 3.645 1.927a.788.788 0 0 0 1.143-.827l-.697-4.09 2.958-2.901a.786.786 0 0 0-.437-1.339h-.002Zm-3.922 2.812-.747.733.176 1.032.283 1.661-1.466-.776-.935-.495-.935.495-1.466.776.283-1.661.176-1.032-.747-.733-1.21-1.187 1.662-.243 1.042-.152.464-.946.732-1.492.732 1.492.464.946 1.042.152 1.662.243-1.21 1.187h-.002ZM22.999 21a1 1 0 0 1-1 1h-12a1 1 0 0 1 0-2h12a1 1 0 0 1 1 1Zm0 4a1 1 0 0 1-1 1h-12a1 1 0 0 1 0-2h12a1 1 0 0 1 1 1Z' />
														</svg>
														Create project brief
													</div>
													<span className='AddAttachmentsButton'>
														<input
															id='add_attachments_button_file_input_0'
															className='AddAttachmentsButton-hiddenFileInput'
															type='file'
															multiple
															tabIndex={-1}
															style={{
																border: '0px',
																padding: '0px',
																verticalAlign: 'baseline',
																font: 'inherit',
																margin: '0px',
																color: 'inherit',
																fontSize: 'inherit',
																fontFamily: 'inherit',
																lineHeight: 'normal',
																display: 'none',
															}}
														/>
														<div
															className='ButtonThemeablePresentation--isEnabled ButtonThemeablePresentation ButtonThemeablePresentation--large ButtonSubtlePresentation ButtonSubtlePresentation--sentimentDefault ButtonSubtlePresentation--enabled SubtleButton--isCompact SubtleButton ProjectOverviewKeyResourcesEmptyState-addAttachmentButton HighlightSol HighlightSol--core HighlightSol--buildingBlock Stack Stack--align-center Stack--direction-row Stack--display-inline Stack--justify-center'
															aria-disabled='false'
															aria-expanded='false'
															aria-haspopup='menu'
															role='button'
															tabIndex={0}
															style={{
																alignItems: 'center',
																flexDirection: 'row',
																display: 'inline-flex',
																justifyContent: 'center',
																border: '1px solid',
																borderRadius: '6px',
																overflow: 'hidden',
																boxSizing: 'border-box',
																userSelect: 'none',
																flexShrink: 0,
																transitionProperty: 'background, border, color, fill',
																transitionDuration: '0.2s',
																marginTop: '8px',
																cursor: 'pointer',
																height: '36px',
																fontSize: '14px',
																lineHeight: '36px',
																background: '0px 0px',
																borderColor: 'transparent',
																color: '#6d6e6f',
																fill: '#6d6e6f',
																fontWeight: 500,
																padding: '0px 4px',
															}}
														>
															<svg
																className='Icon ButtonThemeablePresentation-leftIcon AttachVerticalIcon HighlightSol HighlightSol--core'
																aria-hidden='true'
																focusable='false'
																viewBox='0 0 32 32'
																style={{
																	marginRight: '4px',
																	flex: '0 0 auto',
																	width: '16px',
																	height: '16px',
																	overflow: 'hidden',
																}}
															>
																<path d='M19,32c-3.9,0-7-3.1-7-7V10c0-2.2,1.8-4,4-4s4,1.8,4,4v9c0,0.6-0.4,1-1,1s-1-0.4-1-1v-9c0-1.1-0.9-2-2-2s-2,0.9-2,2v15c0,2.8,2.2,5,5,5s5-2.2,5-5V10c0-4.4-3.6-8-8-8s-8,3.6-8,8v5c0,0.6-0.4,1-1,1s-1-0.4-1-1v-5C6,4.5,10.5,0,16,0s10,4.5,10,10v15C26,28.9,22.9,32,19,32z' />
															</svg>
															Add links & files
														</div>
													</span>
												</div>
											</div>
										</div>
									)}
								</DropzoneEmptyState>
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
