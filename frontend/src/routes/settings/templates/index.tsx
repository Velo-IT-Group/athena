import SettingPageWrap from '@/components/settings-page-warp';
import { Button } from '@/components/ui/button';
import { getTemplatesQuery } from '@/lib/supabase/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Circle, Plus, Section } from 'lucide-react';

export const Route = createFileRoute('/settings/templates/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: templates } = useSuspenseQuery(getTemplatesQuery());

	return (
		<SettingPageWrap
			title='Templates'
			description='Workspace templates are available when creating issues, documents, and projects for all teams in the workspace. To create templates that only apply to certain teams, add them in the team-specific template settings.'
		>
			<SectionItem title='Issue templates'>
				<GroupedTemplateItem
					title={`${templates.length} issue template${templates.length === 1 ? '' : 's'}`}
					count={templates.length}
					templates={templates}
				/>
			</SectionItem>

			{/* <Component /> */}
		</SettingPageWrap>
	);
}

function Component() {
	return (
		<div
			className='sc-FEMpB sc-gdGUjp inUrkE ctsVqn'
			style={{
				boxSizing: 'border-box',
				touchAction: 'pan-x pan-y',
				padding: '0px',
				border: '0px',
				fontSize: 'inherit',
				fontFamily: 'inherit',
				fontWeight: 'inherit',
				lineHeight: 'inherit',
				verticalAlign: 'baseline',
				flex: '1 0 auto',
				display: 'flex',
				flexDirection: 'column',
				WebkitBoxAlign: 'center',
				alignItems: 'center',
				margin: '0px 40px 64px',
				scrollbarWidth: 'thin',
				scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
				color: 'lch(9.723 0 282.863)',
			}}
		>
			<div
				className='sc-FEMpB sc-kdjWBr bTnhsk byZyDo'
				style={{
					boxSizing: 'border-box',
					touchAction: 'pan-x pan-y',
					margin: '0px',
					padding: '0px',
					border: '0px',
					fontSize: 'inherit',
					fontFamily: 'inherit',
					fontWeight: 'inherit',
					lineHeight: 'inherit',
					verticalAlign: 'baseline',
					flex: 'initial',
					display: 'flex',
					flexDirection: 'column',
					maxWidth: '640px',
					width: '100%',
					scrollbarWidth: 'thin',
					scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
				}}
			>
				<div
					className='sc-FEMpB sc-hXLgLE bKUvZC'
					style={{
						boxSizing: 'border-box',
						touchAction: 'pan-x pan-y',
						margin: '0px',
						padding: '0px',
						border: '0px',
						fontSize: 'inherit',
						fontFamily: 'inherit',
						fontWeight: 'inherit',
						lineHeight: 'inherit',
						verticalAlign: 'baseline',
						flex: 'initial',
						gap: '4px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						scrollbarWidth: 'thin',
						scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
					}}
				>
					<div
						className='sc-FEMpB beapWc'
						style={{
							boxSizing: 'border-box',
							touchAction: 'pan-x pan-y',
							margin: '0px',
							padding: '0px',
							border: '0px',
							fontSize: 'inherit',
							fontFamily: 'inherit',
							fontWeight: 'inherit',
							lineHeight: 'inherit',
							verticalAlign: 'baseline',
							flex: 'initial',
							gap: '12px',
							display: 'flex',
							flexDirection: 'row',
							WebkitBoxAlign: 'center',
							alignItems: 'center',
							scrollbarWidth: 'thin',
							scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							width: '100%',
						}}
					>
						<span
							className='sc-dVBluf fgihZM'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								padding: '0px',
								border: '0px',
								fontFamily: 'inherit',
								verticalAlign: 'baseline',
								fontStyle: 'normal',
								textAlign: 'left',
								color: 'lch(9.723 0 282.863)',
								lineHeight: '2rem',
								fontSize: '1.5rem',
								fontWeight: 500,
								letterSpacing: '-0.01rem',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							}}
						>
							Templates
						</span>
					</div>
					<div
						className='sc-dVBluf sc-btzMgm brHDBA kRyUFe'
						style={{
							boxSizing: 'border-box',
							touchAction: 'pan-x pan-y',
							margin: '0px',
							padding: '0px',
							border: '0px',
							fontFamily: 'inherit',
							verticalAlign: 'baseline',
							fontStyle: 'normal',
							textAlign: 'left',
							color: 'lch(38.893 1 282.863)',
							fontSize: '.8125rem',
							fontWeight: 450,
							lineHeight: '22px',
							scrollbarWidth: 'thin',
							scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							width: '100%',
						}}
					>
						Workspace templates are available when creating issues, documents, and projects for all teams in
						the workspace. To create templates that only apply to certain teams, add them in the
						team-specific template settings.{' '}
						<a
							className='sc-fPrKGL juxzez'
							href='https://linear.app/docs/issue-templates'
							rel='noopener noreferrer'
							target='_blank'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								border: '0px',
								fontSize: 'inherit',
								fontFamily: 'inherit',
								fontWeight: 'inherit',
								lineHeight: 'inherit',
								verticalAlign: 'baseline',
								textDecoration: 'none',
								cursor: 'pointer',
								color: 'lch(9.723 0 282.863)',
								transitionProperty: 'color',
								transitionDuration: '.15s',
								whiteSpace: 'nowrap',
								padding: '1px 4px',
								borderRadius: '4px',
								marginLeft: '-3px',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							}}
						>
							Docs
						</a>
					</div>
				</div>
				<span
					className='sc-HSzEK cetmaT'
					style={{
						boxSizing: 'border-box',
						touchAction: 'pan-x pan-y',
						margin: '0px',
						padding: '0px',
						border: '0px',
						fontSize: 'inherit',
						fontFamily: 'inherit',
						fontWeight: 'inherit',
						lineHeight: 'inherit',
						verticalAlign: 'baseline',
						height: '32px',
						flexShrink: 0,
						scrollbarWidth: 'thin',
						scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
					}}
				/>
				<div
					className='sc-FEMpB dFoVbM'
					style={{
						boxSizing: 'border-box',
						touchAction: 'pan-x pan-y',
						margin: '0px',
						padding: '0px',
						border: '0px',
						fontSize: 'inherit',
						fontFamily: 'inherit',
						fontWeight: 'inherit',
						lineHeight: 'inherit',
						verticalAlign: 'baseline',
						flex: 'initial',
						gap: '48px',
						display: 'flex',
						flexDirection: 'column',
						scrollbarWidth: 'thin',
						scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
					}}
				>
					<div
						className='sc-FEMpB sc-hKXuaj cMNqmX iGkaIl'
						style={{
							boxSizing: 'border-box',
							touchAction: 'pan-x pan-y',
							margin: '0px',
							padding: '0px',
							border: '0px',
							fontSize: 'inherit',
							fontFamily: 'inherit',
							fontWeight: 'inherit',
							lineHeight: 'inherit',
							verticalAlign: 'baseline',
							flex: 'initial',
							gap: '16px',
							display: 'flex',
							flexDirection: 'column',
							opacity: 1,
							mixBlendMode: 'unset',
							scrollbarWidth: 'thin',
							scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
						}}
					>
						<div
							className='sc-FEMpB kSMvDH'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								padding: '0px',
								border: '0px',
								fontSize: 'inherit',
								fontFamily: 'inherit',
								fontWeight: 'inherit',
								lineHeight: 'inherit',
								verticalAlign: 'baseline',
								flex: 'initial',
								gap: '16px',
								display: 'flex',
								flexDirection: 'row',
								WebkitBoxAlign: 'center',
								alignItems: 'center',
								WebkitBoxPack: 'justify',
								justifyContent: 'space-between',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							}}
						>
							<div
								className='sc-FEMpB ceckat'
								style={{
									boxSizing: 'border-box',
									touchAction: 'pan-x pan-y',
									margin: '0px',
									padding: '0px',
									border: '0px',
									fontSize: 'inherit',
									fontFamily: 'inherit',
									fontWeight: 'inherit',
									lineHeight: 'inherit',
									verticalAlign: 'baseline',
									gap: '2px',
									display: 'flex',
									flexShrink: 'initial',
									flexBasis: 'initial',
									flexDirection: 'column',
									WebkitBoxFlex: '1',
									flexGrow: 1,
									scrollbarWidth: 'thin',
									scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
								}}
							>
								<div
									className='sc-FEMpB fAzVJz'
									style={{
										boxSizing: 'border-box',
										touchAction: 'pan-x pan-y',
										margin: '0px',
										padding: '0px',
										border: '0px',
										fontSize: 'inherit',
										fontFamily: 'inherit',
										fontWeight: 'inherit',
										lineHeight: 'inherit',
										verticalAlign: 'baseline',
										flex: 'initial',
										gap: '4px',
										display: 'flex',
										flexDirection: 'row',
										WebkitBoxAlign: 'center',
										alignItems: 'center',
										scrollbarWidth: 'thin',
										scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
									}}
								>
									<h3
										className='sc-dVBluf sc-lnQtlI cWFond boHwmj'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontFamily: 'inherit',
											verticalAlign: 'baseline',
											marginTop: '0px',
											marginBottom: '0px',
											fontStyle: 'normal',
											textAlign: 'left',
											color: 'lch(9.723 0 282.863)',
											lineHeight: '1.4375rem',
											fontSize: '.9375rem',
											fontWeight: 450,
											display: 'block',
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										}}
									>
										Issue templates
									</h3>
								</div>
							</div>
						</div>

						<div
							className='sc-FEMpB dPgeBP'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								padding: '0px',
								border: '0px',
								fontSize: 'inherit',
								fontFamily: 'inherit',
								fontWeight: 'inherit',
								lineHeight: 'inherit',
								verticalAlign: 'baseline',
								flex: 'initial',
								gap: '12px',
								display: 'flex',
								flexDirection: 'column',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							}}
						>
							<section
								className='sc-jnGgBm cAeoBk'
								style={{
									boxSizing: 'border-box',
									touchAction: 'pan-x pan-y',
									margin: '0px',
									padding: '0px',
									fontSize: 'inherit',
									fontFamily: 'inherit',
									fontWeight: 'inherit',
									lineHeight: 'inherit',
									verticalAlign: 'baseline',
									display: 'block',
									borderRadius: 'calc(6px + 1px)',
									border: '0.5px solid lch(87.22 0 282.863)',
									backgroundColor: 'lch(100 0 282.863)',
									scrollbarWidth: 'thin',
									scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
								}}
							>
								<header
									className='sc-dwnJDy jXXUma'
									style={{
										boxSizing: 'border-box',
										touchAction: 'pan-x pan-y',
										margin: '0px',
										border: '0px',
										fontSize: 'inherit',
										fontFamily: 'inherit',
										fontWeight: 'inherit',
										lineHeight: 'inherit',
										verticalAlign: 'baseline',
										gap: '16px',
										padding: '12px 16px',
										display: 'flex',
										WebkitBoxPack: 'justify',
										justifyContent: 'space-between',
										WebkitBoxAlign: 'center',
										alignItems: 'center',
										minHeight: '60px',
										scrollbarWidth: 'thin',
										scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										borderBottom: '0.5px solid lch(87.22 0 282.863)',
									}}
								>
									<div
										className='sc-FEMpB sc-eRUwLE foLUYm eXJAMV'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontSize: 'inherit',
											fontFamily: 'inherit',
											fontWeight: 'inherit',
											lineHeight: 'inherit',
											verticalAlign: 'baseline',
											flex: 'initial',
											gap: '2px',
											display: 'flex',
											flexDirection: 'column',
											opacity: 1,
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										}}
									>
										<h3
											className='sc-dVBluf hvOpcO'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												margin: '0px',
												padding: '0px',
												border: '0px',
												fontFamily: 'inherit',
												verticalAlign: 'baseline',
												marginTop: '0px',
												marginBottom: '0px',
												fontStyle: 'normal',
												textAlign: 'left',
												color: 'lch(9.821 0 282.863)',
												lineHeight: 'normal',
												fontSize: '.8125rem',
												fontWeight: 500,
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
											}}
										>
											<div
												className='sc-FEMpB clLjfv'
												style={{
													boxSizing: 'border-box',
													touchAction: 'pan-x pan-y',
													margin: '0px',
													padding: '0px',
													border: '0px',
													fontSize: 'inherit',
													fontFamily: 'inherit',
													fontWeight: 'inherit',
													lineHeight: 'inherit',
													verticalAlign: 'baseline',
													flex: 'initial',
													gap: '8px',
													display: 'flex',
													flexDirection: 'row',
													WebkitBoxAlign: 'center',
													alignItems: 'center',
													scrollbarWidth: 'thin',
													scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
												}}
											>
												1 issue template
											</div>
										</h3>
										<span
											className='sc-dVBluf EfYsk'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												margin: '0px',
												padding: '0px',
												border: '0px',
												fontFamily: 'inherit',
												verticalAlign: 'baseline',
												fontStyle: 'normal',
												textAlign: 'left',
												color: 'lch(39.286 1 282.863)',
												fontSize: '.75rem',
												fontWeight: 450,
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
												lineHeight: 'inherit',
											}}
										/>
									</div>
									<div
										className='sc-FEMpB hRVvZc'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontSize: 'inherit',
											fontFamily: 'inherit',
											fontWeight: 'inherit',
											lineHeight: 'inherit',
											verticalAlign: 'baseline',
											flex: 'initial',
											gap: '4px',
											display: 'flex',
											flexDirection: 'row',
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										}}
									>
										<div
											className='sc-FEMpB hIZvOU sc-beKSRx itlMiY'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												margin: '0px',
												padding: '0px',
												border: '0px',
												fontSize: 'inherit',
												fontFamily: 'inherit',
												fontWeight: 'inherit',
												lineHeight: 'inherit',
												verticalAlign: 'baseline',
												flex: 'initial',
												display: 'flex',
												flexDirection: 'row',
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
											}}
										>
											<button
												className='sc-dPKAra iilTEd sc-ixjNQG iMqzGo'
												type='button'
												aria-label='Create new issue template…'
												style={{
													boxSizing: 'border-box',
													touchAction: 'pan-x pan-y',
													fontFamily:
														'"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
													cursor: 'pointer',
													whiteSpace: 'nowrap',
													margin: '0px',
													borderRadius: '5px',
													border: '0.5px solid transparent',
													display: 'inline-flex',
													verticalAlign: 'top',
													WebkitBoxAlign: 'center',
													alignItems: 'center',
													WebkitBoxPack: 'center',
													justifyContent: 'center',
													flexShrink: 0,
													fontWeight: 500,
													lineHeight: 'normal',
													transitionProperty: 'border, background-color, color, opacity',
													transitionDuration: '.15s',
													userSelect: 'none',
													appRegion: 'no-drag',
													position: 'relative',
													backgroundColor: 'transparent',
													color: 'lch(19.643 1 282.863)',
													minWidth: '28px',
													height: '28px',
													fontSize: '.75rem',
													padding: '0px 2px',
													boxShadow: 'none',
													scrollbarWidth: 'thin',
													scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
													marginRight: '-4px',
												}}
											>
												<span
													aria-hidden='true'
													style={{
														boxSizing: 'border-box',
														touchAction: 'pan-x pan-y',
														margin: '0px',
														padding: '0px',
														border: '0px',
														fontSize: 'inherit',
														fontFamily: 'inherit',
														fontWeight: 'inherit',
														lineHeight: 'inherit',
														verticalAlign: 'baseline',
														scrollbarWidth: 'thin',
														scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
														display: 'inline-flex',
														WebkitBoxAlign: 'center',
														alignItems: 'center',
														WebkitBoxPack: 'center',
														justifyContent: 'center',
														maxWidth: '16px',
														maxHeight: '16px',
														transitionProperty: 'fill, stroke',
														transitionDuration: '.15s',
													}}
												>
													<svg
														height='16'
														width='16'
														aria-hidden='true'
														fill='lch(39.286% 1 282.863 / 1)'
														focusable='false'
														role='img'
														viewBox='0 0 16 16'
														xmlns='http://www.w3.org/2000/svg'
														style={{
															boxSizing: 'border-box',
															touchAction: 'pan-x pan-y',
															flexShrink: 0,
															transitionProperty: 'fill',
															transitionDuration: '.15s',
															scrollbarWidth: 'auto',
															scrollbarColor: 'initial',
														}}
													>
														<path
															d='M8.75 4C8.75 3.58579 8.41421 3.25 8 3.25C7.58579 3.25 7.25 3.58579 7.25 4V7.25H4C3.58579 7.25 3.25 7.58579 3.25 8C3.25 8.41421 3.58579 8.75 4 8.75H7.25V12C7.25 12.4142 7.58579 12.75 8 12.75C8.41421 12.75 8.75 12.4142 8.75 12V8.75H12C12.4142 8.75 12.75 8.41421 12.75 8C12.75 7.58579 12.4142 7.25 12 7.25H8.75V4Z'
															style={{
																boxSizing: 'border-box',
																touchAction: 'pan-x pan-y',
																scrollbarWidth: 'auto',
																scrollbarColor: 'initial',
															}}
														/>
													</svg>
												</span>
											</button>
										</div>
									</div>
								</header>
								<ul
									className='sc-dMZjno jTTgcv'
									style={{
										boxSizing: 'border-box',
										touchAction: 'pan-x pan-y',
										border: '0px',
										fontSize: 'inherit',
										fontFamily: 'inherit',
										fontWeight: 'inherit',
										lineHeight: 'inherit',
										verticalAlign: 'baseline',
										margin: '0px',
										padding: '0px',
										listStyle: 'none',
										marginTop: '0px',
										marginBottom: '0px',
										scrollbarWidth: 'thin',
										scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
									}}
								>
									<div
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontSize: 'inherit',
											fontFamily: 'inherit',
											fontWeight: 'inherit',
											lineHeight: 'inherit',
											verticalAlign: 'baseline',
											position: 'relative',
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
											transition: 'transform linear',
										}}
									>
										<div
											className='sc-fLzJWX inTlvT'
											aria-describedby='DndDescribedBy-13'
											aria-disabled='true'
											aria-roledescription='sortable'
											role='button'
											tabIndex='-1'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												margin: '0px',
												padding: '0px',
												border: '0px',
												fontSize: 'inherit',
												fontFamily: 'inherit',
												fontWeight: 'inherit',
												lineHeight: 'inherit',
												verticalAlign: 'baseline',
												borderRadius: '0px',
												position: 'relative',
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
											}}
										>
											<div
												className='sc-jlcvOw fIAJeG'
												style={{
													boxSizing: 'border-box',
													touchAction: 'pan-x pan-y',
													margin: '0px',
													padding: '0px',
													border: '0px',
													fontSize: 'inherit',
													fontFamily: 'inherit',
													fontWeight: 'inherit',
													lineHeight: 'inherit',
													verticalAlign: 'baseline',
													outlineOffset: '-3px',
													scrollbarWidth: 'thin',
													scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
												}}
											>
												<TemplateItem />
											</div>
										</div>
									</div>
									<div
										id='DndDescribedBy-13'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontSize: 'inherit',
											fontFamily: 'inherit',
											fontWeight: 'inherit',
											lineHeight: 'inherit',
											verticalAlign: 'baseline',
											position: 'relative',
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
											display: 'none',
										}}
									/>
									<div
										id='DndLiveRegion-12'
										aria-atomic='true'
										aria-live='assertive'
										role='status'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											fontSize: 'inherit',
											fontFamily: 'inherit',
											fontWeight: 'inherit',
											lineHeight: 'inherit',
											verticalAlign: 'baseline',
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
											margin: '-1px',
											border: '0px',
											padding: '0px',
											overflow: 'hidden',
											whiteSpace: 'nowrap',
											position: 'fixed',
											top: '0px',
											left: '0px',
											width: '1px',
											height: '1px',
											clip: 'rect(0px, 0px, 0px, 0px)',
											clipPath: 'inset(100%)',
										}}
									/>
								</ul>
							</section>
						</div>
					</div>

					<div
						className='sc-FEMpB sc-hKXuaj cMNqmX iGkaIl'
						style={{
							boxSizing: 'border-box',
							touchAction: 'pan-x pan-y',
							margin: '0px',
							padding: '0px',
							border: '0px',
							fontSize: 'inherit',
							fontFamily: 'inherit',
							fontWeight: 'inherit',
							lineHeight: 'inherit',
							verticalAlign: 'baseline',
							flex: 'initial',
							gap: '16px',
							display: 'flex',
							flexDirection: 'column',
							opacity: 1,
							mixBlendMode: 'unset',
							scrollbarWidth: 'thin',
							scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
						}}
					>
						<div
							className='sc-FEMpB kSMvDH'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								padding: '0px',
								border: '0px',
								fontSize: 'inherit',
								fontFamily: 'inherit',
								fontWeight: 'inherit',
								lineHeight: 'inherit',
								verticalAlign: 'baseline',
								flex: 'initial',
								gap: '16px',
								display: 'flex',
								flexDirection: 'row',
								WebkitBoxAlign: 'center',
								alignItems: 'center',
								WebkitBoxPack: 'justify',
								justifyContent: 'space-between',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							}}
						>
							<div
								className='sc-FEMpB ceckat'
								style={{
									boxSizing: 'border-box',
									touchAction: 'pan-x pan-y',
									margin: '0px',
									padding: '0px',
									border: '0px',
									fontSize: 'inherit',
									fontFamily: 'inherit',
									fontWeight: 'inherit',
									lineHeight: 'inherit',
									verticalAlign: 'baseline',
									gap: '2px',
									display: 'flex',
									flexShrink: 'initial',
									flexBasis: 'initial',
									flexDirection: 'column',
									WebkitBoxFlex: '1',
									flexGrow: 1,
									scrollbarWidth: 'thin',
									scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
								}}
							>
								<div
									className='sc-FEMpB fAzVJz'
									style={{
										boxSizing: 'border-box',
										touchAction: 'pan-x pan-y',
										margin: '0px',
										padding: '0px',
										border: '0px',
										fontSize: 'inherit',
										fontFamily: 'inherit',
										fontWeight: 'inherit',
										lineHeight: 'inherit',
										verticalAlign: 'baseline',
										flex: 'initial',
										gap: '4px',
										display: 'flex',
										flexDirection: 'row',
										WebkitBoxAlign: 'center',
										alignItems: 'center',
										scrollbarWidth: 'thin',
										scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
									}}
								>
									<h3
										className='sc-dVBluf sc-lnQtlI cWFond boHwmj'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontFamily: 'inherit',
											verticalAlign: 'baseline',
											marginTop: '0px',
											marginBottom: '0px',
											fontStyle: 'normal',
											textAlign: 'left',
											color: 'lch(9.723 0 282.863)',
											lineHeight: '1.4375rem',
											fontSize: '.9375rem',
											fontWeight: 450,
											display: 'block',
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										}}
									>
										Project templates
									</h3>
								</div>
							</div>
						</div>
						<div
							className='sc-FEMpB dPgeBP'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								padding: '0px',
								border: '0px',
								fontSize: 'inherit',
								fontFamily: 'inherit',
								fontWeight: 'inherit',
								lineHeight: 'inherit',
								verticalAlign: 'baseline',
								flex: 'initial',
								gap: '12px',
								display: 'flex',
								flexDirection: 'column',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							}}
						>
							<section
								className='sc-jnGgBm cAeoBk'
								style={{
									boxSizing: 'border-box',
									touchAction: 'pan-x pan-y',
									margin: '0px',
									padding: '0px',
									fontSize: 'inherit',
									fontFamily: 'inherit',
									fontWeight: 'inherit',
									lineHeight: 'inherit',
									verticalAlign: 'baseline',
									display: 'block',
									borderRadius: 'calc(6px + 1px)',
									border: '0.5px solid lch(87.22 0 282.863)',
									backgroundColor: 'lch(100 0 282.863)',
									scrollbarWidth: 'thin',
									scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
								}}
							>
								<header
									className='sc-dwnJDy jXXUma'
									style={{
										boxSizing: 'border-box',
										touchAction: 'pan-x pan-y',
										margin: '0px',
										border: '0px',
										fontSize: 'inherit',
										fontFamily: 'inherit',
										fontWeight: 'inherit',
										lineHeight: 'inherit',
										verticalAlign: 'baseline',
										gap: '16px',
										padding: '12px 16px',
										display: 'flex',
										WebkitBoxPack: 'justify',
										justifyContent: 'space-between',
										WebkitBoxAlign: 'center',
										alignItems: 'center',
										minHeight: '60px',
										scrollbarWidth: 'thin',
										scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
									}}
								>
									<div
										className='sc-FEMpB sc-eRUwLE foLUYm eXJAMV'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontSize: 'inherit',
											fontFamily: 'inherit',
											fontWeight: 'inherit',
											lineHeight: 'inherit',
											verticalAlign: 'baseline',
											flex: 'initial',
											gap: '2px',
											display: 'flex',
											flexDirection: 'column',
											opacity: 1,
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										}}
									>
										<h3
											className='sc-dVBluf hvOpcO'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												margin: '0px',
												padding: '0px',
												border: '0px',
												fontFamily: 'inherit',
												verticalAlign: 'baseline',
												marginTop: '0px',
												marginBottom: '0px',
												fontStyle: 'normal',
												textAlign: 'left',
												color: 'lch(9.821 0 282.863)',
												lineHeight: 'normal',
												fontSize: '.8125rem',
												fontWeight: 500,
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
											}}
										>
											<div
												className='sc-FEMpB clLjfv'
												style={{
													boxSizing: 'border-box',
													touchAction: 'pan-x pan-y',
													margin: '0px',
													padding: '0px',
													border: '0px',
													fontSize: 'inherit',
													fontFamily: 'inherit',
													fontWeight: 'inherit',
													lineHeight: 'inherit',
													verticalAlign: 'baseline',
													flex: 'initial',
													gap: '8px',
													display: 'flex',
													flexDirection: 'row',
													WebkitBoxAlign: 'center',
													alignItems: 'center',
													scrollbarWidth: 'thin',
													scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
												}}
											>
												<span
													className='sc-dVBluf iLfQjA'
													style={{
														boxSizing: 'border-box',
														touchAction: 'pan-x pan-y',
														margin: '0px',
														padding: '0px',
														border: '0px',
														fontFamily: 'inherit',
														verticalAlign: 'baseline',
														fontStyle: 'normal',
														textAlign: 'left',
														color: 'lch(39.286 1 282.863)',
														lineHeight: 'normal',
														fontSize: '.8125rem',
														fontWeight: 450,
														scrollbarWidth: 'thin',
														scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
													}}
												>
													No project templates
												</span>
											</div>
										</h3>
										<span
											className='sc-dVBluf EfYsk'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												margin: '0px',
												padding: '0px',
												border: '0px',
												fontFamily: 'inherit',
												verticalAlign: 'baseline',
												fontStyle: 'normal',
												textAlign: 'left',
												color: 'lch(39.286 1 282.863)',
												fontSize: '.75rem',
												fontWeight: 450,
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
												lineHeight: 'inherit',
											}}
										/>
									</div>
									<div
										className='sc-FEMpB hRVvZc'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontSize: 'inherit',
											fontFamily: 'inherit',
											fontWeight: 'inherit',
											lineHeight: 'inherit',
											verticalAlign: 'baseline',
											flex: 'initial',
											gap: '4px',
											display: 'flex',
											flexDirection: 'row',
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										}}
									>
										<button
											className='sc-dPKAra cNkkeu'
											type='button'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												fontFamily:
													'"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
												cursor: 'pointer',
												whiteSpace: 'nowrap',
												margin: '0px',
												borderRadius: '5px',
												border: '0.5px solid transparent',
												padding: '0px 14px',
												display: 'inline-flex',
												verticalAlign: 'top',
												WebkitBoxAlign: 'center',
												alignItems: 'center',
												WebkitBoxPack: 'center',
												justifyContent: 'center',
												flexShrink: 0,
												fontWeight: 500,
												lineHeight: 'normal',
												transitionProperty: 'border, background-color, color, opacity',
												transitionDuration: '.15s',
												userSelect: 'none',
												appRegion: 'no-drag',
												position: 'relative',
												backgroundColor: 'transparent',
												color: 'lch(19.643 1 282.863)',
												minWidth: '32px',
												height: '32px',
												fontSize: '.8125rem',
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
												marginRight: '-4px',
											}}
										>
											<span
												aria-hidden='true'
												style={{
													boxSizing: 'border-box',
													touchAction: 'pan-x pan-y',
													margin: '0px',
													padding: '0px',
													border: '0px',
													fontSize: 'inherit',
													fontFamily: 'inherit',
													fontWeight: 'inherit',
													lineHeight: 'inherit',
													verticalAlign: 'baseline',
													scrollbarWidth: 'thin',
													scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
													display: 'inline-flex',
													WebkitBoxAlign: 'center',
													alignItems: 'center',
													WebkitBoxPack: 'center',
													justifyContent: 'center',
													maxWidth: '18px',
													maxHeight: '18px',
													marginRight: '10px',
													transitionProperty: 'fill, stroke',
													transitionDuration: '.15s',
												}}
											>
												<svg
													height='16'
													width='16'
													aria-hidden='true'
													fill='lch(39.286% 1 282.863 / 1)'
													focusable='false'
													role='img'
													viewBox='0 0 16 16'
													xmlns='http://www.w3.org/2000/svg'
													style={{
														boxSizing: 'border-box',
														touchAction: 'pan-x pan-y',
														flexShrink: 0,
														transitionProperty: 'fill',
														transitionDuration: '.15s',
														scrollbarWidth: 'auto',
														scrollbarColor: 'initial',
														fill: 'currentcolor',
													}}
												>
													<path
														d='M8.75 4C8.75 3.58579 8.41421 3.25 8 3.25C7.58579 3.25 7.25 3.58579 7.25 4V7.25H4C3.58579 7.25 3.25 7.58579 3.25 8C3.25 8.41421 3.58579 8.75 4 8.75H7.25V12C7.25 12.4142 7.58579 12.75 8 12.75C8.41421 12.75 8.75 12.4142 8.75 12V8.75H12C12.4142 8.75 12.75 8.41421 12.75 8C12.75 7.58579 12.4142 7.25 12 7.25H8.75V4Z'
														style={{
															boxSizing: 'border-box',
															touchAction: 'pan-x pan-y',
															scrollbarWidth: 'auto',
															scrollbarColor: 'initial',
														}}
													/>
												</svg>
											</span>
											New template
										</button>
									</div>
								</header>
							</section>
						</div>
					</div>

					<div
						className='sc-FEMpB sc-hKXuaj cMNqmX iGkaIl'
						style={{
							boxSizing: 'border-box',
							touchAction: 'pan-x pan-y',
							margin: '0px',
							padding: '0px',
							border: '0px',
							fontSize: 'inherit',
							fontFamily: 'inherit',
							fontWeight: 'inherit',
							lineHeight: 'inherit',
							verticalAlign: 'baseline',
							flex: 'initial',
							gap: '16px',
							display: 'flex',
							flexDirection: 'column',
							opacity: 1,
							mixBlendMode: 'unset',
							scrollbarWidth: 'thin',
							scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
						}}
					>
						<div
							className='sc-FEMpB kSMvDH'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								padding: '0px',
								border: '0px',
								fontSize: 'inherit',
								fontFamily: 'inherit',
								fontWeight: 'inherit',
								lineHeight: 'inherit',
								verticalAlign: 'baseline',
								flex: 'initial',
								gap: '16px',
								display: 'flex',
								flexDirection: 'row',
								WebkitBoxAlign: 'center',
								alignItems: 'center',
								WebkitBoxPack: 'justify',
								justifyContent: 'space-between',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							}}
						>
							<div
								className='sc-FEMpB ceckat'
								style={{
									boxSizing: 'border-box',
									touchAction: 'pan-x pan-y',
									margin: '0px',
									padding: '0px',
									border: '0px',
									fontSize: 'inherit',
									fontFamily: 'inherit',
									fontWeight: 'inherit',
									lineHeight: 'inherit',
									verticalAlign: 'baseline',
									gap: '2px',
									display: 'flex',
									flexShrink: 'initial',
									flexBasis: 'initial',
									flexDirection: 'column',
									WebkitBoxFlex: '1',
									flexGrow: 1,
									scrollbarWidth: 'thin',
									scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
								}}
							>
								<div
									className='sc-FEMpB fAzVJz'
									style={{
										boxSizing: 'border-box',
										touchAction: 'pan-x pan-y',
										margin: '0px',
										padding: '0px',
										border: '0px',
										fontSize: 'inherit',
										fontFamily: 'inherit',
										fontWeight: 'inherit',
										lineHeight: 'inherit',
										verticalAlign: 'baseline',
										flex: 'initial',
										gap: '4px',
										display: 'flex',
										flexDirection: 'row',
										WebkitBoxAlign: 'center',
										alignItems: 'center',
										scrollbarWidth: 'thin',
										scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
									}}
								>
									<h3
										className='sc-dVBluf sc-lnQtlI cWFond boHwmj'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontFamily: 'inherit',
											verticalAlign: 'baseline',
											marginTop: '0px',
											marginBottom: '0px',
											fontStyle: 'normal',
											textAlign: 'left',
											color: 'lch(9.723 0 282.863)',
											lineHeight: '1.4375rem',
											fontSize: '.9375rem',
											fontWeight: 450,
											display: 'block',
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										}}
									>
										Document templates
									</h3>
								</div>
							</div>
						</div>
						<div
							className='sc-FEMpB dPgeBP'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								padding: '0px',
								border: '0px',
								fontSize: 'inherit',
								fontFamily: 'inherit',
								fontWeight: 'inherit',
								lineHeight: 'inherit',
								verticalAlign: 'baseline',
								flex: 'initial',
								gap: '12px',
								display: 'flex',
								flexDirection: 'column',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							}}
						>
							<section
								className='sc-jnGgBm cAeoBk'
								style={{
									boxSizing: 'border-box',
									touchAction: 'pan-x pan-y',
									margin: '0px',
									padding: '0px',
									fontSize: 'inherit',
									fontFamily: 'inherit',
									fontWeight: 'inherit',
									lineHeight: 'inherit',
									verticalAlign: 'baseline',
									display: 'block',
									borderRadius: 'calc(6px + 1px)',
									border: '0.5px solid lch(87.22 0 282.863)',
									backgroundColor: 'lch(100 0 282.863)',
									scrollbarWidth: 'thin',
									scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
								}}
							>
								<header
									className='sc-dwnJDy jXXUma'
									style={{
										boxSizing: 'border-box',
										touchAction: 'pan-x pan-y',
										margin: '0px',
										border: '0px',
										fontSize: 'inherit',
										fontFamily: 'inherit',
										fontWeight: 'inherit',
										lineHeight: 'inherit',
										verticalAlign: 'baseline',
										gap: '16px',
										padding: '12px 16px',
										display: 'flex',
										WebkitBoxPack: 'justify',
										justifyContent: 'space-between',
										WebkitBoxAlign: 'center',
										alignItems: 'center',
										minHeight: '60px',
										scrollbarWidth: 'thin',
										scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
									}}
								>
									<div
										className='sc-FEMpB sc-eRUwLE foLUYm eXJAMV'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontSize: 'inherit',
											fontFamily: 'inherit',
											fontWeight: 'inherit',
											lineHeight: 'inherit',
											verticalAlign: 'baseline',
											flex: 'initial',
											gap: '2px',
											display: 'flex',
											flexDirection: 'column',
											opacity: 1,
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										}}
									>
										<h3
											className='sc-dVBluf hvOpcO'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												margin: '0px',
												padding: '0px',
												border: '0px',
												fontFamily: 'inherit',
												verticalAlign: 'baseline',
												marginTop: '0px',
												marginBottom: '0px',
												fontStyle: 'normal',
												textAlign: 'left',
												color: 'lch(9.821 0 282.863)',
												lineHeight: 'normal',
												fontSize: '.8125rem',
												fontWeight: 500,
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
											}}
										>
											<div
												className='sc-FEMpB clLjfv'
												style={{
													boxSizing: 'border-box',
													touchAction: 'pan-x pan-y',
													margin: '0px',
													padding: '0px',
													border: '0px',
													fontSize: 'inherit',
													fontFamily: 'inherit',
													fontWeight: 'inherit',
													lineHeight: 'inherit',
													verticalAlign: 'baseline',
													flex: 'initial',
													gap: '8px',
													display: 'flex',
													flexDirection: 'row',
													WebkitBoxAlign: 'center',
													alignItems: 'center',
													scrollbarWidth: 'thin',
													scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
												}}
											>
												<span
													className='sc-dVBluf iLfQjA'
													style={{
														boxSizing: 'border-box',
														touchAction: 'pan-x pan-y',
														margin: '0px',
														padding: '0px',
														border: '0px',
														fontFamily: 'inherit',
														verticalAlign: 'baseline',
														fontStyle: 'normal',
														textAlign: 'left',
														color: 'lch(39.286 1 282.863)',
														lineHeight: 'normal',
														fontSize: '.8125rem',
														fontWeight: 450,
														scrollbarWidth: 'thin',
														scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
													}}
												>
													No document templates
												</span>
											</div>
										</h3>
										<span
											className='sc-dVBluf EfYsk'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												margin: '0px',
												padding: '0px',
												border: '0px',
												fontFamily: 'inherit',
												verticalAlign: 'baseline',
												fontStyle: 'normal',
												textAlign: 'left',
												color: 'lch(39.286 1 282.863)',
												fontSize: '.75rem',
												fontWeight: 450,
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
												lineHeight: 'inherit',
											}}
										/>
									</div>
									<div
										className='sc-FEMpB hRVvZc'
										style={{
											boxSizing: 'border-box',
											touchAction: 'pan-x pan-y',
											margin: '0px',
											padding: '0px',
											border: '0px',
											fontSize: 'inherit',
											fontFamily: 'inherit',
											fontWeight: 'inherit',
											lineHeight: 'inherit',
											verticalAlign: 'baseline',
											flex: 'initial',
											gap: '4px',
											display: 'flex',
											flexDirection: 'row',
											scrollbarWidth: 'thin',
											scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
										}}
									>
										<button
											className='sc-dPKAra cNkkeu'
											type='button'
											style={{
												boxSizing: 'border-box',
												touchAction: 'pan-x pan-y',
												fontFamily:
													'"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
												cursor: 'pointer',
												whiteSpace: 'nowrap',
												margin: '0px',
												borderRadius: '5px',
												border: '0.5px solid transparent',
												padding: '0px 14px',
												display: 'inline-flex',
												verticalAlign: 'top',
												WebkitBoxAlign: 'center',
												alignItems: 'center',
												WebkitBoxPack: 'center',
												justifyContent: 'center',
												flexShrink: 0,
												fontWeight: 500,
												lineHeight: 'normal',
												transitionProperty: 'border, background-color, color, opacity',
												transitionDuration: '.15s',
												userSelect: 'none',
												appRegion: 'no-drag',
												position: 'relative',
												backgroundColor: 'transparent',
												color: 'lch(19.643 1 282.863)',
												minWidth: '32px',
												height: '32px',
												fontSize: '.8125rem',
												scrollbarWidth: 'thin',
												scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
												marginRight: '-4px',
											}}
										>
											<span
												aria-hidden='true'
												style={{
													boxSizing: 'border-box',
													touchAction: 'pan-x pan-y',
													margin: '0px',
													padding: '0px',
													border: '0px',
													fontSize: 'inherit',
													fontFamily: 'inherit',
													fontWeight: 'inherit',
													lineHeight: 'inherit',
													verticalAlign: 'baseline',
													scrollbarWidth: 'thin',
													scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
													display: 'inline-flex',
													WebkitBoxAlign: 'center',
													alignItems: 'center',
													WebkitBoxPack: 'center',
													justifyContent: 'center',
													maxWidth: '18px',
													maxHeight: '18px',
													marginRight: '10px',
													transitionProperty: 'fill, stroke',
													transitionDuration: '.15s',
												}}
											>
												<svg
													height='16'
													width='16'
													aria-hidden='true'
													fill='lch(39.286% 1 282.863 / 1)'
													focusable='false'
													role='img'
													viewBox='0 0 16 16'
													xmlns='http://www.w3.org/2000/svg'
													style={{
														boxSizing: 'border-box',
														touchAction: 'pan-x pan-y',
														flexShrink: 0,
														transitionProperty: 'fill',
														transitionDuration: '.15s',
														scrollbarWidth: 'auto',
														scrollbarColor: 'initial',
														fill: 'currentcolor',
													}}
												>
													<path
														d='M8.75 4C8.75 3.58579 8.41421 3.25 8 3.25C7.58579 3.25 7.25 3.58579 7.25 4V7.25H4C3.58579 7.25 3.25 7.58579 3.25 8C3.25 8.41421 3.58579 8.75 4 8.75H7.25V12C7.25 12.4142 7.58579 12.75 8 12.75C8.41421 12.75 8.75 12.4142 8.75 12V8.75H12C12.4142 8.75 12.75 8.41421 12.75 8C12.75 7.58579 12.4142 7.25 12 7.25H8.75V4Z'
														style={{
															boxSizing: 'border-box',
															touchAction: 'pan-x pan-y',
															scrollbarWidth: 'auto',
															scrollbarColor: 'initial',
														}}
													/>
												</svg>
											</span>
											New template
										</button>
									</div>
								</header>
							</section>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

