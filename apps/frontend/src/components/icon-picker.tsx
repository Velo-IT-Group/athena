export default function IconPicker() {
	return (
		<div
			className='TopbarPageHeaderStructureWithBreadcrumbs-leftElement--withNavBreadcrumbsEnabled TopbarPageHeaderStructureWithBreadcrumbs-leftElement'
			style={{ alignSelf: 'center', marginRight: '12px' }}
		>
			<div
				className='PageHeaderChipButton--breadcrumbsEnabled PageHeaderChipButton--isExpanded PageHeaderChipButton'
				role='button'
				tabIndex={0}
				style={{
					outline: 'none',
					cursor: 'pointer',
					position: 'relative',
					borderRadius: '6px',
				}}
			>
				<div
					className='ScreenReaderOnly'
					style={{
						overflow: 'hidden',
						clip: 'rect(1px, 1px, 1px, 1px)',
						width: '1px',
						height: '1px',
						position: 'absolute',
					}}
				>
					Change color and icon of Asana Clone
				</div>
				<div
					className='ChipWithIcon2 ChipWithIcon2--size28'
					style={{ position: 'relative', width: '28px', height: '28px' }}
				>
					<div
						className='ChipWithIcon--withChipFill ChipWithIcon--colorRed ChipWithIcon ChipWithIcon2-presetProjectIcon'
						style={{
							backgroundColor: '#f06a6a',
							borderRadius: '6px',
							flex: '0 0 auto',
							fill: 'rgb(255, 255, 255)',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							width: '28px',
							height: '28px',
							display: 'flex',
							boxShadow: 'rgba(0, 0, 0, 0.05) 0px -2px inset',
						}}
					>
						<svg
							className='MultiColorIcon LightbulbMultiColorIcon ChipWithIcon2-presetProjectIconContents HighlightSol HighlightSol--core MultiColorIcon--small'
							// title='light_bulb'
							viewBox='0 0 24 24'
							style={{
								clipRule: 'evenodd',
								fillRule: 'evenodd',
								width: '16px',
								height: '16px',
								overflow: 'hidden',
							}}
						>
							<path
								className='MultiColorIcon-path--fadedBlack'
								d='M8,22v-5h8v5h-1.2c-0.4,1.2-1.5,2-2.8,2s-2.4-0.8-2.8-2H8z M15,19H9v1h6V19z'
								style={{ fill: 'rgba(30,31,33,.75)' }}
							/>
							<path
								className='MultiColorIcon-path--white'
								d='M16,17.1c3-1.5,5-4.6,5-8.1c0-5-4-9-9-9S3,4,3,9c0,3.5,2,6.6,5,8.1V17h8V17.1z M15,20v-1H9v1H15z'
								style={{ fill: '#fff' }}
							/>
						</svg>
					</div>
				</div>
			</div>
			<noscript />
		</div>
	);
}
