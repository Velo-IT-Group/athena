import Metric from '@/components/metric-tracker-header/metric';
import Widget from '@/components/widget';
import { linksConfig } from '@/config/links';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { Activity, CalendarPlus, Handshake, LayoutGrid } from 'lucide-react';

export const Route = createFileRoute('/_authed/companies/$id/')({
	component: Highlights,
});

function Highlights() {
	const { id } = Route.useParams();

	const pathname = useLocation({ select: (l) => l.pathname });
	const { companyTabs } = linksConfig;

	const tabs = companyTabs.map((t) => ({
		...t,
		params: { id },
		badge: t.title !== undefined ? '-' : undefined,
	}));

	return (
		<div
			className='sc-bFykNo jSkZsv'
			style={{
				boxSizing: 'border-box',
				flex: '1 1 auto',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				isolation: 'isolate',
			}}
		>
			<div
				className='sc-gvBaNG cOMUTu'
				aria-hidden='true'
				style={{
					boxSizing: 'border-box',
					flex: '0 0 auto',
					transition: 'opacity 140ms',
					backgroundColor: 'rgba(35, 37, 41, 0.06)',
					opacity: 0,
					width: '100%',
					height: '1px',
				}}
			/>
			<div
				className='sc-bpAAPv djuODC'
				dir='ltr'
				style={{
					boxSizing: 'border-box',
					overflow: 'hidden',
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					position: 'relative',
				}}
			>
				<div
					className='sc-ijfqWo bzOEWl'
					style={{
						boxSizing: 'border-box',
						width: '100%',
						height: '100%',
						scrollbarWidth: 'none',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'stretch',
						overflow: 'hidden scroll',
					}}
				>
					<div
						style={{
							boxSizing: 'border-box',
							flexGrow: 1,
						}}
					>
						<div
							className='sc-dJjnMf lXWHq'
							aria-hidden='true'
							style={{
								boxSizing: 'border-box',
								width: '100%',
							}}
						/>
						<div
							className='sc-bXdtCk fTyeRD'
							style={{
								boxSizing: 'border-box',
								gap: '32px',
								padding: '24px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'stretch',
								justifyContent: 'flex-start',
							}}
						>
							<div
								className='sc-bXdtCk lbBXJz'
								style={{
									boxSizing: 'border-box',
									gap: '12px',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'stretch',
									justifyContent: 'flex-start',
								}}
							>
								<div
									className='sc-bXdtCk gHghHF sc-iIAiQN iSRJhU'
									style={{
										boxSizing: 'border-box',
										gap: '4px',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'initial',
										justifyContent: 'flex-start',
										marginTop: '-4px',
										marginBottom: '-4px',
										width: 'calc(100% + 0px)',
									}}
								>
									<div
										className='sc-bXdtCk fzMogh'
										style={{
											boxSizing: 'border-box',
											gap: '8px',
											display: 'flex',
											flexDirection: 'row',
											alignItems: 'center',
											justifyContent: 'space-between',
										}}
									>
										<div
											className='sc-bXdtCk bLvHfb'
											style={{
												boxSizing: 'border-box',
												gap: '4px',
												padding: '4px',
												display: 'flex',
												flexDirection: 'row',
												alignItems: 'center',
												justifyContent: 'flex-start',
											}}
										>
											<LayoutGrid />
											<div
												className='sc-hoLldG itPSss sc-kFXyV jZNvUI'
												style={{
													boxSizing: 'border-box',
													fontStyle: 'normal',
													textAlign: 'left',
													fontFamily: 'Inter',
													letterSpacing: '-0.02em',
													fontWeight: 600,
													lineHeight: '20px',
													fontSize: '14px',
													color: 'rgb(35, 37, 41)',
												}}
											>
												Highlights
											</div>
										</div>
									</div>
								</div>
								<section
									className='grid gap-2'
									style={
										{
											'--gap': '0.5rem',
											'--max-columns': 3,
											'--gap-count':
												'calc(var(--max-columns) - 1)',
											'--total-gap-width':
												'calc(var(--gap-count) * var(--gap))',
											'--grid-item-min-width': '168px',
											'--grid-item-max-width':
												'calc((100% - var(--total-gap-width)) / var(--max-columns))',
											gridTemplateColumns:
												'repeat(auto-fill, minmax(max(var(--grid-item-min-width), var(--grid-item-max-width)), 1fr))',
										} as React.CSSProperties
									}
								>
									<Metric
										label='Connection strength'
										renderOption={() => (
											<div>No interaction</div>
										)}
										icon={Handshake}
									/>

									<Metric
										label='Next calendar interaction'
										renderOption={() => (
											<div>No connection</div>
										)}
										icon={Handshake}
									/>

									<Metric
										label='Team'
										renderOption={() => (
											<div className='flex items-center min-h-8 flex-[1_1_auto] overflow-hidden'>
												<div className='h-8 min-h-8 flex-[1_1_auto] rounded-lg flex items-center justify-between overflow-hidden relative'>
													<div className='w-full relative'>
														<div className='w-full'>
															<div className='p-1.5'>
																<div className='flex items-center gap-1'>
																	<span className='h-5 py-0.5 px-1.5 rounded-[6px] bg-primary border-primary text-primary-foreground items-center inline-flex flex-row'>
																		<span className='text-xs font-medium tracking-tight truncate line-clamp-1 flex-[0_1_auto] min-w-0'>
																			nicholas.black98@icloud.com
																		</span>
																	</span>

																	<span className='h-5 py-0.5 px-1.5 rounded-[6px] bg-primary border-primary text-primary-foreground items-center inline-flex flex-row'>
																		<span className='text-xs font-medium tracking-tight truncate line-clamp-1 flex-[0_1_auto]'>
																			nicholas.black98@icloud.com
																		</span>
																	</span>

																	<span className='h-5 py-0.5 px-1.5 rounded-[6px] bg-primary border-primary text-primary-foreground items-center inline-flex flex-row'>
																		<span className='text-xs font-medium tracking-tight truncate line-clamp-1 flex-[0_1_auto]'>
																			nicholas.black98@icloud.com
																		</span>
																	</span>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										)}
										icon={Handshake}
									/>

									<Metric
										label='Next calendar interaction'
										renderOption={() => (
											<div>No connection</div>
										)}
										icon={Handshake}
									/>

									<Metric
										label='Next calendar interaction'
										renderOption={() => (
											<div>No connection</div>
										)}
										icon={Handshake}
									/>

									<Metric
										label='Next calendar interaction'
										renderOption={() => (
											<div>No connection</div>
										)}
										icon={Handshake}
									/>
								</section>
							</div>
							<div
								className='sc-bXdtCk lbBXJz'
								style={{
									boxSizing: 'border-box',
									gap: '12px',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'stretch',
									justifyContent: 'flex-start',
								}}
							>
								<div
									className='sc-bXdtCk gHghHF sc-iIAiQN iSRJhU'
									style={{
										boxSizing: 'border-box',
										gap: '4px',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'initial',
										justifyContent: 'flex-start',
										marginTop: '-4px',
										marginBottom: '-4px',
										width: 'calc(100% + 0px)',
									}}
								>
									<div
										className='sc-bXdtCk fzMogh'
										style={{
											boxSizing: 'border-box',
											gap: '8px',
											display: 'flex',
											flexDirection: 'row',
											alignItems: 'center',
											justifyContent: 'space-between',
										}}
									>
										<div
											className='sc-bXdtCk kojqqR sc-iIAiQN dAGDIV'
											style={{
												boxSizing: 'border-box',
												gap: '4px',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'initial',
												justifyContent: 'flex-start',
												marginLeft: '-2px',
												width: 'auto',
											}}
										>
											<a
												className='sc-gnqCJb fXjuQX'
												type='button'
												aria-busy='false'
												href='https://app.attio.com/velo-it-group/company/725cfce2-623e-4c5f-8dd8-460058bc7d0c/activity'
												style={{
													boxSizing: 'border-box',
													margin: '0px',
													outline: 'none',
													border: 'none',
													textDecoration: 'none',
													gap: '6px',
													background:
														'rgba(0, 0, 0, 0)',
													padding: '4px 8px 4px 6px',
													borderRadius: '8px',
													transition:
														'background-color 0.2s, color 0.2s, box-shadow 0.2s',
													position: 'relative',
													display: 'flex',
													flexShrink: 0,
													flexGrow: 0,
													alignItems: 'center',
													justifyContent: 'center',
													opacity: 1,
													cursor: 'pointer',
													boxShadow:
														'var(--button-shadow)',
												}}
											>
												<div
													className='sc-dRHutB bYGUAg'
													style={{
														boxSizing: 'border-box',
														display: 'inline-flex',
														alignItems: 'center',
														justifyContent:
															'center',
													}}
												>
													<Activity />
												</div>
												<div
													className='sc-bXYrjy fjltGX'
													style={{
														boxSizing: 'border-box',
														overflow: 'hidden',
														whiteSpace: 'nowrap',
														display: 'inline-block',
														verticalAlign: 'bottom',
														textOverflow:
															'ellipsis',
														fontSize: '14px',
														lineHeight: '20px',
														fontWeight: 500,
														letterSpacing:
															'-0.02em',
														color: 'rgba(0, 0, 0, 0.6)',
													}}
												>
													<div
														className='sc-hoLldG itPSss sc-kFXyV jZNvUI'
														style={{
															boxSizing:
																'border-box',
															fontStyle: 'normal',
															textAlign: 'left',
															fontFamily: 'Inter',
															letterSpacing:
																'-0.02em',
															fontWeight: 600,
															lineHeight: '20px',
															fontSize: '14px',
															color: 'rgb(35, 37, 41)',
														}}
													>
														Activity
													</div>
												</div>
												<div
													className='sc-bXdtCk ePdJMe'
													style={{
														boxSizing: 'border-box',
														gap: '2px',
														display: 'flex',
														flexDirection: 'row',
														alignItems: 'center',
														justifyContent:
															'flex-start',
													}}
												>
													<svg
														className='sc-jMpmlX fkmkHi'
														height='14px'
														width='14px'
														style={{
															boxSizing:
																'border-box',
															flex: '0 0 auto',
														}}
													>
														<use
															height='14px'
															width='14px'
															href='https://app.attio.com/web-assets/assets/icon-defs/e194a3261fbcf28a5de84cf56a3c549d.svg#icon'
															style={{
																boxSizing:
																	'border-box',
															}}
														/>
													</svg>
												</div>
											</a>
										</div>
									</div>
								</div>
								<div
									className='sc-bXdtCk jQbia sc-cySJGp kIdmhI'
									style={{
										boxSizing: 'border-box',
										gap: '6px',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'stretch',
										justifyContent: 'flex-start',
										isolation: 'isolate',
									}}
								>
									<div
										className='sc-bXdtCk bIYRCE sc-cLotwl cFFzqx'
										style={{
											boxSizing: 'border-box',
											gap: '6px',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'stretch',
											justifyContent: 'flex-start',
											padding: '4px',
											border: '1px solid rgb(238, 239, 241)',
											borderRadius: '12px',
										}}
									>
										<div
											className='sc-dwjQoy fAqpn'
											style={{
												boxSizing: 'border-box',
												display: 'grid',
											}}
										>
											<div
												className='sc-grhgvZ kvBLOf'
												style={{
													boxSizing: 'border-box',
													padding: '6px 8px',
												}}
											>
												<div
													className='sc-bSPbvc iJrHP'
													style={{
														boxSizing: 'border-box',
														gridTemplate:
															'"event-timeline event-content" "footer-timeline footer-content" / 16px 1fr',
														display: 'grid',
														isolation: 'isolate',
														columnGap: '6px',
													}}
												>
													<div
														className='sc-cLLWSh leUrJv'
														style={{
															boxSizing:
																'border-box',
															position:
																'relative',
															display: 'flex',
															justifyContent:
																'center',
															alignItems:
																'flex-start',
															width: '100%',
														}}
													>
														<div
															className='sc-ecnyzL holHFP'
															style={{
																boxSizing:
																	'border-box',
																borderRadius:
																	'50%',
																display: 'flex',
																alignItems:
																	'center',
																justifyContent:
																	'center',
																backgroundColor:
																	'rgb(255, 255, 255)',
																width: '16px',
																height: '20px',
																zIndex: 1,
																boxShadow:
																	'rgb(255, 255, 255) 0px 0px 0px 2px',
															}}
														>
															<span
																className='sc-zyse kmUCDm'
																style={{
																	boxSizing:
																		'border-box',
																	overflow:
																		'hidden',
																	position:
																		'relative',
																	display:
																		'inline-flex',
																	alignItems:
																		'center',
																	justifyContent:
																		'center',
																	verticalAlign:
																		'top',
																	userSelect:
																		'none',
																	flexShrink: 0,
																	width: '16px',
																	height: '16px',
																	borderRadius:
																		'100%',
																}}
															>
																<span
																	className='sc-dRESEw fEmyGn'
																	style={{
																		boxSizing:
																			'border-box',
																		transition:
																			'background-color 0.2s',
																		display:
																			'flex',
																		alignItems:
																			'center',
																		justifyContent:
																			'center',
																		width: '100%',
																		height: '100%',
																		cursor: 'default',
																		userSelect:
																			'none',
																		backgroundColor:
																			'rgb(253, 144, 56)',
																		color: 'rgb(254, 238, 225)',
																		fontWeight: 500,
																		fontSize:
																			'10px',
																		textTransform:
																			'uppercase',
																		lineHeight: 1,
																	}}
																>
																	N
																</span>
															</span>
														</div>
													</div>
													<div
														className='sc-cuEgWE ccEAlg'
														style={{
															boxSizing:
																'border-box',
															minWidth: '0px',
															paddingBottom:
																'12px',
														}}
													>
														<div
															className='sc-bXdtCk cSrZnC'
															style={{
																boxSizing:
																	'border-box',
																flex: '1 1 auto',
																gap: '16px',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'baseline',
																justifyContent:
																	'flex-start',
																marginLeft:
																	'0px',
															}}
														>
															<div
																className='sc-hoLldG itPSss sc-kThouk sc-jkPneF Bgngt hHytOy'
																style={{
																	boxSizing:
																		'border-box',
																	fontStyle:
																		'normal',
																	textAlign:
																		'left',
																	fontFamily:
																		'Inter',
																	letterSpacing:
																		'-0.02em',
																	fontWeight: 500,
																	lineHeight:
																		'20px',
																	fontSize:
																		'14px',
																	overflow:
																		'hidden',
																	overflowWrap:
																		'anywhere',
																	minWidth:
																		'0px',
																	color: 'rgb(117, 119, 124)',
																}}
															>
																<div
																	className='sc-bXdtCk eLtKk'
																	style={{
																		boxSizing:
																			'border-box',
																		flexFlow:
																			'wrap',
																		gap: '4px 3px',
																		display:
																			'flex',
																		alignItems:
																			'center',
																		justifyContent:
																			'flex-start',
																	}}
																>
																	<div
																		className='sc-hoLldG itPSss sc-kThouk Bgngt'
																		style={{
																			boxSizing:
																				'border-box',
																			fontStyle:
																				'normal',
																			textAlign:
																				'left',
																			fontFamily:
																				'Inter',
																			letterSpacing:
																				'-0.02em',
																			fontWeight: 500,
																			lineHeight:
																				'20px',
																			fontSize:
																				'14px',
																			overflow:
																				'hidden',
																			whiteSpace:
																				'nowrap',
																			textOverflow:
																				'ellipsis',
																			color: 'rgb(35, 37, 41)',
																		}}
																	>
																		Nicholas
																		Black
																	</div>
																	<div
																		className='sc-hoLldG itPSss sc-kThouk Bgngt'
																		style={{
																			boxSizing:
																				'border-box',
																			fontStyle:
																				'normal',
																			textAlign:
																				'left',
																			fontFamily:
																				'Inter',
																			letterSpacing:
																				'-0.02em',
																			fontWeight: 500,
																			lineHeight:
																				'20px',
																			fontSize:
																				'14px',
																			color: 'rgb(117, 119, 124)',
																		}}
																	>
																		changed
																	</div>
																	<button
																		className='sc-cySBDi fQTdgQ'
																		type='button'
																		aria-controls='radix-:r3ah:'
																		aria-expanded='false'
																		aria-haspopup='dialog'
																		style={{
																			boxSizing:
																				'border-box',
																			font: 'inherit',
																			outlineWidth:
																				'0px',
																			cursor: 'pointer',
																			padding:
																				'0px 3px 0px 2px',
																			textDecoration:
																				'none',
																			gap: '4px',
																			border: '1px solid transparent',
																			borderRadius:
																				'8px',
																			appearance:
																				'none',
																			backgroundColor:
																				'transparent',
																			position:
																				'relative',
																			display:
																				'inline-flex',
																			alignItems:
																				'center',
																			color: 'rgb(35, 37, 41)',
																		}}
																	>
																		<span
																			className='sc-ceQylt gdsENC sc-gMjlEU deKpfz'
																			style={{
																				boxSizing:
																					'border-box',
																				whiteSpace:
																					'nowrap',
																				display:
																					'-webkit-box',
																				WebkitLineClamp:
																					'1',
																				WebkitBoxOrient:
																					'vertical',
																				textDecoration:
																					'none',
																				fontFamily:
																					'Inter',
																				letterSpacing:
																					'-0.02em',
																				fontWeight: 500,
																				lineHeight:
																					'20px',
																				fontSize:
																					'14px',
																				color: 'currentcolor',
																				position:
																					'relative',
																			}}
																		>
																			2 attributes
																		</span>
																	</button>
																</div>
															</div>
															<div
																className='sc-hoLldG itPSss sc-cIozSW sc-irSrHA bZFlVj htPjCf'
																style={{
																	boxSizing:
																		'border-box',
																	fontStyle:
																		'normal',
																	textAlign:
																		'left',
																	fontFamily:
																		'Inter',
																	letterSpacing:
																		'-0.02em',
																	fontWeight: 500,
																	lineHeight:
																		'16px',
																	fontSize:
																		'12px',
																	whiteSpace:
																		'nowrap',
																	marginLeft:
																		'auto',
																	color: 'rgb(159, 161, 167)',
																}}
															>
																18 minutes ago
															</div>
														</div>
													</div>
												</div>
												<div
													className='sc-iOOSyu dsMIJe'
													style={{
														boxSizing: 'border-box',
														flex: '1 1 auto',
														width: '100%',
													}}
												>
													<div
														className='sc-bSPbvc iJrHP'
														style={{
															boxSizing:
																'border-box',
															gridTemplate:
																'"event-timeline event-content" "footer-timeline footer-content" / 16px 1fr',
															display: 'grid',
															isolation:
																'isolate',
															columnGap: '6px',
														}}
													>
														<div
															className='sc-cLLWSh gwpOfK'
															style={{
																boxSizing:
																	'border-box',
																position:
																	'relative',
																display: 'flex',
																justifyContent:
																	'center',
																alignItems:
																	'flex-start',
																width: '100%',
															}}
														>
															<div
																className='sc-ecnyzL holHFP'
																style={{
																	boxSizing:
																		'border-box',
																	borderRadius:
																		'50%',
																	display:
																		'flex',
																	alignItems:
																		'center',
																	justifyContent:
																		'center',
																	backgroundColor:
																		'rgb(255, 255, 255)',
																	width: '16px',
																	height: '20px',
																	zIndex: 1,
																	boxShadow:
																		'rgb(255, 255, 255) 0px 0px 0px 2px',
																}}
															>
																<span
																	className='sc-zyse kmUCDm'
																	style={{
																		boxSizing:
																			'border-box',
																		overflow:
																			'hidden',
																		position:
																			'relative',
																		display:
																			'inline-flex',
																		alignItems:
																			'center',
																		justifyContent:
																			'center',
																		verticalAlign:
																			'top',
																		userSelect:
																			'none',
																		flexShrink: 0,
																		width: '16px',
																		height: '16px',
																		borderRadius:
																			'100%',
																	}}
																>
																	<span
																		className='sc-dRESEw fEmyGn'
																		style={{
																			boxSizing:
																				'border-box',
																			transition:
																				'background-color 0.2s',
																			display:
																				'flex',
																			alignItems:
																				'center',
																			justifyContent:
																				'center',
																			width: '100%',
																			height: '100%',
																			cursor: 'default',
																			userSelect:
																				'none',
																			backgroundColor:
																				'rgb(253, 144, 56)',
																			color: 'rgb(254, 238, 225)',
																			fontWeight: 500,
																			fontSize:
																				'10px',
																			textTransform:
																				'uppercase',
																			lineHeight: 1,
																		}}
																	>
																		N
																	</span>
																</span>
															</div>
														</div>
														<div
															className='sc-cuEgWE jNaxCb'
															style={{
																boxSizing:
																	'border-box',
																minWidth: '0px',
																paddingBottom:
																	'0px',
															}}
														>
															<div
																className='sc-bXdtCk cSrZnC'
																style={{
																	boxSizing:
																		'border-box',
																	flex: '1 1 auto',
																	gap: '16px',
																	display:
																		'flex',
																	flexDirection:
																		'row',
																	alignItems:
																		'baseline',
																	justifyContent:
																		'flex-start',
																	marginLeft:
																		'0px',
																}}
															>
																<div
																	className='sc-hoLldG itPSss sc-kThouk sc-jkPneF Bgngt hHytOy'
																	style={{
																		boxSizing:
																			'border-box',
																		fontStyle:
																			'normal',
																		textAlign:
																			'left',
																		fontFamily:
																			'Inter',
																		letterSpacing:
																			'-0.02em',
																		fontWeight: 500,
																		lineHeight:
																			'20px',
																		fontSize:
																			'14px',
																		overflow:
																			'hidden',
																		overflowWrap:
																			'anywhere',
																		minWidth:
																			'0px',
																		color: 'rgb(117, 119, 124)',
																	}}
																>
																	<strong
																		style={{
																			boxSizing:
																				'border-box',
																			fontFamily:
																				'Inter',
																			letterSpacing:
																				'-0.02em',
																			fontWeight: 500,
																			lineHeight:
																				'20px',
																			fontSize:
																				'14px',
																			color: 'rgb(35, 37, 41)',
																		}}
																	>
																		Velo IT
																		Group
																	</strong>{' '}
																	was created
																	by{' '}
																	<strong
																		style={{
																			boxSizing:
																				'border-box',
																			fontFamily:
																				'Inter',
																			letterSpacing:
																				'-0.02em',
																			fontWeight: 500,
																			lineHeight:
																				'20px',
																			fontSize:
																				'14px',
																			color: 'rgb(35, 37, 41)',
																		}}
																	>
																		Nicholas
																		Black
																	</strong>
																</div>
																<div
																	className='sc-hoLldG itPSss sc-cIozSW sc-irSrHA bZFlVj htPjCf'
																	style={{
																		boxSizing:
																			'border-box',
																		fontStyle:
																			'normal',
																		textAlign:
																			'left',
																		fontFamily:
																			'Inter',
																		letterSpacing:
																			'-0.02em',
																		fontWeight: 500,
																		lineHeight:
																			'16px',
																		fontSize:
																			'12px',
																		whiteSpace:
																			'nowrap',
																		marginLeft:
																			'auto',
																		color: 'rgb(159, 161, 167)',
																	}}
																>
																	19 minutes
																	ago
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div
											className='sc-bXdtCk dyDkSs'
											style={{
												boxSizing: 'border-box',
												gap: '4px',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												alignSelf: 'flex-start',
												justifyContent: 'flex-start',
												paddingBottom: '2px',
												paddingLeft: '2px',
												paddingRight: '2px',
											}}
										>
											<a
												className='sc-gnqCJb gcRKbf'
												type='button'
												aria-busy='false'
												href='https://app.attio.com/velo-it-group/company/725cfce2-623e-4c5f-8dd8-460058bc7d0c/activity'
												style={{
													boxSizing: 'border-box',
													margin: '0px',
													outline: 'none',
													border: 'none',
													textDecoration: 'none',
													gap: '4px',
													background:
														'rgba(0, 0, 0, 0)',
													padding: '2px 4px 2px 6px',
													borderRadius: '6px',
													transition:
														'background-color 0.2s, color 0.2s, box-shadow 0.2s',
													position: 'relative',
													display: 'flex',
													flexShrink: 0,
													flexGrow: 0,
													alignItems: 'center',
													justifyContent: 'center',
													opacity: 1,
													cursor: 'pointer',
													boxShadow:
														'var(--button-shadow)',
												}}
											>
												<div
													className='sc-bXYrjy kzHAQA'
													style={{
														boxSizing: 'border-box',
														overflow: 'hidden',
														whiteSpace: 'nowrap',
														display: 'inline-block',
														verticalAlign: 'bottom',
														textOverflow:
															'ellipsis',
														fontSize: '12px',
														lineHeight: '16px',
														fontWeight: 500,
														letterSpacing:
															'-0.02em',
														color: 'rgba(0, 0, 0, 0.6)',
													}}
												>
													View all
												</div>
												<div
													className='sc-dRHutB bYGUAg'
													style={{
														boxSizing: 'border-box',
														display: 'inline-flex',
														alignItems: 'center',
														justifyContent:
															'center',
													}}
												>
													<svg
														className='sc-jMpmlX dpHgXw'
														height='12px'
														width='12px'
														style={{
															boxSizing:
																'border-box',
															flex: '0 0 auto',
														}}
													>
														<use
															height='12px'
															width='12px'
															href='https://app.attio.com/web-assets/assets/icon-defs/e194a3261fbcf28a5de84cf56a3c549d.svg#icon'
															style={{
																boxSizing:
																	'border-box',
															}}
														/>
													</svg>
												</div>
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div
							className='sc-dJjnMf lXWHq'
							aria-hidden='true'
							style={{
								boxSizing: 'border-box',
								width: '100%',
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