type TemplateItemProps = {
	id: string;
	title: string;
	description?: string;
	createdBy: string;
	createdAt: string;
	actions?: React.ReactNode;
};

const TemplateItem = ({ id, title, description, createdBy, createdAt, actions }: TemplateItemProps) => (
	<li className='p-3 flex items-center justify-between gap-3 border-b last:border-b-0'>
		<Link
			to='/settings/templates/proposal/$id/edit'
			params={{ id }}
			aria-label={title}
			// href='https://linear.app/hourglass-agency/settings/templates/issue/9c271268-a99b-4de4-bc69-038266ee202a/edit'
			style={{
				inset: '0px',
				position: 'absolute',
				display: 'block',
				borderRadius: '0px',
				scrollbarWidth: 'thin',
				scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
				borderBottomLeftRadius: '6px',
				borderBottomRightRadius: '6px',
			}}
		/>

		<figure className='size-9 rounded-md bg-muted grid place-items-center '>
			<Circle />
		</figure>

		<div
			className='sc-FEMpB bQEYiv'
			style={{
				boxSizing: 'border-box',
				touchAction: 'pan-x pan-y',
				margin: '0px',
				padding: '0px',
				border: '0px',
				fontSize: 'inherit',
				fontFamily: 'inherit',
				fontWeight: 'inherit',
				lineHeight: 'inherit',
				verticalAlign: 'baseline',
				gap: '12px',
				display: 'flex',
				flexShrink: 'initial',
				flexBasis: 'initial',
				flexDirection: 'row',
				WebkitBoxAlign: 'center',
				alignItems: 'center',
				WebkitBoxFlex: '1',
				flexGrow: 1,
				scrollbarWidth: 'thin',
				scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
			}}
		>
			<div
				className='sc-FEMpB foLUYm'
				style={{
					boxSizing: 'border-box',
					touchAction: 'pan-x pan-y',
					margin: '0px',
					padding: '0px',
					border: '0px',
					fontSize: 'inherit',
					fontFamily: 'inherit',
					fontWeight: 'inherit',
					lineHeight: 'inherit',
					verticalAlign: 'baseline',
					flex: 'initial',
					gap: '2px',
					display: 'flex',
					flexDirection: 'column',
					scrollbarWidth: 'thin',
					scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
				}}
			>
				<span
					className='sc-dVBluf hvOpcO'
					style={{
						boxSizing: 'border-box',
						touchAction: 'pan-x pan-y',
						margin: '0px',
						padding: '0px',
						border: '0px',
						fontFamily: 'inherit',
						verticalAlign: 'baseline',
						fontStyle: 'normal',
						textAlign: 'left',
						color: 'lch(9.821 0 282.863)',
						lineHeight: 'normal',
						fontSize: '.8125rem',
						fontWeight: 500,
						scrollbarWidth: 'thin',
						scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
					}}
				>
					{title}
				</span>

				<span
					className='sc-dVBluf EfYsk'
					style={{
						boxSizing: 'border-box',
						touchAction: 'pan-x pan-y',
						margin: '0px',
						padding: '0px',
						border: '0px',
						fontFamily: 'inherit',
						verticalAlign: 'baseline',
						fontStyle: 'normal',
						textAlign: 'left',
						color: 'lch(39.286 1 282.863)',
						lineHeight: 'normal',
						fontSize: '.75rem',
						fontWeight: 450,
						scrollbarWidth: 'thin',
						scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
					}}
				>
					Created by {createdBy} {createdAt}
				</span>
			</div>
		</div>

		<div
			className='sc-bTEXcv kXrbRl'
			style={{
				boxSizing: 'border-box',
				touchAction: 'pan-x pan-y',
				margin: '0px',
				padding: '0px',
				border: '0px',
				fontSize: 'inherit',
				fontFamily: 'inherit',
				fontWeight: 'inherit',
				lineHeight: 'inherit',
				verticalAlign: 'baseline',
				gap: '4px',
				opacity: 0,
				display: 'flex',
				position: 'relative',
				scrollbarWidth: 'thin',
				scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
			}}
		>
			<div
				className='sc-FEMpB hIZvOU sc-beKSRx itlMiY sc-behRQn cYzklM'
				style={{
					boxSizing: 'border-box',
					touchAction: 'pan-x pan-y',
					margin: '0px',
					padding: '0px',
					border: '0px',
					fontSize: 'inherit',
					fontFamily: 'inherit',
					fontWeight: 'inherit',
					lineHeight: 'inherit',
					verticalAlign: 'baseline',
					flex: 'initial',
					display: 'flex',
					flexDirection: 'row',
					minWidth: '0px',
					userSelect: 'none',
					cursor: 'pointer',
					scrollbarWidth: 'thin',
					scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
				}}
			>
				<div
					className='sc-jlcvOw fIAJeG'
					style={{
						boxSizing: 'border-box',
						touchAction: 'pan-x pan-y',
						margin: '0px',
						padding: '0px',
						border: '0px',
						fontSize: 'inherit',
						fontFamily: 'inherit',
						fontWeight: 'inherit',
						lineHeight: 'inherit',
						verticalAlign: 'baseline',
						outlineOffset: '-3px',
						scrollbarWidth: 'thin',
						scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
					}}
				>
					<button
						className='sc-dPKAra fPgtIn sc-ixjNQG iMqzGo'
						type='button'
						aria-haspopup='menu'
						aria-label='template actions'
						style={{
							boxSizing: 'border-box',
							touchAction: 'pan-x pan-y',
							fontFamily:
								'"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
							cursor: 'pointer',
							whiteSpace: 'nowrap',
							margin: '0px',
							borderRadius: '5px',
							border: '0.5px solid transparent',
							display: 'inline-flex',
							verticalAlign: 'top',
							WebkitBoxAlign: 'center',
							alignItems: 'center',
							WebkitBoxPack: 'center',
							justifyContent: 'center',
							flexShrink: 0,
							fontWeight: 500,
							lineHeight: 'normal',
							transitionProperty: 'border, background-color, color, opacity',
							transitionDuration: '.15s',
							userSelect: 'none',
							appRegion: 'no-drag',
							position: 'relative',
							backgroundColor: 'transparent',
							color: 'lch(19.643 1 282.863)',
							minWidth: '24px',
							height: '24px',
							fontSize: '.75rem',
							padding: '0px 2px',
							boxShadow: 'none',
							scrollbarWidth: 'thin',
							scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
						}}
					>
						<span
							aria-hidden='true'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								padding: '0px',
								border: '0px',
								fontSize: 'inherit',
								fontFamily: 'inherit',
								fontWeight: 'inherit',
								lineHeight: 'inherit',
								verticalAlign: 'baseline',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
								display: 'inline-flex',
								WebkitBoxAlign: 'center',
								alignItems: 'center',
								WebkitBoxPack: 'center',
								justifyContent: 'center',
								maxWidth: '16px',
								maxHeight: '16px',
								transitionProperty: 'fill, stroke',
								transitionDuration: '.15s',
							}}
						>
							<svg
								height='16'
								width='16'
								aria-hidden='true'
								fill='lch(39.286% 1 282.863 / 1)'
								focusable='false'
								role='img'
								viewBox='0 0 16 16'
								xmlns='http://www.w3.org/2000/svg'
								style={{
									boxSizing: 'border-box',
									touchAction: 'pan-x pan-y',
									flexShrink: 0,
									transitionProperty: 'fill',
									transitionDuration: '.15s',
									scrollbarWidth: 'auto',
									scrollbarColor: 'initial',
								}}
							>
								<path
									d='M3 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z'
									style={{
										boxSizing: 'border-box',
										touchAction: 'pan-x pan-y',
										scrollbarWidth: 'auto',
										scrollbarColor: 'initial',
									}}
								/>
							</svg>
						</span>
					</button>
				</div>
			</div>
		</div>
	</li>
);

