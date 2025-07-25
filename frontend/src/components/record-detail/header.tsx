import React from 'react';

type Props = {};

const RecordDetailsHeader = (props: Props) => {
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
};

export default RecordDetailsHeader;
