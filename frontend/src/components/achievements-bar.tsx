export function AchievementsBar() {
	return (
		<div className='my-3 grid'>
			<div
				className='AchievementsWidget HomePageContent-achievements'
				style={{
					gridRowStart: '1',
					gridColumnStart: '1',
					justifySelf: 'center',
				}}
			>
				<div className='bg-muted rounded-full h-12 pr-1.5 inline-flex transition-colors items-center'>
					<div
						className='AchievementsWidgetContent-selectMenu'
						style={{ margin: '0px 16px' }}
					>
						<div
							className='ButtonThemeablePresentation--isEnabled ButtonThemeablePresentation ButtonThemeablePresentation--medium ButtonSubtlePresentation ButtonSubtlePresentation--sentimentDefault ButtonSubtlePresentation--enabled SubtleButton AchievementsWidgetContent-anchor HighlightSol HighlightSol--core HighlightSol--buildingBlock Stack Stack--align-center Stack--direction-row Stack--display-inline Stack--justify-center'
							aria-expanded='false'
							aria-haspopup='listbox'
							aria-label='Select timeframe'
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
								transition: 'color 0.2s ease-in-out, fill 0.2s ease-in-out',
								transitionDuration: '0.2s, 0.2s',
								transitionProperty: 'color, fill',
								cursor: 'pointer',
								padding: '0 8px',
								height: '28px',
								fontSize: '12px',
								lineHeight: '28px',
								background: '0px 0px',
								borderColor: 'transparent',
								color: '#6d6e6f',
								fill: '#6d6e6f',
								fontWeight: 500,
							}}
						>
							<span
								className='AchievementsWidgetContent-anchorLabel'
								style={{
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}
							>
								My week
							</span>
							<svg
								className='MiniIcon ButtonThemeablePresentation-rightIcon ArrowDownMiniIcon HighlightSol HighlightSol--core'
								aria-hidden='true'
								focusable='false'
								viewBox='0 0 24 24'
								style={{
									marginLeft: '4px',
									flex: '0 0 auto',
									width: '12px',
									height: '12px',
									overflow: 'hidden',
								}}
							>
								<path d='m18.185 7.851-6.186 5.191-6.186-5.191a1.499 1.499 0 1 0-1.928 2.298l7.15 6a1.498 1.498 0 0 0 1.928 0l7.15-6a1.5 1.5 0 0 0-1.928-2.298Z' />
							</svg>
						</div>
						<noscript />
					</div>

					<div
						className='AchievementsWidgetContent-divider'
						style={{
							borderRight: '1px solid #edeae9',
							transition: 'border-right 0.2s ease-in-out',
							height: '24px',
						}}
					/>
					<div
						className='AchievementsWidgetContent-statistic'
						style={{
							transition: 'color 0.2s ease-in-out, fill 0.2s ease-in-out',
							color: '#6d6e6f',
							fill: '#6d6e6f',
							marginRight: '16px',
						}}
					>
						<div
							className='AchievementsWidgetStatistic'
							style={{ alignItems: 'center', display: 'flex' }}
						>
							<div
								className='AchievementsWidgetStatistic-numberSection--smallNumber AchievementsWidgetStatistic-numberSection'
								style={{
									justifyContent: 'flex-end',
									alignItems: 'center',
									width: '72px',
									display: 'flex',
								}}
							>
								<svg
									className='Icon CheckIcon HighlightSol HighlightSol--core'
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
									<path d='M28.061 7.939a1.5 1.5 0 0 0-2.121 0L11.001 22.878l-5.939-5.939a1.5 1.5 0 1 0-2.121 2.121l7 7c.293.293.677.439 1.061.439.384 0 .768-.146 1.061-.439l16-16a1.5 1.5 0 0 0 0-2.121h-.002Z' />
								</svg>
								<div
									className='NumberTicker'
									aria-label='0'
									style={{ margin: '0px 4px' }}
								>
									<div aria-hidden='true'>
										<div
											className='NumberTicker-row NumberTicker-row--h4'
											style={{ overflowY: 'hidden', height: '28px' }}
										>
											<div
												className='NumberTicker-column NumberTicker-column--0'
												style={{
													transition: 'transform 0.5s ease-in-out',
													width: 'fit-content',
													display: 'inline-block',
													transform: 'translateY(-9.09091%)',
												}}
											>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													 
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													0
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													1
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													2
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													3
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													4
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													5
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													6
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													7
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													8
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													9
												</h4>
											</div>
										</div>
									</div>
								</div>
							</div>
							<span
								className='TypographyPresentation TypographyPresentation--small AchievementsWidgetStatistic-text HighlightSol HighlightSol--buildingBlock'
								style={{
									fontFamily:
										'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
									fontSize: '12px',
									lineHeight: '18px',
								}}
							>
								tasks completed
							</span>
						</div>
					</div>
					<div
						className='AchievementsWidgetContent-statistic'
						style={{
							transition: 'color 0.2s ease-in-out, fill 0.2s ease-in-out',
							color: '#6d6e6f',
							fill: '#6d6e6f',
							marginRight: '16px',
						}}
					>
						<div
							className='AchievementsWidgetStatistic'
							style={{ alignItems: 'center', display: 'flex' }}
						>
							<div
								className='AchievementsWidgetStatistic-numberSection--smallNumber AchievementsWidgetStatistic-numberSection'
								style={{
									justifyContent: 'flex-end',
									alignItems: 'center',
									width: '72px',
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
								<div
									className='NumberTicker'
									aria-label='0'
									style={{ margin: '0px 4px' }}
								>
									<div aria-hidden='true'>
										<div
											className='NumberTicker-row NumberTicker-row--h4'
											style={{ overflowY: 'hidden', height: '28px' }}
										>
											<div
												className='NumberTicker-column NumberTicker-column--0'
												style={{
													transition: 'transform 0.5s ease-in-out',
													width: 'fit-content',
													display: 'inline-block',
													transform: 'translateY(-9.09091%)',
												}}
											>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													 
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													0
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													1
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													2
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													3
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													4
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													5
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													6
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													7
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													8
												</h4>
												<h4
													className='TypographyPresentation TypographyPresentation--colorDefault TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty NumberTicker-number AchievementsWidgetStatistic-numberTicker HighlightSol HighlightSol--buildingBlock HighlightSol--core'
													style={{
														border: '0px',
														padding: '0px',
														verticalAlign: 'baseline',
														margin: '0px',
														fontFamily:
															'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
														fontWeight: 500,
														textWrap: 'pretty',
														color: '#6d6e6f',
														fontVariantNumeric: 'tabular-nums',
														display: 'block',
														fontSize: '20px',
														lineHeight: '28px',
													}}
												>
													9
												</h4>
											</div>
										</div>
									</div>
								</div>
							</div>
							<span
								className='TypographyPresentation TypographyPresentation--small AchievementsWidgetStatistic-text HighlightSol HighlightSol--buildingBlock'
								style={{
									fontFamily:
										'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
									fontSize: '12px',
									lineHeight: '18px',
								}}
							>
								collaborators
							</span>
						</div>
					</div>
				</div>
			</div>

			<div
				style={{
					gridRowStart: '1',
					gridColumnStart: '1',
					placeSelf: 'center right',
				}}
			>
				<div
					className='ButtonThemeablePresentation--isEnabled ButtonThemeablePresentation ButtonThemeablePresentation--large ButtonSecondaryPresentation ButtonSecondaryPresentation--sentimentDefault SecondaryButton HomePageCustomizeButton-customizeButton HighlightSol HighlightSol--core HighlightSol--buildingBlock Stack Stack--align-center Stack--direction-row Stack--display-inline Stack--justify-center'
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
						cursor: 'pointer',
						padding: '0 12px',
						height: '36px',
						fontSize: '14px',
						lineHeight: '36px',
						background: '#fff',
						borderColor: '#cfcbcb',
						color: '#1e1f21',
						fill: '#6d6e6f',
					}}
				>
					<img
						className='DeprecatedMiniIllustration DeprecatedMiniIllustration--smallMiniIcon ButtonThemeablePresentation-leftIcon HighlightSol HighlightSol--deprecated'
						src='https://d3ki9tyy5l5ruj.cloudfront.net/obj/ce625ef5536516f31458c34d0c9d41457cae8470/customize_12.svg'
						style={{
							margin: '0px',
							padding: '0px',
							verticalAlign: 'baseline',
							fontFamily: 'inherit',
							fontSize: '100%',
							border: '0px',
							marginRight: '4px',
							width: '12px',
							minWidth: '12px',
							height: '12px',
							minHeight: '12px',
						}}
					/>
					Customize
				</div>
			</div>
		</div>
	);
}