const SectionItem = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<div className='flex flex-col gap-3'>
		<h3 className='text-sm font-medium'>{title}</h3>

		{children}
	</div>
);

const GroupedTemplateItem = ({
	title,
	count,
	templates,
}: {
	title: string;
	count: number;
	templates: ProposalTemplate[];
}) => (
	<section className='rounded-xl border'>
		<header className='min-h-14 flex items-center justify-between gap-3 p-3 border-b'>
			<div className='flex flex-col gap-1.5'>
				<h3 className='text-sm font-medium'>{title}</h3>
			</div>

			<div
				className='sc-FEMpB hRVvZc'
				style={{
					boxSizing: 'border-box',
					touchAction: 'pan-x pan-y',
					margin: '0px',
					padding: '0px',
					border: '0px',
					fontSize: 'inherit',
					fontFamily: 'inherit',
					fontWeight: 'inherit',
					lineHeight: 'inherit',
					verticalAlign: 'baseline',
					flex: 'initial',
					gap: '4px',
					display: 'flex',
					flexDirection: 'row',
					scrollbarWidth: 'thin',
					scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
				}}
			>
				<div
					className='sc-FEMpB hIZvOU sc-beKSRx itlMiY'
					style={{
						boxSizing: 'border-box',
						touchAction: 'pan-x pan-y',
						margin: '0px',
						padding: '0px',
						border: '0px',
						fontSize: 'inherit',
						fontFamily: 'inherit',
						fontWeight: 'inherit',
						lineHeight: 'inherit',
						verticalAlign: 'baseline',
						flex: 'initial',
						display: 'flex',
						flexDirection: 'row',
						scrollbarWidth: 'thin',
						scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
					}}
				>
					<Button
						variant='ghost'
						size='smIcon'
						className='sc-dPKAra iilTEd sc-ixjNQG iMqzGo'
						type='button'
						aria-label='Create new issue template…'
					>
						<Plus />
					</Button>
				</div>
			</div>
		</header>

		<ul
			className='sc-dMZjno jTTgcv'
			style={{
				boxSizing: 'border-box',
				touchAction: 'pan-x pan-y',
				border: '0px',
				fontSize: 'inherit',
				fontFamily: 'inherit',
				fontWeight: 'inherit',
				lineHeight: 'inherit',
				verticalAlign: 'baseline',
				margin: '0px',
				padding: '0px',
				listStyle: 'none',
				marginTop: '0px',
				marginBottom: '0px',
				scrollbarWidth: 'thin',
				scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
			}}
		>
			{templates?.map((template) => (
				<div
					style={{
						boxSizing: 'border-box',
						touchAction: 'pan-x pan-y',
						margin: '0px',
						padding: '0px',
						border: '0px',
						fontSize: 'inherit',
						fontFamily: 'inherit',
						fontWeight: 'inherit',
						lineHeight: 'inherit',
						verticalAlign: 'baseline',
						position: 'relative',
						scrollbarWidth: 'thin',
						scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
						transition: 'transform linear',
					}}
				>
					<div
						className='sc-fLzJWX inTlvT'
						aria-describedby='DndDescribedBy-13'
						aria-disabled='true'
						aria-roledescription='sortable'
						role='button'
						tabIndex='-1'
						style={{
							boxSizing: 'border-box',
							touchAction: 'pan-x pan-y',
							margin: '0px',
							padding: '0px',
							border: '0px',
							fontSize: 'inherit',
							fontFamily: 'inherit',
							fontWeight: 'inherit',
							lineHeight: 'inherit',
							verticalAlign: 'baseline',
							borderRadius: '0px',
							position: 'relative',
							scrollbarWidth: 'thin',
							scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
						}}
					>
						<div
							className='sc-jlcvOw fIAJeG'
							style={{
								boxSizing: 'border-box',
								touchAction: 'pan-x pan-y',
								margin: '0px',
								padding: '0px',
								border: '0px',
								fontSize: 'inherit',
								fontFamily: 'inherit',
								fontWeight: 'inherit',
								lineHeight: 'inherit',
								verticalAlign: 'baseline',
								outlineOffset: '-3px',
								scrollbarWidth: 'thin',
								scrollbarColor: 'lch(64.473% 1 282.863 / 1) transparent',
							}}
						>
							<TemplateItem
								id={template.id}
								title={template.name}
								createdBy={template.created_by}
								createdAt={template.created_at}
							/>
						</div>
					</div>
				</div>
			))}
		</ul>
	</section>
);
