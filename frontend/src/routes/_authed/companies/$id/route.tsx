import TabsList, { TabItem } from '@/components/tabs-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	Editable,
	EditableInput,
	EditablePreview,
} from '@/components/ui/editable';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { linksConfig } from '@/config/links';
import { getCompanyQuery } from '@/lib/manage/api';
import {
	getCompanyNotesCount,
	getConfigurationsCount,
	getContactsCount,
	getTicketCount,
} from '@/lib/manage/read';
import { getProposalsQuery } from '@/lib/supabase/api';
import { NavItem as NavItemType, NavSection } from '@/types/nav';
import { useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { ImagePlus, LayoutGrid, MailPlus, Star, Workflow } from 'lucide-react';

export const Route = createFileRoute('/_authed/companies/$id')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { companyTabs } = linksConfig;

	const [
		{ data: company },
		{ data: ticketCount },
		{ data: contactCount },
		{ data: configurationCount },
		{ data: notesCount },
		{
			data: { count },
		},
	] = useSuspenseQueries({
		queries: [
			getCompanyQuery(Number(id)),
			{
				queryKey: ['companies', id, 'tickets', 'count'],
				queryFn: () =>
					getTicketCount({
						data: {
							conditions: {
								'company/id': Number(id),
								closedFlag: false,
							},
						},
					}),
			},
			{
				queryKey: ['companies', id, 'contacts', 'count'],
				queryFn: () =>
					getContactsCount({
						data: {
							conditions: {
								'company/id': Number(id),
							},
							childConditions: 'types/id = 17 or types/id = 21',
						},
					}),
			},
			{
				queryKey: ['companies', id, 'configurations', 'count'],
				queryFn: () =>
					getConfigurationsCount({
						data: {
							conditions: {
								'company/id': Number(id),
								activeFlag: true,
							},
						},
					}),
			},
			{
				queryKey: ['companies', id, 'notes', 'count'],
				queryFn: () =>
					getCompanyNotesCount({ data: { id: Number(id) } }),
			},
			getProposalsQuery({
				companyFilters: [id],
			}),
		],
	});

	const getBadgeCount = (
		title: string | undefined
	): string | number | undefined => {
		switch (title) {
			case 'Activity':
				return undefined;
			case 'Tickets':
				return ticketCount.count || '-';
			case 'Contacts':
				return contactCount.count || '-';
			case 'Configurations':
				return configurationCount.count || '-';
			case 'Notes':
				return notesCount.count || '-';
			case 'Proposals':
				return count || '-';
			default:
				return '-';
		}
	};

	const tabs = companyTabs.map((s) => ({
		...s,
		items: s.items.map((t) => ({
			...t,
			params: { id },
			badge: getBadgeCount(t.title),
		})),
	}));

	return (
		<div className=''>
			<div className='py-[10px] px-[12px] flex justify-between items-center gap-10 border-b'>
				<div className='flex items-center justify-start min-w-[300px] gap-0'>
					<div className='flex items-center justify-start gap-[6px]'>
						<Avatar className='size-[28px]'>
							<AvatarFallback>V</AvatarFallback>
							<AvatarImage
								className='size-[28px]'
								src='https://img.logo.dev/velomethod.com?token=pk_We89CNc6T1-QRD4CkOUhww'
							/>
						</Avatar>

						<Editable
							defaultValue={company.name}
							autosize
						>
							<EditablePreview
								className={buttonVariants({
									variant: 'ghost',
									className: 'px-[4px] py-[6px]',
								})}
							/>
							<EditableInput className='px-[4px] py-[6px] text-[16px] font-semibold h-9' />
						</Editable>
					</div>

					<Button
						size='icon'
						variant='ghost'
					>
						<Star size={14} />
					</Button>
				</div>

				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='sm'
					>
						<MailPlus />
						<span>Compose email</span>
					</Button>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<MailPlus />
								<span className='sr-only'>Add to list</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Add to list</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<ImagePlus />
								<span className='sr-only'>Add to list</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Add to list</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<Workflow />
								<span className='sr-only'>Run to workflow</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Run to workflow</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<ImagePlus />
								<span className='sr-only'>Add to list</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Add to list</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<div className='flex flex-[1_1_auto]'>
				<div className='flex flex-[1_1_auto] min-w-[350px] w-[61.803%]'>
					<Highlights tabs={tabs}>
						<Outlet />
					</Highlights>
				</div>

				<div className='flex flex-[1_1_auto] min-w-[250px] w-[38.197%]'>
					<div className='w-full flex flex-col items-start justify-start gap-0'>
						<RecordDetailsHeader />
						<RecordDetails />
					</div>
				</div>
			</div>
		</div>
	);
}

export function Highlights({
	tabs,
	children,
}: {
	tabs: NavSection[];
	children: React.ReactNode;
}) {
	return (
		<div className='flex-[1_1_auto] overflow-hidden flex flex-col min-h-0 relative pt-2'>
			<div className='flex max-w-full flex-[0_0_auto] px-3 relative pb-2'>
				<div
					className='gap-1 flex flex-row items-center min-w-0 outline-none'
					tabIndex={0}
				>
					<TabsList tabs={tabs} />
				</div>
			</div>

			{children}

			<div
				className='sc-ggKVjY fLbspY'
				style={{
					boxSizing: 'border-box',
					position: 'absolute',
					top: '0px',
					right: '0px',
					width: '1px',
					height: '100%',
					backgroundColor: 'rgb(238, 239, 241)',
				}}
			/>
		</div>
	);
}

