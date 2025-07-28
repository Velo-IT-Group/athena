import TabsList from '@/components/tabs-list';
import type { NavSection } from '@/types/nav';

export function Highlights({
	tabs,
	children,
}: {
	tabs: NavSection[];
	children: React.ReactNode;
}) {
	return (
		<div
			className='sc-fYDboR dlRqIB'
			style={{
				boxSizing: 'border-box',
				flex: '1 1 auto',
				display: 'flex',
				minWidth: '350px',
				width: '61.803%',
			}}
		>
			<div
				className='sc-iWLVTk jTFzDA'
				style={{
					boxSizing: 'border-box',
					flex: '1 1 auto',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					minHeight: '0px',
					position: 'relative',
					paddingTop: '8px',
				}}
			>
				<div
					className='sc-eKtKts eZYWgo sc-jPIRqp iiZQz'
					style={{
						boxSizing: 'border-box',
						display: 'flex',
						maxWidth: '100%',
						flex: '0 0 auto',
						paddingLeft: '12px',
						paddingRight: '12px',
						position: 'relative',
						paddingBottom: '8px',
					}}
				>
					<div
						className='sc-bKeIcL cjKKvx'
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
						<TabsList tabs={tabs} />
						{/* {tabs.map((tab) => (
							<NavItem
								key={tab.to}
								tab={tab}
							/>
							// <button
							// 	key={tab.to}
							// 	className='sc-iAOeKB kDxFTe'
							// 	tabIndex={-1}
							// 	style={{
							// 		boxSizing: 'border-box',
							// 		font: 'inherit',
							// 		cursor: 'pointer',
							// 		border: '0px',
							// 		margin: '0px',
							// 		background: 'transparent',
							// 		outline: 'none',
							// 		borderRadius: '8px',
							// 		padding: '4px 8px',
							// 		gap: '6px',
							// 		transition:
							// 			'box-shadow 140ms, background-color 140ms',
							// 		outlineWidth: 'initial',
							// 		display: 'flex',
							// 		alignItems: 'center',
							// 		boxShadow:
							// 			'transparent 0px 0px 0px 1px inset',
							// 	}}
							// >
							// 	<span
							// 		className='sc-jIcpjO iUDkuQ'
							// 		style={{
							// 			boxSizing: 'border-box',
							// 			display: 'flex',
							// 			alignItems: 'center',
							// 			justifyContent: 'center',
							// 			flexShrink: 0,
							// 		}}
							// 	>
							// 		{tab.icon && (
							// 			<tab.icon
							// 				className='sc-jMpmlX joXqtH'
							// 				height='14px'
							// 				width='14px'
							// 				style={{
							// 					boxSizing: 'border-box',
							// 					flex: '0 0 auto',
							// 					transition: 'color 140ms',
							// 					color: '#75777C',
							// 				}}
							// 			/>
							// 		)}
							// 	</span>

							// 	<span
							// 		className='sc-gUAJIS brUZlY'
							// 		style={{
							// 			boxSizing: 'border-box',
							// 			overflow: 'hidden',
							// 			whiteSpace: 'nowrap',
							// 			flex: '1 1 auto',
							// 			transition: 'color 140ms ease-in-out',
							// 			fontFamily: 'Inter',
							// 			letterSpacing: '-0.02em',
							// 			fontWeight: 500,
							// 			lineHeight: '20px',
							// 			fontSize: '14px',
							// 			textOverflow: 'ellipsis',
							// 			color: '#75777C',
							// 		}}
							// 	>
							// 		{tab.title}
							// 	</span>
							// </button>
						))} */}

						{/* <button
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
										href='https://app.attio.com/web-assets/assets/icon-defs/39336be0ab7b25ad694ede93e53b6a8d.svg#icon'
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
								Emails
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
								-
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
										href='https://app.attio.com/web-assets/assets/icon-defs/47e9d82883fd24ff9be5abf07f6f3ee6.svg#icon'
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
								Calls
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
								-
							</span>
						</button>

						<div
							aria-describedby='radix-:r379:'
							style={{ boxSizing: 'border-box' }}
						>
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
									boxShadow:
										'transparent 0px 0px 0px 1px inset',
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
											href='https://app.attio.com/web-assets/assets/icon-defs/41a69f4990d9729d36f318ddd145a161.svg#icon'
											style={{
												boxSizing: 'border-box',
											}}
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
									Team
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
										href='https://app.attio.com/web-assets/assets/icon-defs/6a046b9d2760d284b4bc84ee975d2757.svg#icon'
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
								Notes
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
										href='https://app.attio.com/web-assets/assets/icon-defs/ef74ab401540c38928cae7926e262293.svg#icon'
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
								Tasks
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
										href='https://app.attio.com/web-assets/assets/icon-defs/0d2c783c3e6cb742789a87d8dbf90eba.svg#icon'
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
								Files
							</span>
						</button> */}
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
		</div>
	);
}
