import { ColoredBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { enUS } from 'date-fns/locale/en-US';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { proposalStatuses } from '@/routes/_authed/proposals/$id/$version/settings';
import { formatRelative, type FormatRelativeToken } from 'date-fns';
import { CalendarIcon, Ellipsis } from 'lucide-react';

const formatRelativeLocale: Record<FormatRelativeToken, string> = {
	lastWeek: "'Last' eeee",
	yesterday: "'Yesterday'",
	today: "'Today'",
	tomorrow: "'Tomorrow'",
	nextWeek: "'Next' eeee",
	other: 'MMM dd',
};

export default function OverviewRight({
	proposal,
	onProposalUpdate,
}: {
	proposal: Proposal;
	onProposalUpdate: (proposal: ProposalUpdate) => void;
}) {
	return (
		<div className='bg-muted/50 min-w-[398px] border-l flex-[0_0_398px]'>
			<div className='space-y-9 p-6 w-full'>
				<div>
					<div
						className='ProjectOverviewActivityFeedPublishedReportSection-heading'
						style={{
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '12px',
							display: 'flex',
						}}
					>
						<h4
							className='TypographyPresentation TypographyPresentation--colorDarkGray1 TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty HighlightSol HighlightSol--buildingBlock HighlightSol--core'
							style={{
								border: '0px',
								padding: '0px',
								verticalAlign: 'baseline',
								margin: '0px',
								fontFamily:
									'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
								color: '#6d6e6f',
								fontWeight: 500,
								textWrap: 'pretty',
								fontSize: '20px',
								lineHeight: '28px',
							}}
						>
							What's the status?
						</h4>
					</div>

					<div className='flex items-center gap-1.5'>
						{proposalStatuses.slice(0, 3).map((status) => (
							<Button
								key={status.value}
								variant='outline'
							>
								<ColoredBadge variant={status.color}>{status.label}</ColoredBadge>
							</Button>
						))}

						<Button
							variant='outline'
							size='icon'
						>
							<Ellipsis />
						</Button>
						{/* <div
								className='ButtonThemeablePresentation--isEnabled ButtonThemeablePresentation ButtonThemeablePresentation--large StopLightButton--isNotPressed StopLightButton StopLightButton--green ProgressStatusUpdateBadgeButton ProjectOverviewActivityFeedPublishedReportSection-stopLightButton HighlightSol HighlightSol--buildingBlock Stack Stack--align-center Stack--direction-row Stack--display-inline Stack--justify-center'
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
									verticalAlign: 'middle',
									marginBottom: '4px',
									marginRight: '8px',
									cursor: 'pointer',
									padding: '0 12px',
									height: '36px',
									fontSize: '14px',
									lineHeight: '36px',
									background: '#fff',
									borderColor: '#cfcbcb',
									color: '#1e1f21',
									fill: '#58a182',
								}}
							>
								<svg
									className='MiniIcon ButtonThemeablePresentation-leftIcon StatusDotFillMiniIcon HighlightSol HighlightSol--core'
									aria-hidden='true'
									focusable='false'
									viewBox='0 0 24 24'
									style={{
										marginRight: '4px',
										flex: '0 0 auto',
										width: '12px',
										height: '12px',
										overflow: 'hidden',
									}}
								>
									<path d='m20,12c0,4.42-3.58,8-8,8s-8-3.58-8-8S7.58,4,12,4s8,3.58,8,8Z' />
								</svg>
								On track
							</div>
							<div
								className='ButtonThemeablePresentation--isEnabled ButtonThemeablePresentation ButtonThemeablePresentation--large StopLightButton--isNotPressed StopLightButton StopLightButton--yellow ProgressStatusUpdateBadgeButton ProjectOverviewActivityFeedPublishedReportSection-stopLightButton HighlightSol HighlightSol--buildingBlock Stack Stack--align-center Stack--direction-row Stack--display-inline Stack--justify-center'
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
									verticalAlign: 'middle',
									marginBottom: '4px',
									marginRight: '8px',
									cursor: 'pointer',
									padding: '0 12px',
									height: '36px',
									fontSize: '14px',
									lineHeight: '36px',
									background: '#fff',
									borderColor: '#cfcbcb',
									color: '#1e1f21',
									fill: '#f1bd6c',
								}}
							>
								<svg
									className='MiniIcon ButtonThemeablePresentation-leftIcon StatusDotFillMiniIcon HighlightSol HighlightSol--core'
									aria-hidden='true'
									focusable='false'
									viewBox='0 0 24 24'
									style={{
										marginRight: '4px',
										flex: '0 0 auto',
										width: '12px',
										height: '12px',
										overflow: 'hidden',
									}}
								>
									<path d='m20,12c0,4.42-3.58,8-8,8s-8-3.58-8-8S7.58,4,12,4s8,3.58,8,8Z' />
								</svg>
								At risk
							</div>
							<div
								className='ButtonThemeablePresentation--isEnabled ButtonThemeablePresentation ButtonThemeablePresentation--large StopLightButton--isNotPressed StopLightButton StopLightButton--red ProgressStatusUpdateBadgeButton ProjectOverviewActivityFeedPublishedReportSection-stopLightButton HighlightSol HighlightSol--buildingBlock Stack Stack--align-center Stack--direction-row Stack--display-inline Stack--justify-center'
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
									verticalAlign: 'middle',
									marginBottom: '4px',
									marginRight: '8px',
									cursor: 'pointer',
									padding: '0 12px',
									height: '36px',
									fontSize: '14px',
									lineHeight: '36px',
									background: '#fff',
									borderColor: '#cfcbcb',
									color: '#1e1f21',
									fill: '#de5f73',
								}}
							>
								<svg
									className='MiniIcon ButtonThemeablePresentation-leftIcon StatusDotFillMiniIcon HighlightSol HighlightSol--core'
									aria-hidden='true'
									focusable='false'
									viewBox='0 0 24 24'
									style={{
										marginRight: '4px',
										flex: '0 0 auto',
										width: '12px',
										height: '12px',
										overflow: 'hidden',
									}}
								>
									<path d='m20,12c0,4.42-3.58,8-8,8s-8-3.58-8-8S7.58,4,12,4s8,3.58,8,8Z' />
								</svg>
								Off track
							</div>
							<div
								className='IconButtonThemeablePresentation--isEnabled IconButtonThemeablePresentation IconButtonThemeablePresentation--large SubtleIconButton--standardTheme SubtleIconButton HighlightSol HighlightSol--core HighlightSol--buildingBlock Stack Stack--align-center Stack--direction-row Stack--display-inline Stack--justify-center'
								aria-expanded='false'
								aria-haspopup='menu'
								aria-label='More actions'
								role='button'
								tabIndex={0}
								style={{
									alignItems: 'center',
									flexDirection: 'row',
									display: 'inline-flex',
									justifyContent: 'center',
									border: '1px solid',
									boxSizing: 'border-box',
									transitionProperty: 'background, border, fill',
									transitionDuration: '0.2s',
									cursor: 'pointer',
									borderRadius: '6px',
									width: '36px',
									minWidth: '36px',
									height: '36px',
									minHeight: '36px',
									background: '0px 0px',
									borderColor: 'transparent',
									fill: '#6d6e6f',
								}}
							>
								<svg
									className='Icon MoreIcon HighlightSol HighlightSol--core'
									aria-hidden='true'
									focusable='false'
									viewBox='0 0 32 32'
									style={{
										flex: '0 0 auto',
										width: '16px',
										height: '16px',
										overflow: 'hidden',
									}}
								>
									<path d='M16,13c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S14.3,13,16,13z M3,13c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S1.3,13,3,13z M29,13c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S27.3,13,29,13z' />
								</svg>
							</div> */}
					</div>
				</div>

				<div>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant='ghost'
								size='sm'
								className={cn(
									'-ml-3 h-auto py-1.5 border-gray-600 text-muted-foreground',
									proposal.expiration_date
										? new Date(proposal.expiration_date) < new Date()
											? 'text-red-500 border-red-500 hover:border-red-500 hover:text-red-500'
											: 'text-green-500 border-green-500 hover:border-green-500 hover:text-green-500'
										: undefined
								)}
							>
								<div
									className={cn(
										'size-7 border border-dashed border-inherit rounded-full inline-flex items-center justify-center'
									)}
									style={{
										// border: '1px dashed #6d6e6f',
										width: '28px',
										height: '28px',
									}}
								>
									<CalendarIcon className='size-5' />
								</div>

								<span className='whitespace-nowrap overflow-hidden text-ellipsis flex-[1_1_auto] text-base font-medium'>
									{proposal.expiration_date
										? formatRelative(new Date(proposal.expiration_date), new Date(), {
												locale: {
													...enUS,
													formatRelative: (token) => formatRelativeLocale[token],
												},
										  })
										: 'No due date'}
								</span>
							</Button>
						</PopoverTrigger>

						<PopoverContent
							className='p-0 w-fit'
							align='start'
						>
							<Calendar
								mode='single'
								selected={proposal.expiration_date ? new Date(proposal.expiration_date) : undefined}
								onSelect={(day) => {
									onProposalUpdate({
										expiration_date: day?.toISOString(),
									});
								}}
							/>

							<Separator />

							<div className='flex justify-end p-1.5'>
								<Button
									variant='ghost'
									className='text-muted-foreground'
									onClick={() => {
										onProposalUpdate({
											expiration_date: null,
										});
									}}
								>
									Clear
								</Button>
							</div>
						</PopoverContent>
					</Popover>
				</div>

				{/* <div className='flex'>
					<div
						className='ActivityFeedStory-gutter'
						style={{
							flex: '0 0 16px',
							flexDirection: 'column',
							marginRight: '8px',
							display: 'flex',
						}}
					>
						<div
							className='ActivityFeedStory-icon'
							style={{
								padding: '4px 0px',
								fill: '#6d6e6f',
								alignItems: 'center',
								display: 'flex',
							}}
						>
							<svg
								className='Icon UsersIcon HighlightSol HighlightSol--core'
								aria-hidden='true'
								focusable='false'
								viewBox='0 0 32 32'
								style={{
									flex: '0 0 auto',
									width: '16px',
									height: '16px',
									overflow: 'hidden',
								}}
							>
								<path d='M21,18c-4.411,0-8-3.589-8-8S16.589,2,21,2s8,3.589,8,8-3.589,8-8,8Zm0-14c-3.309,0-6,2.691-6,6s2.691,6,6,6,6-2.691,6-6-2.691-6-6-6Zm11,25v-2c0-3.86-3.141-7-7-7h-8c-3.859,0-7,3.14-7,7v2c0,.552,.447,1,1,1s1-.448,1-1v-2c0-2.757,2.243-5,5-5h8c2.757,0,5,2.243,5,5v2c0,.552,.447,1,1,1s1-.448,1-1ZM12,17c0-.552-.447-1-1-1-3.309,0-6-2.691-6-6s2.691-6,6-6c.553,0,1-.448,1-1s-.447-1-1-1C6.589,2,3,5.589,3,10s3.589,8,8,8c.553,0,1-.448,1-1ZM2,29v-2c0-2.757,2.243-5,5-5h2c.553,0,1-.448,1-1s-.447-1-1-1h-2C3.141,20,0,23.14,0,27v2C0,29.552,.447,30,1,30s1-.448,1-1Z' />
							</svg>
						</div>
						<div
							className='ActivityFeedStory-gutterLine'
							style={{
								flex: '1 0 auto',
								minWidth: '1px',
								position: 'relative',
							}}
						/>
					</div>
					<div
						className='ActivityFeedStory-body'
						style={{ minWidth: '1px', marginBottom: '32px' }}
					>
						<h5
							className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h5 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty ActivityFeedStory-title HighlightSol HighlightSol--buildingBlock HighlightSol--core'
							style={{
								border: '0px',
								padding: '0px',
								verticalAlign: 'baseline',
								margin: '0px',
								fontFamily:
									'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
								color: '#1e1f21',
								fontWeight: 500,
								textWrap: 'pretty',
								flex: '1 1 auto',
								overflow: 'hidden',
								WebkitLineClamp: '2',
								WebkitBoxOrient: 'vertical',
								display: '-webkit-box',
								fontSize: '16px',
								lineHeight: '20px',
							}}
						>
							<div
								className='ActivityFeedStory-titleButton'
								role='button'
								tabIndex={0}
								style={{
									cursor: 'pointer',
									color: 'inherit',
									fill: 'inherit',
								}}
							>
								Engineering team joined
							</div>
						</h5>
						<div
							className='ActivityFeedStory-creatorAndTimeRow'
							style={{
								alignItems: 'baseline',
								minWidth: '1px',
								marginTop: '4px',
								display: 'flex',
							}}
						>
							<div
								className='TypographyPresentation TypographyPresentation--colorWeak TypographyPresentation--small ActivityFeedStory-timestamp HighlightSol HighlightSol--buildingBlock'
								style={{
									fontFamily:
										'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
									color: '#6d6e6f',
									whiteSpace: 'nowrap',
									fontSize: '12px',
									lineHeight: '18px',
								}}
							>
								<div>Dec 14, 2023</div>
								<noscript />
							</div>
						</div>
						<div
							className='ProjectOverviewActivityFeedTeamJoinedStory-membersList'
							style={{ marginTop: '8px' }}
						>
							<ul
								className='FacepileStructure Facepile ProjectOverviewActivityFeedTeamJoinedStory-facepile'
								aria-hidden='true'
								style={{
									border: '0px',
									verticalAlign: 'baseline',
									fontFamily: 'inherit',
									fontSize: '100%',
									margin: '0px',
									listStyle: 'none',
									padding: '2px',
									flexDirection: 'row-reverse',
									alignItems: 'center',
									display: 'inline-flex',
									cursor: 'default',
									marginRight: '4px',
									transitionProperty: 'background, border, fill',
									transitionDuration: '0.2s',
								}}
							>
								<li
									className='FacepileStructure-item'
									style={{
										border: '0px',
										margin: '0px',
										padding: '0px',
										verticalAlign: 'baseline',
										fontFamily: 'inherit',
										fontSize: '100%',
										flexShrink: 0,
										alignItems: 'center',
										marginLeft: '-4px',
										display: 'flex',
									}}
								>
									<span
										className='Facepile-avatar Facepile-item Avatar AvatarPhoto AvatarPhoto--default AvatarPhoto--small AvatarPhoto--color5 HighlightSol HighlightSol--core'
										aria-hidden='true'
										style={{
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											height: '24px',
											fontSize: '12px',
											lineHeight: '24px',
											minWidth: '24px',
											width: '24px',
											background: 'center/cover #cfcbcb',
											borderRadius: '50%',
											boxSizing: 'border-box',
											verticalAlign: 'top',
											justifyContent: 'center',
											alignItems: 'center',
											display: 'inline-flex',
											position: 'relative',
											flexShrink: 0,
											backgroundColor: '#f8df72',
											color: '#1e1f21',
											boxShadow: '0 0 0 2px #fff,inset 0 0 0 1px rgba(0,0,0,.07)',
										}}
									>
										<span
											className='AvatarPhoto-image'
											style={{
												backgroundPosition: '50% center',
												borderRadius: '50%',
												boxSizing: 'border-box',
												height: 'inherit',
												minHeight: 'inherit',
												minWidth: 'inherit',
												width: 'inherit',
												backgroundSize: 'cover',
												position: 'absolute',
												boxShadow: 'rgba(0, 0, 0, 0.07) 0px 0px 0px 1px inset',
											}}
										/>
										<span
											className='AvatarPhoto-initials'
											aria-hidden='true'
											aria-label='in'
										/>
									</span>
								</li>
								<li
									className='FacepileStructure-item'
									style={{
										border: '0px',
										margin: '0px',
										padding: '0px',
										verticalAlign: 'baseline',
										fontFamily: 'inherit',
										fontSize: '100%',
										flexShrink: 0,
										alignItems: 'center',
										display: 'flex',
										marginLeft: '0px',
									}}
								>
									<span
										className='Facepile-avatar Facepile-item Avatar AvatarPhoto AvatarPhoto--default AvatarPhoto--small AvatarPhoto--color0 HighlightSol HighlightSol--core'
										aria-hidden='true'
										style={{
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											height: '24px',
											fontSize: '12px',
											lineHeight: '24px',
											minWidth: '24px',
											width: '24px',
											background: 'center/cover #cfcbcb',
											borderRadius: '50%',
											boxSizing: 'border-box',
											verticalAlign: 'top',
											justifyContent: 'center',
											alignItems: 'center',
											display: 'inline-flex',
											position: 'relative',
											flexShrink: 0,
											backgroundColor: '#cd95ea',
											color: '#1e1f21',
											boxShadow: '0 0 0 2px #fff,inset 0 0 0 1px rgba(0,0,0,.07)',
										}}
									>
										<span
											className='AvatarPhoto-image'
											role='img'
											style={{
												backgroundPosition: '50% center',
												borderRadius: '50%',
												boxSizing: 'border-box',
												height: 'inherit',
												minHeight: 'inherit',
												minWidth: 'inherit',
												width: 'inherit',
												backgroundSize: 'cover',
												position: 'absolute',
												boxShadow: 'rgba(0, 0, 0, 0.07) 0px 0px 0px 1px inset',
												backgroundImage:
													'url("https://s3.us-east-1.amazonaws.com/asana-user-private-us-east-1/assets/1201967348541907/profile_photos/1203922574287441/682a20e8db34c907fd6cb692410409c0_60x60.png")',
											}}
										/>
										<span
											className='AvatarPhoto-initials'
											aria-hidden='true'
											aria-label='NB'
										/>
									</span>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className='flex'>
					<div
						className='ActivityFeedStory-gutter'
						style={{
							flex: '0 0 16px',
							flexDirection: 'column',
							marginRight: '8px',
							display: 'flex',
						}}
					>
						<div
							className='ActivityFeedStory-icon'
							style={{
								padding: '4px 0px',
								fill: '#6d6e6f',
								alignItems: 'center',
								display: 'flex',
							}}
						>
							<svg
								className='Icon UsersIcon HighlightSol HighlightSol--core'
								aria-hidden='true'
								focusable='false'
								viewBox='0 0 32 32'
								style={{
									flex: '0 0 auto',
									width: '16px',
									height: '16px',
									overflow: 'hidden',
								}}
							>
								<path d='M21,18c-4.411,0-8-3.589-8-8S16.589,2,21,2s8,3.589,8,8-3.589,8-8,8Zm0-14c-3.309,0-6,2.691-6,6s2.691,6,6,6,6-2.691,6-6-2.691-6-6-6Zm11,25v-2c0-3.86-3.141-7-7-7h-8c-3.859,0-7,3.14-7,7v2c0,.552,.447,1,1,1s1-.448,1-1v-2c0-2.757,2.243-5,5-5h8c2.757,0,5,2.243,5,5v2c0,.552,.447,1,1,1s1-.448,1-1ZM12,17c0-.552-.447-1-1-1-3.309,0-6-2.691-6-6s2.691-6,6-6c.553,0,1-.448,1-1s-.447-1-1-1C6.589,2,3,5.589,3,10s3.589,8,8,8c.553,0,1-.448,1-1ZM2,29v-2c0-2.757,2.243-5,5-5h2c.553,0,1-.448,1-1s-.447-1-1-1h-2C3.141,20,0,23.14,0,27v2C0,29.552,.447,30,1,30s1-.448,1-1Z' />
							</svg>
						</div>
						<div
							className='ActivityFeedStory-gutterLine'
							style={{
								flex: '1 0 auto',
								minWidth: '1px',
								position: 'relative',
							}}
						/>
					</div>
					<div
						className='ActivityFeedStory-body'
						style={{ minWidth: '1px', marginBottom: '32px' }}
					>
						<h5
							className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h5 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty ActivityFeedStory-title HighlightSol HighlightSol--buildingBlock HighlightSol--core'
							style={{
								border: '0px',
								padding: '0px',
								verticalAlign: 'baseline',
								margin: '0px',
								fontFamily:
									'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
								color: '#1e1f21',
								fontWeight: 500,
								textWrap: 'pretty',
								flex: '1 1 auto',
								overflow: 'hidden',
								WebkitLineClamp: '2',
								WebkitBoxOrient: 'vertical',
								display: '-webkit-box',
								fontSize: '16px',
								lineHeight: '20px',
							}}
						>
							<div
								className='ActivityFeedStory-titleButton'
								role='button'
								tabIndex={0}
								style={{
									cursor: 'pointer',
									color: 'inherit',
									fill: 'inherit',
								}}
							>
								You joined
							</div>
						</h5>
						<div
							className='ActivityFeedStory-creatorAndTimeRow'
							style={{
								alignItems: 'baseline',
								minWidth: '1px',
								marginTop: '4px',
								display: 'flex',
							}}
						>
							<div
								className='TypographyPresentation TypographyPresentation--colorWeak TypographyPresentation--small ActivityFeedStory-timestamp HighlightSol HighlightSol--buildingBlock'
								style={{
									fontFamily:
										'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
									color: '#6d6e6f',
									whiteSpace: 'nowrap',
									fontSize: '12px',
									lineHeight: '18px',
								}}
							>
								<div>Dec 14, 2023</div>
							</div>
						</div>
						<div
							className='ProjectOverviewActivityFeedCollaboratorsJoinedStory-membersList'
							style={{ marginTop: '8px' }}
						>
							<span
								className='ProjectOverviewActivityFeedCollaboratorsJoinedStory-facepileAvatar Avatar AvatarPhoto AvatarPhoto--default AvatarPhoto--small AvatarPhoto--color0 HighlightSol HighlightSol--core'
								aria-hidden='true'
								style={{
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									height: '24px',
									fontSize: '12px',
									lineHeight: '24px',
									minWidth: '24px',
									width: '24px',
									background: 'center/cover #cfcbcb',
									borderRadius: '50%',
									boxSizing: 'border-box',
									verticalAlign: 'top',
									justifyContent: 'center',
									alignItems: 'center',
									display: 'inline-flex',
									position: 'relative',
									boxShadow: 'rgba(0, 0, 0, 0.07) 0px 0px 0px 1px inset',
									cursor: 'default',
									marginRight: '4px',
									transitionProperty: 'background, border, fill',
									transitionDuration: '0.2s',
									backgroundColor: '#cd95ea',
									color: '#1e1f21',
								}}
							>
								<span
									className='AvatarPhoto-image'
									role='img'
									style={{
										backgroundPosition: '50% center',
										borderRadius: '50%',
										boxSizing: 'border-box',
										height: 'inherit',
										minHeight: 'inherit',
										minWidth: 'inherit',
										width: 'inherit',
										backgroundSize: 'cover',
										position: 'absolute',
										boxShadow: 'rgba(0, 0, 0, 0.07) 0px 0px 0px 1px inset',
										backgroundImage:
											'url("https://s3.us-east-1.amazonaws.com/asana-user-private-us-east-1/assets/1201967348541907/profile_photos/1203922574287441/682a20e8db34c907fd6cb692410409c0_60x60.png")',
									}}
								/>
								<span
									className='AvatarPhoto-initials'
									aria-hidden='true'
									aria-label='NB'
								/>
							</span>
						</div>
					</div>
				</div>

				<div className='flex'>
					<div
						className='ActivityFeedStory-gutter'
						style={{
							flex: '0 0 16px',
							flexDirection: 'column',
							marginRight: '8px',
							display: 'flex',
						}}
					>
						<div
							className='ActivityFeedStory-icon'
							style={{
								padding: '4px 0px',
								fill: '#6d6e6f',
								alignItems: 'center',
								display: 'flex',
							}}
						>
							<svg
								className='Icon ProjectIcon HighlightSol HighlightSol--core'
								aria-hidden='true'
								focusable='false'
								viewBox='0 0 32 32'
								style={{
									flex: '0 0 auto',
									width: '16px',
									height: '16px',
									overflow: 'hidden',
								}}
							>
								<path d='M10,13.5c0.8,0,1.5,0.7,1.5,1.5s-0.7,1.5-1.5,1.5S8.5,15.8,8.5,15S9.2,13.5,10,13.5z M23,14h-8c-0.6,0-1,0.4-1,1s0.4,1,1,1h8c0.6,0,1-0.4,1-1S23.6,14,23,14z M23,20h-8c-0.6,0-1,0.4-1,1s0.4,1,1,1h8c0.6,0,1-0.4,1-1S23.6,20,23,20z M10,19.5c0.8,0,1.5,0.7,1.5,1.5s-0.7,1.5-1.5,1.5S8.5,21.8,8.5,21S9.2,19.5,10,19.5z M24,2h-2.2c-0.4-1.2-1.5-2-2.8-2h-6c-1.3,0-2.4,0.8-2.8,2H8C4.7,2,2,4.7,2,8v18c0,3.3,2.7,6,6,6h16c3.3,0,6-2.7,6-6V8C30,4.7,27.3,2,24,2z M13,2h6c0.6,0,1,0.4,1,1v2c0,0.6-0.4,1-1,1h-6c-0.6,0-1-0.4-1-1V3C12,2.4,12.4,2,13,2z M28,26c0,2.2-1.8,4-4,4H8c-2.2,0-4-1.8-4-4V8c0-2.2,1.8-4,4-4h2v1c0,1.7,1.3,3,3,3h6c1.7,0,3-1.3,3-3V4h2c2.2,0,4,1.8,4,4V26z' />
							</svg>
						</div>
						<div
							className='ActivityFeedStory-gutterLine'
							style={{
								flex: '1 0 auto',
								minWidth: '1px',
								position: 'relative',
							}}
						/>
					</div>
					<div
						className='ActivityFeedStory-body'
						style={{ minWidth: '1px', marginBottom: '32px' }}
					>
						<h5
							className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h5 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty ActivityFeedStory-title HighlightSol HighlightSol--buildingBlock HighlightSol--core'
							style={{
								border: '0px',
								padding: '0px',
								verticalAlign: 'baseline',
								margin: '0px',
								fontFamily:
									'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
								color: '#1e1f21',
								fontWeight: 500,
								textWrap: 'pretty',
								flex: '1 1 auto',
								overflow: 'hidden',
								WebkitLineClamp: '2',
								WebkitBoxOrient: 'vertical',
								display: '-webkit-box',
								fontSize: '16px',
								lineHeight: '20px',
							}}
						>
							Project created
						</h5>
						<div
							className='ActivityFeedStory-creatorAndTimeRow'
							style={{
								alignItems: 'baseline',
								minWidth: '1px',
								marginTop: '4px',
								display: 'flex',
							}}
						>
							<h6
								className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--overflowTruncate TypographyPresentation--h6 TypographyPresentation--fontWeightMedium ActivityFeedStory-creator HighlightSol HighlightSol--buildingBlock HighlightSol--core'
								style={{
									border: '0px',
									padding: '0px',
									verticalAlign: 'baseline',
									margin: '0px',
									fontFamily:
										'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
									color: '#1e1f21',
									fontWeight: 500,
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									marginRight: '8px',
									fontSize: '14px',
									lineHeight: '20px',
								}}
							>
								<a
									className='HiddenNavigationLink DomainUserNavigationLink HighlightSol HighlightSol--core'
									href='https://app.asana.com/0/profile/1201967348541917'
									style={{
										backgroundColor: 'transparent',
										textDecoration: 'none',
										cursor: 'pointer',
										color: 'inherit',
										fill: 'inherit',
										outlineOffset: '-2px',
									}}
								>
									Nick Black
								</a>
							</h6>
							<div
								className='TypographyPresentation TypographyPresentation--colorWeak TypographyPresentation--small ActivityFeedStory-timestamp HighlightSol HighlightSol--buildingBlock'
								style={{
									fontFamily:
										'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
									color: '#6d6e6f',
									whiteSpace: 'nowrap',
									fontSize: '12px',
									lineHeight: '18px',
								}}
							>
								<div>Dec 14, 2023</div>
							</div>
						</div>
					</div>
				</div> */}
			</div>
		</div>
	);
}