export function RecordDetails() {
	return (
		<div
			className='sc-kXhRIN EMvxw'
			style={{
				boxSizing: 'border-box',
				flex: '1 1 auto',
				overflow: 'hidden auto',
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
			}}
		>
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
					className='sc-ijfqWo bzOEWl sc-cANVGU laFtpb'
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
					<div style={{ boxSizing: 'border-box', flexGrow: 1 }}>
						<div
							className='sc-bXdtCk VxJrs'
							style={{
								boxSizing: 'border-box',
								gap: '0px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'stretch',
								justifyContent: 'flex-start',
							}}
						>
							<div
								className='sc-jVKeJC iEwLCl'
								style={{
									boxSizing: 'border-box',
									borderBottom:
										'1px solid rgb(238, 239, 241)',
									marginLeft: '12px',
									marginRight: '12px',
								}}
							>
								<div style={{ boxSizing: 'border-box' }}>
									<div
										className='sc-iJwXIC bPmHji'
										style={{ boxSizing: 'border-box' }}
									>
										<div
											className='sc-bXdtCk ljfJFB'
											style={{
												boxSizing: 'border-box',
												gap: '4px',
												display: 'flex',
												flexDirection: 'row',
												alignItems: 'center',
												justifyContent: 'space-between',
												paddingTop: '12px',
												paddingBottom: '12px',
											}}
										>
											<button
												className='sc-iwghaO jJAOwn'
												type='button'
												aria-controls='radix-:r3el:'
												aria-expanded='true'
												style={{
													boxSizing: 'border-box',
													font: 'inherit',
													cursor: 'pointer',
													border: 'none',
													outline: 'none',
													margin: '0px 0px 0px -4px',
													gap: '8px',
													transition:
														'background-color 200ms',
													borderRadius: '8px',
													padding: '4px 8px 4px 4px',
													outlineWidth: 'initial',
													backgroundColor:
														'transparent',
													display: 'flex',
													alignItems: 'center',
												}}
											>
												<svg
													className='sc-jMpmlX fkmkHi sc-fDetDL bmGuzy'
													height='14px'
													width='14px'
													style={{
														boxSizing: 'border-box',
														flex: '0 0 auto',
														transition:
															'transform 200ms',
														transform:
															'rotate(0deg)',
													}}
												>
													<use
														height='14px'
														width='14px'
														href='https://app.attio.com/web-assets/assets/icon-defs/e1688f5e7c0263b3bae18f09406b9a55.svg#icon'
														style={{
															boxSizing:
																'border-box',
														}}
													/>
												</svg>
												<div
													className='sc-hoLldG itPSss sc-kThouk sc-gIAjh Bgngt jiwmPN'
													style={{
														boxSizing: 'border-box',
														fontStyle: 'normal',
														textAlign: 'left',
														fontFamily: 'Inter',
														letterSpacing:
															'-0.02em',
														fontWeight: 500,
														fontSize: '14px',
														lineHeight: 1,
														color: 'rgb(35, 37, 41)',
													}}
												>
													Record Details
												</div>
											</button>
											<div
												className='sc-fQvklz bsNmRV'
												style={{
													boxSizing: 'border-box',
													transition:
														'opacity 80ms ease-out',
													opacity: 0,
												}}
											>
												<button
													className='sc-gnqCJb cJsyIK'
													type='button'
													aria-busy='false'
													aria-label='All attributes'
													style={{
														boxSizing: 'border-box',
														font: 'inherit',
														margin: '0px',
														outline: 'none',
														border: 'none',
														textDecoration: 'none',
														gap: '4px',
														background:
															'rgba(0, 0, 0, 0)',
														padding: '4px',
														borderRadius: '6px',
														transition:
															'background-color 0.2s, color 0.2s, box-shadow 0.2s',
														outlineWidth: 'initial',
														position: 'relative',
														display: 'flex',
														flexShrink: 0,
														flexGrow: 0,
														alignItems: 'center',
														justifyContent:
															'center',
														opacity: 1,
														cursor: 'pointer',
														boxShadow:
															'var(--button-shadow)',
													}}
												>
													<div
														className='sc-dRHutB bYGUAg'
														style={{
															boxSizing:
																'border-box',
															display:
																'inline-flex',
															alignItems:
																'center',
															justifyContent:
																'center',
															height: '12px',
															width: '12px',
														}}
													>
														<svg
															className='sc-jMpmlX dpHgXw sc-eRJQtA etNTmH'
															height='12px'
															width='12px'
															style={{
																boxSizing:
																	'border-box',
																flex: '0 0 auto',
																flexShrink: 0,
															}}
														>
															<use
																height='12px'
																width='12px'
																href='https://app.attio.com/web-assets/assets/icon-defs/dbe6db28a2999585e7fa22cb570337f8.svg#icon'
																style={{
																	boxSizing:
																		'border-box',
																}}
															/>
														</svg>
													</div>
												</button>
											</div>
										</div>
										<div
											id='radix-:r3el:'
											className='sc-cZKnGk hldCEP'
											style={{
												boxSizing: 'border-box',
												overflow: 'hidden',
												paddingBottom: '12px',
												animation:
													'140ms ease 0s 1 normal none running hWwoIL',
												transitionDuration: '0s',
												animationName: 'none',
											}}
										>
											<div
												className='sc-bXdtCk jgulxT'
												style={{
													boxSizing: 'border-box',
													gap: '4px',
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'stretch',
													justifyContent:
														'flex-start',
													paddingLeft: '2px',
													paddingRight: '2px',
												}}
											>
												<div
													className='sc-bXdtCk gvoOJy'
													style={{
														boxSizing: 'border-box',
														gap: '2px',
														display: 'flex',
														flexDirection: 'column',
														alignItems: 'stretch',
														justifyContent:
															'flex-start',
													}}
												>
													<div
														className='sc-bXdtCk OTGP'
														style={{
															boxSizing:
																'border-box',
															gap: '6px',
															display: 'flex',
															flexDirection:
																'row',
															alignItems:
																'flex-start',
															justifyContent:
																'flex-start',
														}}
													>
														<div
															className='sc-bXdtCk dqTmVC sc-feibEv buFwJX'
															style={{
																boxSizing:
																	'border-box',
																gap: '6px',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																justifyContent:
																	'flex-start',
																width: 'clamp(80px, 40%, 125px)',
																minHeight:
																	'32px',
																flexShrink: 0,
															}}
														>
															<svg
																className='sc-jMpmlX hKYKkb'
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
																	href='https://app.attio.com/web-assets/assets/icon-defs/8856c857e8d860b70dab41102d8a1816.svg#icon'
																	style={{
																		boxSizing:
																			'border-box',
																	}}
																/>
															</svg>
															<div
																className='sc-dUjyAM jqbuxC sc-bpQYRA dzPjtY sc-kJObdU jAFfRU'
																style={{
																	boxSizing:
																		'border-box',
																	display:
																		'flex',
																	alignItems:
																		'center',
																	maxWidth:
																		'100%',
																	fontFamily:
																		'Inter',
																	fontWeight: 500,
																	lineHeight:
																		'16px',
																	fontSize:
																		'12px',
																	color: 'rgb(35, 37, 41)',
																	width: '51px',
																	minWidth:
																		'0px',
																	letterSpacing:
																		'0px',
																}}
															>
																<div
																	className='sc-fLfdDB bzHWNb'
																	style={{
																		boxSizing:
																			'border-box',
																		overflow:
																			'hidden',
																		whiteSpace:
																			'nowrap',
																		textOverflow:
																			'ellipsis',
																		color: 'rgb(92, 94, 99)',
																		flexShrink: 0,
																	}}
																>
																	​Domains
																</div>
															</div>
														</div>
														<div
															className='sc-hQMnGR jbxecX'
															style={{
																boxSizing:
																	'border-box',
																flex: '1 1 auto',
																overflow:
																	'hidden',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																minHeight:
																	'32px',
															}}
														>
															<div
																className='sc-jnhYrz CEWG'
																type='button'
																aria-controls='radix-:r3en:'
																aria-disabled='false'
																aria-expanded='false'
																aria-haspopup='dialog'
																tabIndex={0}
																style={{
																	boxSizing:
																		'border-box',
																	borderRadius:
																		'10px',
																	transition:
																		'background-color 140ms, box-shadow 140ms',
																	overflow:
																		'hidden',
																	flex: '1 1 0%',
																	display:
																		'flex',
																	alignItems:
																		'center',
																	justifyContent:
																		'space-between',
																	position:
																		'relative',
																	height: '32px',
																	maxHeight:
																		'32px',
																	boxShadow:
																		'transparent 0px 0px 0px 1px inset',
																	cursor: 'pointer',
																}}
															>
																<div
																	className='sc-fxQHsw cjzLPg'
																	style={{
																		boxSizing:
																			'border-box',
																		position:
																			'relative',
																		width: '100%',
																	}}
																>
																	<div
																		className='sc-bmbGwx idTFEy'
																		style={{
																			boxSizing:
																				'border-box',
																			width: '100%',
																		}}
																	>
																		<div
																			className='sc-iVIvCQ jWVnvh'
																			style={{
																				boxSizing:
																					'border-box',
																				padding:
																					'5px 6px',
																			}}
																		>
																			<div
																				className='sc-bXdtCk iRmLtg sc-kMEaFF iwtfOv'
																				style={{
																					boxSizing:
																						'border-box',
																					gap: '4px',
																					display:
																						'flex',
																					flexDirection:
																						'row',
																					alignItems:
																						'center',
																					justifyContent:
																						'flex-start',
																					minWidth:
																						'0px',
																					flex: '1 1 auto',
																					overflow:
																						'hidden',
																				}}
																			>
																				<a
																					className='sc-fnPRDr cdWyEB'
																					aria-disabled='false'
																					href='https://velomethod.com/'
																					rel='noreferrer noopener'
																					tabIndex={
																						0
																					}
																					target='_blank'
																					style={{
																						boxSizing:
																							'border-box',
																						background:
																							'transparent',
																						border: 'none',
																						textDecoration:
																							'none',
																						whiteSpace:
																							'nowrap',
																						transition:
																							'200ms',
																						appearance:
																							'none',
																						display:
																							'inline-flex',
																						flexDirection:
																							'row',
																						alignItems:
																							'center',
																						position:
																							'relative',
																						textOverflow:
																							'ellipsis',
																						cursor: 'pointer',
																						borderRadius:
																							'9px',
																						padding:
																							'1px 6px',
																						gap: '4px',
																						height: '22px',
																						boxShadow:
																							'rgb(214, 229, 255) 0px 0px 0px 1px inset',
																					}}
																				>
																					<div
																						className='sc-fzSWqP ghxxGa'
																						style={{
																							boxSizing:
																								'border-box',
																							flex: '0 1 auto',
																							overflow:
																								'hidden',
																							minWidth:
																								'0px',
																							position:
																								'relative',
																							display:
																								'flex',
																						}}
																					>
																						<span
																							className='sc-ceQylt gdsENC sc-dJtLgJ kXknjG'
																							aria-hidden='true'
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
																								flex: '0 1 auto',
																								overflow:
																									'hidden',
																								textDecoration:
																									'none',
																								pointerEvents:
																									'none',
																								opacity: 0,
																								fontFamily:
																									'Inter',
																								letterSpacing:
																									'-0.02em',
																								fontWeight: 500,
																								lineHeight:
																									'20px',
																								fontSize:
																									'14px',
																								color: '#407FF2',
																							}}
																						>
																							velomethod.c
																							<wbr
																								style={{
																									boxSizing:
																										'border-box',
																								}}
																							/>
																							o
																							<wbr
																								style={{
																									boxSizing:
																										'border-box',
																								}}
																							/>

																							m
																						</span>
																						<div
																							className='sc-dwUmAC fbWtDv'
																							style={{
																								boxSizing:
																									'border-box',
																								inset: '0px',
																								gap: '2px',
																								position:
																									'absolute',
																								display:
																									'flex',
																								alignItems:
																									'center',
																							}}
																						>
																							<div
																								className='sc-bSygdU hGmJub'
																								style={{
																									boxSizing:
																										'border-box',
																									textDecoration:
																										'none',
																									overflow:
																										'hidden',
																									whiteSpace:
																										'nowrap',
																									textOverflow:
																										'ellipsis',
																									fontFamily:
																										'Inter',
																									letterSpacing:
																										'-0.02em',
																									fontWeight: 500,
																									lineHeight:
																										'20px',
																									fontSize:
																										'14px',
																									color: '#407FF2',
																								}}
																							>
																								velomethod.com
																							</div>
																						</div>
																					</div>
																				</a>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div
														className='sc-bXdtCk OTGP'
														style={{
															boxSizing:
																'border-box',
															gap: '6px',
															display: 'flex',
															flexDirection:
																'row',
															alignItems:
																'flex-start',
															justifyContent:
																'flex-start',
														}}
													>
														<div
															className='sc-bXdtCk dqTmVC sc-feibEv buFwJX'
															style={{
																boxSizing:
																	'border-box',
																gap: '6px',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																justifyContent:
																	'flex-start',
																width: 'clamp(80px, 40%, 125px)',
																minHeight:
																	'32px',
																flexShrink: 0,
															}}
														>
															<svg
																className='sc-jMpmlX hKYKkb'
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
																	href='https://app.attio.com/web-assets/assets/icon-defs/ae5bad018eb28e01bf3470e0378ded7c.svg#icon'
																	style={{
																		boxSizing:
																			'border-box',
																	}}
																/>
															</svg>
															<div
																className='sc-dUjyAM jqbuxC sc-bpQYRA dzPjtY sc-kJObdU jAFfRU'
																style={{
																	boxSizing:
																		'border-box',
																	display:
																		'flex',
																	alignItems:
																		'center',
																	maxWidth:
																		'100%',
																	fontFamily:
																		'Inter',
																	fontWeight: 500,
																	lineHeight:
																		'16px',
																	fontSize:
																		'12px',
																	color: 'rgb(35, 37, 41)',
																	width: '34px',
																	minWidth:
																		'0px',
																	letterSpacing:
																		'0px',
																}}
															>
																<div
																	className='sc-fLfdDB bzHWNb'
																	style={{
																		boxSizing:
																			'border-box',
																		overflow:
																			'hidden',
																		whiteSpace:
																			'nowrap',
																		textOverflow:
																			'ellipsis',
																		color: 'rgb(92, 94, 99)',
																		flexShrink: 0,
																	}}
																>
																	​Name
																</div>
															</div>
														</div>
														<div
															className='sc-hQMnGR jbxecX'
															style={{
																boxSizing:
																	'border-box',
																flex: '1 1 auto',
																overflow:
																	'hidden',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																minHeight:
																	'32px',
															}}
														>
															<div
																className='sc-kipNbP sc-doHnpX bKRanV kJPoOZ'
																aria-disabled='false'
																aria-readonly='false'
																tabIndex={0}
																style={{
																	boxSizing:
																		'border-box',
																	borderRadius:
																		'10px',
																	overflow:
																		'hidden',
																	transition:
																		'background-color 140ms, box-shadow 140ms',
																	display:
																		'flex',
																	alignItems:
																		'stretch',
																	flex: '1 1 0%',
																	height: '32px',
																	maxHeight:
																		'32px',
																	boxShadow:
																		'transparent 0px 0px 0px 1px inset',
																	cursor: 'pointer',
																}}
															>
																<div
																	className='sc-deJeyS guGYoK'
																	style={{
																		boxSizing:
																			'border-box',
																		display:
																			'contents',
																	}}
																>
																	<div
																		className='sc-fxQHsw cjzLPg'
																		style={{
																			boxSizing:
																				'border-box',
																			position:
																				'relative',
																			width: '100%',
																		}}
																	>
																		<div
																			className='sc-bmbGwx idTFEy'
																			style={{
																				boxSizing:
																					'border-box',
																				width: '100%',
																			}}
																		>
																			<div
																				className='sc-hAwolW jIZFuh'
																				style={{
																					boxSizing:
																						'border-box',
																					overflow:
																						'hidden',
																					flex: '1 1 0%',
																					display:
																						'flex',
																					alignItems:
																						'center',
																					position:
																						'relative',
																					padding:
																						'6px',
																					minHeight:
																						'32px',
																				}}
																			>
																				<div
																					className='sc-dNDFpn fsKkUQ'
																					style={{
																						boxSizing:
																							'border-box',
																						whiteSpace:
																							'pre-wrap',
																						flex: '1 1 auto',
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
																						maxWidth:
																							'100%',
																						overflowWrap:
																							'break-word',
																					}}
																				>
																					Velo
																					IT
																					Group
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
																<div
																	className='sc-fwNDUN hmrJAJ'
																	style={{
																		boxSizing:
																			'border-box',
																		display:
																			'none',
																		pointerEvents:
																			'all',
																	}}
																>
																	<textarea
																		className='sc-fWMZrM gmueQm'
																		style={{
																			boxSizing:
																				'border-box',
																			font: 'inherit',
																			caretColor:
																				'rgb(38, 109, 240)',
																			background:
																				'transparent',
																			border: 'none',
																			outline:
																				'none',
																			margin: '0px',
																			flex: '1 1 auto',
																			display:
																				'flex',
																			width: '100%',
																			resize: 'none',
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
																			padding:
																				'6px',
																			minHeight:
																				'32px',
																			height: '32px',
																		}}
																	/>
																</div>
															</div>
														</div>
													</div>
													<div
														className='sc-bXdtCk OTGP'
														style={{
															boxSizing:
																'border-box',
															gap: '6px',
															display: 'flex',
															flexDirection:
																'row',
															alignItems:
																'flex-start',
															justifyContent:
																'flex-start',
														}}
													>
														<div
															className='sc-bXdtCk dqTmVC sc-feibEv buFwJX'
															style={{
																boxSizing:
																	'border-box',
																gap: '6px',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																justifyContent:
																	'flex-start',
																width: 'clamp(80px, 40%, 125px)',
																minHeight:
																	'32px',
																flexShrink: 0,
															}}
														>
															<svg
																className='sc-jMpmlX hKYKkb'
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
																	href='https://app.attio.com/web-assets/assets/icon-defs/bc5c81f3e22cc4844d94d766317b0fa3.svg#icon'
																	style={{
																		boxSizing:
																			'border-box',
																	}}
																/>
															</svg>
															<div
																className='sc-dUjyAM jqbuxC sc-bpQYRA dzPjtY sc-kJObdU jAFfRU'
																style={{
																	boxSizing:
																		'border-box',
																	display:
																		'flex',
																	alignItems:
																		'center',
																	maxWidth:
																		'100%',
																	fontFamily:
																		'Inter',
																	fontWeight: 500,
																	lineHeight:
																		'16px',
																	fontSize:
																		'12px',
																	color: 'rgb(35, 37, 41)',
																	width: '66px',
																	minWidth:
																		'0px',
																	letterSpacing:
																		'0px',
																}}
															>
																<div
																	className='sc-fLfdDB bzHWNb'
																	style={{
																		boxSizing:
																			'border-box',
																		overflow:
																			'hidden',
																		whiteSpace:
																			'nowrap',
																		textOverflow:
																			'ellipsis',
																		color: 'rgb(92, 94, 99)',
																		flexShrink: 0,
																	}}
																>
																	​Description
																</div>
															</div>
														</div>
														<div
															className='sc-hQMnGR jbxecX'
															style={{
																boxSizing:
																	'border-box',
																flex: '1 1 auto',
																overflow:
																	'hidden',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																minHeight:
																	'32px',
															}}
														>
															<div
																className='sc-kipNbP sc-doHnpX bKRanV kJPoOZ'
																aria-disabled='false'
																aria-readonly='false'
																tabIndex={0}
																style={{
																	boxSizing:
																		'border-box',
																	borderRadius:
																		'10px',
																	overflow:
																		'hidden',
																	transition:
																		'background-color 140ms, box-shadow 140ms',
																	display:
																		'flex',
																	alignItems:
																		'stretch',
																	flex: '1 1 0%',
																	height: '32px',
																	maxHeight:
																		'32px',
																	boxShadow:
																		'transparent 0px 0px 0px 1px inset',
																	cursor: 'pointer',
																}}
															>
																<div
																	className='sc-deJeyS guGYoK'
																	style={{
																		boxSizing:
																			'border-box',
																		display:
																			'contents',
																	}}
																>
																	<div
																		className='sc-fxQHsw gZBkML'
																		style={{
																			boxSizing:
																				'border-box',
																			position:
																				'relative',
																			width: '100%',
																		}}
																	>
																		<div
																			className='sc-bmbGwx idTFEy'
																			style={{
																				boxSizing:
																					'border-box',
																				width: '100%',
																			}}
																		>
																			<div
																				className='sc-hAwolW jIZFuh'
																				style={{
																					boxSizing:
																						'border-box',
																					overflow:
																						'hidden',
																					flex: '1 1 0%',
																					display:
																						'flex',
																					alignItems:
																						'center',
																					position:
																						'relative',
																					padding:
																						'6px',
																					minHeight:
																						'32px',
																				}}
																			>
																				<div
																					className='sc-dNDFpn fsKkUQ'
																					style={{
																						boxSizing:
																							'border-box',
																						whiteSpace:
																							'pre-wrap',
																						flex: '1 1 auto',
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
																						maxWidth:
																							'100%',
																						overflowWrap:
																							'break-word',
																						display:
																							'block',
																					}}
																				>
																					Velo
																					IT
																					Group
																					is
																					a
																					world-class
																					managed
																					IT
																					services
																					provid...
																				</div>
																			</div>
																		</div>
																		<div
																			className='sc-hIcDRB ehugsQ'
																			style={{
																				boxSizing:
																					'border-box',
																				gap: '6px',
																				transition:
																					'opacity 200ms',
																				borderRadius:
																					'8px',
																				position:
																					'absolute',
																				right: '6px',
																				top: '6px',
																				opacity: 0,
																				display:
																					'flex',
																				alignItems:
																					'flex-start',
																				justifyContent:
																					'flex-end',
																			}}
																		>
																			<button
																				className='sc-fDVtKM iyEJaI'
																				style={{
																					boxSizing:
																						'border-box',
																					font: 'inherit',
																					outlineWidth:
																						'0px',
																					cursor: 'pointer',
																					border: 'none',
																					background:
																						'none',
																					padding:
																						'0px',
																					margin: '0px',
																					borderRadius:
																						'6px',
																				}}
																			>
																				<div
																					className='sc-bCsDWz bopsGs'
																					style={{
																						boxSizing:
																							'border-box',
																						border: 'none',
																						background:
																							'none',
																						margin: '0px',
																						padding:
																							'2px 4px',
																						borderRadius:
																							'6px',
																						cursor: 'pointer',
																						display:
																							'flex',
																						alignItems:
																							'center',
																						justifyContent:
																							'center',
																					}}
																				>
																					<div
																						className='sc-hoLldG itPSss sc-fYNhqQ dYwvxi'
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
																								'11px',
																							color: 'rgb(117, 119, 124)',
																						}}
																					>
																						Show
																						all
																					</div>
																				</div>
																			</button>
																		</div>
																	</div>
																</div>
																<div
																	className='sc-fwNDUN hmrJAJ'
																	style={{
																		boxSizing:
																			'border-box',
																		display:
																			'none',
																		pointerEvents:
																			'all',
																	}}
																>
																	<textarea
																		className='sc-fWMZrM gmueQm'
																		style={{
																			boxSizing:
																				'border-box',
																			font: 'inherit',
																			caretColor:
																				'rgb(38, 109, 240)',
																			background:
																				'transparent',
																			border: 'none',
																			outline:
																				'none',
																			margin: '0px',
																			flex: '1 1 auto',
																			display:
																				'flex',
																			width: '100%',
																			resize: 'none',
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
																			padding:
																				'6px',
																			minHeight:
																				'32px',
																			height: '52px',
																		}}
																	/>
																</div>
															</div>
														</div>
													</div>
													<div
														className='sc-bXdtCk OTGP'
														style={{
															boxSizing:
																'border-box',
															gap: '6px',
															display: 'flex',
															flexDirection:
																'row',
															alignItems:
																'flex-start',
															justifyContent:
																'flex-start',
														}}
													>
														<div
															className='sc-bXdtCk dqTmVC sc-feibEv buFwJX'
															style={{
																boxSizing:
																	'border-box',
																gap: '6px',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																justifyContent:
																	'flex-start',
																width: 'clamp(80px, 40%, 125px)',
																minHeight:
																	'32px',
																flexShrink: 0,
															}}
														>
															<svg
																className='sc-jMpmlX hKYKkb'
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
																	href='https://app.attio.com/web-assets/assets/icon-defs/81b5b6c1e5ebb03c0c3aaedb91e937d7.svg#icon'
																	style={{
																		boxSizing:
																			'border-box',
																	}}
																/>
															</svg>
															<div
																className='sc-dUjyAM jqbuxC sc-bpQYRA dzPjtY sc-kJObdU jAFfRU'
																style={{
																	boxSizing:
																		'border-box',
																	display:
																		'flex',
																	alignItems:
																		'center',
																	maxWidth:
																		'100%',
																	fontFamily:
																		'Inter',
																	fontWeight: 500,
																	lineHeight:
																		'16px',
																	fontSize:
																		'12px',
																	color: 'rgb(35, 37, 41)',
																	width: '32px',
																	minWidth:
																		'0px',
																	letterSpacing:
																		'0px',
																}}
															>
																<div
																	className='sc-fLfdDB bzHWNb'
																	style={{
																		boxSizing:
																			'border-box',
																		overflow:
																			'hidden',
																		whiteSpace:
																			'nowrap',
																		textOverflow:
																			'ellipsis',
																		color: 'rgb(92, 94, 99)',
																		flexShrink: 0,
																	}}
																>
																	​Team
																</div>
															</div>
														</div>
														<div
															className='sc-hQMnGR jbxecX'
															style={{
																boxSizing:
																	'border-box',
																flex: '1 1 auto',
																overflow:
																	'hidden',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																minHeight:
																	'32px',
															}}
														>
															<div
																className='sc-gDxBzO loamvd'
																type='button'
																aria-controls='radix-:r3eu:'
																aria-expanded='false'
																aria-haspopup='dialog'
																tabIndex={0}
																style={{
																	boxSizing:
																		'border-box',
																	borderRadius:
																		'10px',
																	transition:
																		'background-color 140ms, box-shadow 140ms',
																	flex: '1 1 auto',
																	overflow:
																		'hidden',
																	display:
																		'flex',
																	alignItems:
																		'center',
																	justifyContent:
																		'space-between',
																	position:
																		'relative',
																	height: '32px',
																	maxHeight:
																		'32px',
																	boxShadow:
																		'transparent 0px 0px 0px 1px inset',
																	cursor: 'pointer',
																}}
															>
																<div
																	className='sc-fxQHsw cjzLPg'
																	style={{
																		boxSizing:
																			'border-box',
																		position:
																			'relative',
																		width: '100%',
																	}}
																>
																	<div
																		className='sc-bmbGwx idTFEy'
																		style={{
																			boxSizing:
																				'border-box',
																			width: '100%',
																		}}
																	>
																		<div
																			className='sc-CQwhx eYsrmk'
																			style={{
																				boxSizing:
																					'border-box',
																				padding:
																					'6px',
																				minHeight:
																					'32px',
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
																					color: 'rgb(159, 161, 167)',
																				}}
																			>
																				Set
																				Team
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div
														className='sc-bXdtCk OTGP'
														style={{
															boxSizing:
																'border-box',
															gap: '6px',
															display: 'flex',
															flexDirection:
																'row',
															alignItems:
																'flex-start',
															justifyContent:
																'flex-start',
														}}
													>
														<div
															className='sc-bXdtCk dqTmVC sc-feibEv buFwJX'
															style={{
																boxSizing:
																	'border-box',
																gap: '6px',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																justifyContent:
																	'flex-start',
																width: 'clamp(80px, 40%, 125px)',
																minHeight:
																	'32px',
																flexShrink: 0,
															}}
														>
															<svg
																className='sc-jMpmlX hKYKkb'
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
																	href='https://app.attio.com/web-assets/assets/icon-defs/cf42fb71a7e8b4050bedbec1433d105b.svg#icon'
																	style={{
																		boxSizing:
																			'border-box',
																	}}
																/>
															</svg>
															<div
																className='sc-dUjyAM jqbuxC sc-bpQYRA dzPjtY sc-kJObdU jAFfRU'
																style={{
																	boxSizing:
																		'border-box',
																	display:
																		'flex',
																	alignItems:
																		'center',
																	maxWidth:
																		'100%',
																	fontFamily:
																		'Inter',
																	fontWeight: 500,
																	lineHeight:
																		'16px',
																	fontSize:
																		'12px',
																	color: 'rgb(35, 37, 41)',
																	width: '63px',
																	minWidth:
																		'0px',
																	letterSpacing:
																		'0px',
																}}
															>
																<div
																	className='sc-fLfdDB bzHWNb'
																	style={{
																		boxSizing:
																			'border-box',
																		overflow:
																			'hidden',
																		whiteSpace:
																			'nowrap',
																		textOverflow:
																			'ellipsis',
																		color: 'rgb(92, 94, 99)',
																		flexShrink: 0,
																	}}
																>
																	​Categories
																</div>
															</div>
														</div>
														<div
															className='sc-hQMnGR jbxecX'
															style={{
																boxSizing:
																	'border-box',
																flex: '1 1 auto',
																overflow:
																	'hidden',
																display: 'flex',
																flexDirection:
																	'row',
																alignItems:
																	'center',
																minHeight:
																	'32px',
															}}
														>
															<div
																className='sc-kuskbU fMStum sc-fltZNR hPtcPu'
																type='button'
																aria-controls='radix-:r3f1:'
																aria-disabled='false'
																aria-expanded='false'
																aria-haspopup='dialog'
																aria-readonly='false'
																tabIndex={0}
																style={{
																	boxSizing:
																		'border-box',
																	borderRadius:
																		'10px',
																	transition:
																		'background-color 140ms, box-shadow 140ms',
																	overflow:
																		'hidden',
																	display:
																		'flex',
																	alignItems:
																		'center',
																	justifyContent:
																		'space-between',
																	position:
																		'relative',
																	flex: '1 1 auto',
																	height: '32px',
																	maxHeight:
																		'32px',
																	boxShadow:
																		'transparent 0px 0px 0px 1px inset',
																	cursor: 'pointer',
																}}
															>
																<div
																	className='sc-fxQHsw gZBkML'
																	style={{
																		boxSizing:
																			'border-box',
																		position:
																			'relative',
																		width: '100%',
																	}}
																>
																	<div
																		className='sc-bmbGwx idTFEy'
																		style={{
																			boxSizing:
																				'border-box',
																			width: '100%',
																		}}
																	>
																		<div
																			className='sc-jWWiUT cQuAoI'
																			style={{
																				boxSizing:
																					'border-box',
																				padding:
																					'6px',
																			}}
																		>
																			<div
																				className='sc-bXdtCk htMFtE sc-cTpArW kjGHq'
																				style={{
																					boxSizing:
																						'border-box',
																					gap: '4px',
																					display:
																						'flex',
																					flexDirection:
																						'row',
																					alignItems:
																						'center',
																					justifyContent:
																						'flex-start',
																					flex: '1 1 auto',
																					overflow:
																						'hidden',
																				}}
																			>
																				<span
																					className='sc-fqeDmk cQeBVJ sc-dKgCJh cDyOZv'
																					style={{
																						boxSizing:
																							'border-box',
																						display:
																							'inline-flex',
																						flexDirection:
																							'row',
																						alignItems:
																							'center',
																						boxShadow:
																							'rgb(195, 237, 249) 0px 0px 0px 1px inset',
																						backgroundColor:
																							'rgb(218, 244, 252)',
																						borderRadius:
																							'6px',
																						padding:
																							'2px 6px',
																						gap: '4px',
																						height: '20px',
																					}}
																				>
																					<span
																						className='sc-ceQylt gdsENC sc-eumbuP kLSFIf'
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
																							flex: '0 1 auto',
																							overflow:
																								'hidden',
																							minWidth:
																								'0px',
																							textOverflow:
																								'ellipsis',
																							fontFamily:
																								'Inter',
																							letterSpacing:
																								'-0.02em',
																							fontWeight: 500,
																							lineHeight:
																								'16px',
																							fontSize:
																								'12px',
																							color: '#156E86',
																						}}
																					>
																						Consulting &
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>{' '}
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						P
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						r
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						o
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						f
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						e
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						s
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						s
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						i
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						o
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						n
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						a
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						l
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>{' '}
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						S
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						e
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						r
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						v
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						i
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						c
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						e
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>

																						s
																					</span>
																				</span>

																				<span
																					className='sc-fqeDmk bymmVl sc-dKgCJh cDyOZv'
																					style={{
																						boxSizing:
																							'border-box',
																						display:
																							'inline-flex',
																						flexDirection:
																							'row',
																						alignItems:
																							'center',
																						boxShadow:
																							'rgb(233, 247, 151) 0px 0px 0px 1px inset',
																						backgroundColor:
																							'rgb(244, 251, 203)',
																						borderRadius:
																							'6px',
																						padding:
																							'2px 6px',
																						gap: '4px',
																						height: '20px',
																					}}
																				>
																					<span
																						className='sc-ceQylt gdsENC sc-eumbuP kLSFIf'
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
																							flex: '0 1 auto',
																							overflow:
																								'hidden',
																							minWidth:
																								'0px',
																							textOverflow:
																								'ellipsis',
																							fontFamily:
																								'Inter',
																							letterSpacing:
																								'-0.02em',
																							fontWeight: 500,
																							lineHeight:
																								'16px',
																							fontSize:
																								'12px',
																							color: '#586907',
																						}}
																					>
																						B2C
																					</span>
																				</span>
																				<span
																					className='sc-fqeDmk eVKHGk sc-dKgCJh cDyOZv'
																					style={{
																						boxSizing:
																							'border-box',
																						display:
																							'inline-flex',
																						flexDirection:
																							'row',
																						alignItems:
																							'center',
																						boxShadow:
																							'rgb(251, 241, 151) 0px 0px 0px 1px inset',
																						backgroundColor:
																							'rgb(253, 247, 196)',
																						borderRadius:
																							'6px',
																						padding:
																							'2px 6px',
																						gap: '4px',
																						height: '20px',
																					}}
																				>
																					<span
																						className='sc-ceQylt gdsENC sc-eumbuP kLSFIf'
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
																							flex: '0 1 auto',
																							overflow:
																								'hidden',
																							minWidth:
																								'0px',
																							textOverflow:
																								'ellipsis',
																							fontFamily:
																								'Inter',
																							letterSpacing:
																								'-0.02em',
																							fontWeight: 500,
																							lineHeight:
																								'16px',
																							fontSize:
																								'12px',
																							color: '#6E6100',
																						}}
																					>
																						Information 
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						T
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						e
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						c
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						h
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						n
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						o
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						l
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						o
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						g
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						y
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>{' '}
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						&
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>{' '}
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						S
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						e
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						r
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						v
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						i
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						c
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>
																						e
																						<wbr
																							style={{
																								boxSizing:
																									'border-box',
																							}}
																						/>

																						s
																					</span>
																				</span>
																				<span
																					className='sc-fqeDmk eRgizf sc-dKgCJh cDyOZv'
																					style={{
																						boxSizing:
																							'border-box',
																						display:
																							'inline-flex',
																						flexDirection:
																							'row',
																						alignItems:
																							'center',
																						boxShadow:
																							'rgb(254, 224, 200) 0px 0px 0px 1px inset',
																						backgroundColor:
																							'rgb(254, 238, 225)',
																						borderRadius:
																							'6px',
																						padding:
																							'2px 6px',
																						gap: '4px',
																						height: '20px',
																					}}
																				>
																					<span
																						className='sc-ceQylt gdsENC sc-eumbuP kLSFIf'
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
																							flex: '0 1 auto',
																							overflow:
																								'hidden',
																							minWidth:
																								'0px',
																							textOverflow:
																								'ellipsis',
																							fontFamily:
																								'Inter',
																							letterSpacing:
																								'-0.02em',
																							fontWeight: 500,
																							lineHeight:
																								'16px',
																							fontSize:
																								'12px',
																							color: '#894915',
																						}}
																					>
																						E-commerce
																					</span>
																				</span>
																				<span
																					className='sc-fqeDmk dUqjNk'
																					style={{
																						boxSizing:
																							'border-box',
																						display:
																							'inline-flex',
																						flexDirection:
																							'row',
																						alignItems:
																							'center',
																						boxShadow:
																							'rgb(238, 239, 241) 0px 0px 0px 1px inset',
																						backgroundColor:
																							'rgb(244, 245, 246)',
																						borderRadius:
																							'6px',
																						padding:
																							'2px 6px',
																						gap: '4px',
																						height: '20px',
																					}}
																				>
																					<span
																						className='sc-ceQylt gdsENC sc-eumbuP kLSFIf'
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
																							flex: '0 1 auto',
																							overflow:
																								'hidden',
																							minWidth:
																								'0px',
																							textOverflow:
																								'ellipsis',
																							fontFamily:
																								'Inter',
																							letterSpacing:
																								'-0.02em',
																							fontWeight: 500,
																							lineHeight:
																								'16px',
																							fontSize:
																								'12px',
																							color: '#505154',
																						}}
																					>
																						+4
																					</span>
																				</span>
																			</div>
																		</div>
																	</div>
																	<div
																		className='sc-hIcDRB ehugsQ'
																		style={{
																			boxSizing:
																				'border-box',
																			gap: '6px',
																			transition:
																				'opacity 200ms',
																			borderRadius:
																				'8px',
																			position:
																				'absolute',
																			right: '6px',
																			top: '6px',
																			opacity: 0,
																			display:
																				'flex',
																			alignItems:
																				'flex-start',
																			justifyContent:
																				'flex-end',
																		}}
																	>
																		<button
																			className='sc-fDVtKM iyEJaI'
																			style={{
																				boxSizing:
																					'border-box',
																				font: 'inherit',
																				outlineWidth:
																					'0px',
																				cursor: 'pointer',
																				border: 'none',
																				background:
																					'none',
																				padding:
																					'0px',
																				margin: '0px',
																				borderRadius:
																					'6px',
																			}}
																		>
																			<div
																				className='sc-bCsDWz bopsGs'
																				style={{
																					boxSizing:
																						'border-box',
																					border: 'none',
																					background:
																						'none',
																					margin: '0px',
																					padding:
																						'2px 4px',
																					borderRadius:
																						'6px',
																					cursor: 'pointer',
																					display:
																						'flex',
																					alignItems:
																						'center',
																					justifyContent:
																						'center',
																				}}
																			>
																				<div
																					className='sc-hoLldG itPSss sc-fYNhqQ dYwvxi'
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
																							'11px',
																						color: 'rgb(117, 119, 124)',
																					}}
																				>
																					Show
																					all
																				</div>
																			</div>
																		</button>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div
														className='sc-bXdtCk jdRKQo sc-hXjPby OPKjw'
														style={{
															boxSizing:
																'border-box',
															gap: '4px',
															display: 'flex',
															flexDirection:
																'column',
															justifyContent:
																'flex-start',
															alignItems:
																'flex-start',
															paddingTop: '6px',
															marginLeft: '-4px',
														}}
													>
														<button
															className='sc-gnqCJb gcRKbf'
															type='button'
															aria-busy='false'
															style={{
																boxSizing:
																	'border-box',
																font: 'inherit',
																margin: '0px',
																outline: 'none',
																border: 'none',
																textDecoration:
																	'none',
																gap: '4px',
																background:
																	'rgba(0, 0, 0, 0)',
																padding:
																	'2px 4px 2px 6px',
																borderRadius:
																	'6px',
																transition:
																	'background-color 0.2s, color 0.2s, box-shadow 0.2s',
																outlineWidth:
																	'initial',
																position:
																	'relative',
																display: 'flex',
																flexShrink: 0,
																flexGrow: 0,
																alignItems:
																	'center',
																justifyContent:
																	'center',
																opacity: 1,
																cursor: 'pointer',
																boxShadow:
																	'var(--button-shadow)',
															}}
														>
															<div
																className='sc-bXYrjy kzHAQA'
																style={{
																	boxSizing:
																		'border-box',
																	overflow:
																		'hidden',
																	whiteSpace:
																		'nowrap',
																	display:
																		'inline-block',
																	verticalAlign:
																		'bottom',
																	textOverflow:
																		'ellipsis',
																	fontSize:
																		'12px',
																	lineHeight:
																		'16px',
																	fontWeight: 500,
																	letterSpacing:
																		'-0.02em',
																	color: 'rgba(0, 0, 0, 0.6)',
																}}
															>
																Show all values
															</div>
															<div
																className='sc-dRHutB bYGUAg'
																style={{
																	boxSizing:
																		'border-box',
																	display:
																		'inline-flex',
																	alignItems:
																		'center',
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
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div
								className='sc-jVKeJC iEwLCl'
								style={{
									boxSizing: 'border-box',
									borderBottom:
										'1px solid rgb(238, 239, 241)',
									marginLeft: '12px',
									marginRight: '12px',
								}}
							>
								<div style={{ boxSizing: 'border-box' }}>
									<div
										className='sc-iJwXIC bPmHji'
										style={{ boxSizing: 'border-box' }}
									>
										<div
											className='sc-bXdtCk ljfJFB'
											style={{
												boxSizing: 'border-box',
												gap: '4px',
												display: 'flex',
												flexDirection: 'row',
												alignItems: 'center',
												justifyContent: 'space-between',
												paddingTop: '12px',
												paddingBottom: '12px',
											}}
										>
											<button
												className='sc-iwghaO jJAOwn'
												type='button'
												aria-controls='radix-:r3f3:'
												aria-expanded='true'
												style={{
													boxSizing: 'border-box',
													font: 'inherit',
													cursor: 'pointer',
													border: 'none',
													outline: 'none',
													margin: '0px 0px 0px -4px',
													gap: '8px',
													transition:
														'background-color 200ms',
													borderRadius: '8px',
													padding: '4px 8px 4px 4px',
													outlineWidth: 'initial',
													backgroundColor:
														'transparent',
													display: 'flex',
													alignItems: 'center',
												}}
											>
												<svg
													className='sc-jMpmlX fkmkHi sc-fDetDL bmGuzy'
													height='14px'
													width='14px'
													style={{
														boxSizing: 'border-box',
														flex: '0 0 auto',
														transition:
															'transform 200ms',
														transform:
															'rotate(0deg)',
													}}
												>
													<use
														height='14px'
														width='14px'
														href='https://app.attio.com/web-assets/assets/icon-defs/e1688f5e7c0263b3bae18f09406b9a55.svg#icon'
														style={{
															boxSizing:
																'border-box',
														}}
													/>
												</svg>
												<div
													className='sc-hoLldG itPSss sc-kThouk sc-gIAjh Bgngt jiwmPN'
													style={{
														boxSizing: 'border-box',
														fontStyle: 'normal',
														textAlign: 'left',
														fontFamily: 'Inter',
														letterSpacing:
															'-0.02em',
														fontWeight: 500,
														fontSize: '14px',
														lineHeight: 1,
														color: 'rgb(35, 37, 41)',
													}}
												>
													Lists
												</div>
											</button>
											<div
												className='sc-fQvklz bsNmRU'
												style={{
													boxSizing: 'border-box',
													transition:
														'opacity 80ms ease-out',
													opacity: 1,
												}}
											>
												<button
													className='sc-gnqCJb dTsApn'
													type='button'
													aria-busy='false'
													style={{
														boxSizing: 'border-box',
														font: 'inherit',
														margin: '0px',
														outline: 'none',
														border: 'none',
														textDecoration: 'none',
														gap: '4px',
														background:
															'rgba(0, 0, 0, 0)',
														padding:
															'2px 6px 2px 4px',
														borderRadius: '6px',
														transition:
															'background-color 0.2s, color 0.2s, box-shadow 0.2s',
														outlineWidth: 'initial',
														position: 'relative',
														display: 'flex',
														flexShrink: 0,
														flexGrow: 0,
														alignItems: 'center',
														justifyContent:
															'center',
														opacity: 1,
														cursor: 'pointer',
														boxShadow:
															'var(--button-shadow)',
													}}
												>
													<div
														className='sc-dRHutB bYGUAg'
														style={{
															boxSizing:
																'border-box',
															display:
																'inline-flex',
															alignItems:
																'center',
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
																href='https://app.attio.com/web-assets/assets/icon-defs/e72a9267f578a5c662186677f9137cce.svg#icon'
																style={{
																	boxSizing:
																		'border-box',
																}}
															/>
														</svg>
													</div>
													<div
														className='sc-bXYrjy kzHAQA'
														style={{
															boxSizing:
																'border-box',
															overflow: 'hidden',
															whiteSpace:
																'nowrap',
															display:
																'inline-block',
															verticalAlign:
																'bottom',
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
														Add to list
													</div>
												</button>
											</div>
										</div>
										<div
											id='radix-:r3f3:'
											className='sc-cZKnGk hldCEP'
											style={{
												boxSizing: 'border-box',
												overflow: 'hidden',
												paddingBottom: '12px',
												animation:
													'140ms ease 0s 1 normal none running hWwoIL',
												transitionDuration: '0s',
												animationName: 'none',
											}}
										>
											<div
												className='sc-bXdtCk kSWYqK'
												style={{
													boxSizing: 'border-box',
													gap: '4px',
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'flex-start',
													justifyContent:
														'flex-start',
													marginLeft: '20px',
												}}
											>
												<div
													className='sc-hoLldG itPSss sc-kThouk Bgngt'
													style={{
														boxSizing: 'border-box',
														fontStyle: 'normal',
														textAlign: 'left',
														fontFamily: 'Inter',
														letterSpacing:
															'-0.02em',
														fontWeight: 500,
														lineHeight: '20px',
														fontSize: '14px',
														color: 'rgb(159, 161, 167)',
													}}
												>
													This record has not been
													added to any lists
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function RecordDetailsHeader() {
	return (
		<div
			className='sc-gprCkP ctUPGK'
			style={{
				boxSizing: 'border-box',
				paddingTop: '8px',
				width: '100%',
			}}
		>
			<div
				className='sc-eKtKts eZYWgo sc-jitpHS wOBil'
				style={{
					boxSizing: 'border-box',
					flex: '1 1 auto',
					display: 'flex',
					maxWidth: '100%',
					paddingLeft: '12px',
					paddingRight: '12px',
					position: 'relative',
					paddingBottom: '8px',
				}}
			>
				<div
					className='sc-bKeIcL cjKKvx after:content-[""] after:block after:w-full after:h-[1px] after:rounded-[2px] after:bg-gray-200 after:absolute after:bottom-0 after:left-0'
					tabIndex={0}
					style={{
						boxSizing: 'border-box',
						gap: '4px',
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						minWidth: '0px',
						outline: 'none',
					}}
				>
					<button
						className='sc-iAOeKB kDxFTe after:content-[""] after:block after:w-full after:h-[1px] after:rounded-[2px] after:bg-primary after:absolute after:-bottom-2 after:left-0 after:z-[1]'
						tabIndex={0}
						style={{
							boxSizing: 'border-box',
							font: 'inherit',
							cursor: 'pointer',
							border: '0px',
							margin: '0px',
							background: 'transparent',
							outline: 'none',
							borderRadius: '8px',
							padding: '4px 8px',
							gap: '6px',
							transition:
								'box-shadow 140ms, background-color 140ms',
							outlineWidth: 'initial',
							display: 'flex',
							alignItems: 'center',
							backgroundColor: 'rgb(251, 251, 251)',
							boxShadow:
								'rgb(238, 239, 241) 0px 0px 0px 1px inset',
							position: 'relative',
						}}
					>
						<span
							className='sc-jIcpjO iUDkuQ'
							style={{
								boxSizing: 'border-box',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0,
							}}
						>
							<svg
								className='sc-jMpmlX joXqtH'
								height='14px'
								width='14px'
								style={{
									boxSizing: 'border-box',
									flex: '0 0 auto',
									transition: 'color 140ms',
									color: '#232529',
								}}
							>
								<use
									height='14px'
									width='14px'
									href='https://app.attio.com/web-assets/assets/icon-defs/55db353527d40fb03c1875e5111eea82.svg#icon'
									style={{ boxSizing: 'border-box' }}
								/>
							</svg>
						</span>
						<span
							className='sc-gUAJIS brUZlY'
							style={{
								boxSizing: 'border-box',
								overflow: 'hidden',
								whiteSpace: 'nowrap',
								flex: '1 1 auto',
								transition: 'color 140ms ease-in-out',
								fontFamily: 'Inter',
								letterSpacing: '-0.02em',
								fontWeight: 500,
								lineHeight: '20px',
								fontSize: '14px',
								textOverflow: 'ellipsis',
								color: '#232529',
							}}
						>
							Details
						</span>
					</button>
					<button
						className='sc-iAOeKB kDxFTe'
						tabIndex={-1}
						style={{
							boxSizing: 'border-box',
							font: 'inherit',
							cursor: 'pointer',
							border: '0px',
							margin: '0px',
							background: 'transparent',
							outline: 'none',
							borderRadius: '8px',
							padding: '4px 8px',
							gap: '6px',
							transition:
								'box-shadow 140ms, background-color 140ms',
							outlineWidth: 'initial',
							display: 'flex',
							alignItems: 'center',
							boxShadow: 'transparent 0px 0px 0px 1px inset',
						}}
					>
						<span
							className='sc-jIcpjO iUDkuQ'
							style={{
								boxSizing: 'border-box',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0,
							}}
						>
							<svg
								className='sc-jMpmlX joXqtH'
								height='14px'
								width='14px'
								style={{
									boxSizing: 'border-box',
									flex: '0 0 auto',
									transition: 'color 140ms',
									color: '#75777C',
								}}
							>
								<use
									height='14px'
									width='14px'
									href='https://app.attio.com/web-assets/assets/icon-defs/7e89d41d76212ff210d13b3d3df2d5e0.svg#icon'
									style={{ boxSizing: 'border-box' }}
								/>
							</svg>
						</span>
						<span
							className='sc-gUAJIS brUZlY'
							style={{
								boxSizing: 'border-box',
								overflow: 'hidden',
								whiteSpace: 'nowrap',
								flex: '1 1 auto',
								transition: 'color 140ms ease-in-out',
								fontFamily: 'Inter',
								letterSpacing: '-0.02em',
								fontWeight: 500,
								lineHeight: '20px',
								fontSize: '14px',
								textOverflow: 'ellipsis',
								color: '#75777C',
							}}
						>
							Comments
						</span>
						<span
							className='sc-dIDroW jiQIIg'
							style={{
								boxSizing: 'border-box',
								gap: '4px',
								position: 'relative',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								paddingLeft: '4px',
								paddingRight: '4px',
								fontVariantNumeric: 'tabular-nums',
								borderRadius: '4px',
								fontFamily: 'Inter',
								letterSpacing: '-0.02em',
								fontWeight: 500,
								lineHeight: '14px',
								fontSize: '10px',
								height: '14px',
								boxShadow:
									'rgb(238, 239, 241) 0px 0px 0px 1px inset',
								color: 'rgb(80, 81, 84)',
								backgroundColor: 'rgb(244, 245, 246)',
							}}
						>
							0
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}

// export function NavItem({ tab }: { tab: NavItemType }) {
// 	return (
// 		<button
// 			className='sc-iAOeKB kDxFTe'
// 			tabIndex={0}
// 			style={{
// 				boxSizing: 'border-box',
// 				font: 'inherit',
// 				cursor: 'pointer',
// 				border: '0px',
// 				margin: '0px',
// 				background: 'transparent',
// 				outline: 'none',
// 				borderRadius: '8px',
// 				padding: '4px 8px',
// 				gap: '6px',
// 				transition: 'box-shadow 140ms, background-color 140ms',
// 				outlineWidth: 'initial',
// 				display: 'flex',
// 				alignItems: 'center',
// 				backgroundColor: 'rgb(251, 251, 251)',
// 				boxShadow: 'rgb(238, 239, 241) 0px 0px 0px 1px inset',
// 				position: 'relative',
// 			}}
// 		>
// 			<span
// 				className='sc-jIcpjO iUDkuQ'
// 				style={{
// 					boxSizing: 'border-box',
// 					display: 'flex',
// 					alignItems: 'center',
// 					justifyContent: 'center',
// 					flexShrink: 0,
// 				}}
// 			>
// 				{tab.icon && (
// 					<tab.icon
// 						className='sc-jMpmlX joXqtH'
// 						height='14px'
// 						width='14px'
// 						style={{
// 							boxSizing: 'border-box',
// 							flex: '0 0 auto',
// 							transition: 'color 140ms',
// 							color: '#232529',
// 						}}
// 					/>
// 				)}
// 				{/* <svg
// 					className='sc-jMpmlX joXqtH'
// 					height='14px'
// 					width='14px'
// 					style={{
// 						boxSizing: 'border-box',
// 						flex: '0 0 auto',
// 						transition: 'color 140ms',
// 						color: '#232529',
// 					}}
// 				>
// 					<use
// 						height='14px'
// 						width='14px'
// 						href='https://app.attio.com/web-assets/assets/icon-defs/39336be0ab7b25ad694ede93e53b6a8d.svg#icon'
// 						style={{ boxSizing: 'border-box' }}
// 					/>
// 				</svg> */}
// 			</span>
// 			<span
// 				className='sc-gUAJIS brUZlY'
// 				style={{
// 					boxSizing: 'border-box',
// 					overflow: 'hidden',
// 					whiteSpace: 'nowrap',
// 					flex: '1 1 auto',
// 					transition: 'color 140ms ease-in-out',
// 					fontFamily: 'Inter',
// 					letterSpacing: '-0.02em',
// 					fontWeight: 500,
// 					lineHeight: '20px',
// 					fontSize: '14px',
// 					textOverflow: 'ellipsis',
// 					color: '#232529',
// 				}}
// 			>
// 				{tab.title}
// 			</span>
// 			<span
// 				className='sc-dIDroW jiQIIg'
// 				style={{
// 					boxSizing: 'border-box',
// 					gap: '4px',
// 					position: 'relative',
// 					display: 'inline-flex',
// 					alignItems: 'center',
// 					justifyContent: 'center',
// 					paddingLeft: '4px',
// 					paddingRight: '4px',
// 					fontVariantNumeric: 'tabular-nums',
// 					borderRadius: '4px',
// 					fontFamily: 'Inter',
// 					letterSpacing: '-0.02em',
// 					fontWeight: 500,
// 					lineHeight: '14px',
// 					fontSize: '10px',
// 					height: '14px',
// 					boxShadow: 'rgb(238, 239, 241) 0px 0px 0px 1px inset',
// 					color: 'rgb(80, 81, 84)',
// 					backgroundColor: 'rgb(244, 245, 246)',
// 				}}
// 			>
// 				-
// 			</span>
// 		</button>
// 	);
// }
