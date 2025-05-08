import { AvatarStack } from '@/components/avatar-stack';
import LabeledInput from '@/components/labeled-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCurrentUserImage } from '@/hooks/use-current-user-image';
import { useCurrentUserName } from '@/hooks/use-current-user-name';
import { getCurrencyString } from '@/utils/money';
import { Check, Link } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ProposalActions({ proposalId, versionId }: { proposalId: string; versionId: string }) {
	const image = useCurrentUserImage();
	const name = useCurrentUserName();

	const [currentUrl, setCurrentUrl] = useState('');

	useEffect(() => {
		// Check if the code is running on the client side
		if (process) {
			// Access the current page URL using window.location
			setCurrentUrl(window.location.origin);
		}
	}, []);
	const [hasCopied, setHasCopied] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setHasCopied(false);
		}, 2000);
	}, [hasCopied]);

	return (
		<div className='pl-1.5 pt-3 flex items-start'>
			<div
				className='ProjectHeaderFacepile Stack Stack--align-center Stack--direction-row Stack--display-block Stack--justify-start HighlightSol HighlightSol--buildingBlock'
				style={{
					alignItems: 'center',
					flexDirection: 'row',
					display: 'flex',
					justifyContent: 'start',
				}}
			>
				<div
					className='FacepileButton FacepileButton--sizeSmall'
					aria-label='Manage project members'
					role='button'
					tabIndex={0}
					style={{
						cursor: 'pointer',
						display: 'inline-flex',
						borderRadius: 'calc((24px + 4px)*.5)',
					}}
				>
					<ul
						className='FacepileStructure Facepile FacepileButton-facepile'
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
							<div
								className='EllipsisFacepileAvatar--standardTheme EllipsisFacepileAvatar EllipsisFacepileAvatar--sizeSmall Facepile-ellipsisAvatar Facepile-item'
								aria-hidden='true'
								style={{
									flexShrink: 0,
									boxSizing: 'border-box',
									justifyContent: 'center',
									alignItems: 'center',
									display: 'inline-flex',
									borderRadius: 'calc(24px*.5)',
									padding: '0px 4px',
									height: '24px',
									minWidth: '24px',
									background: '#f9f8f8',
									border: '1px solid #cfcbcb',
									fill: '#6d6e6f',
								}}
							>
								<svg
									className='MiniIcon--small MiniIcon MoreMiniIcon HighlightSol HighlightSol--core'
									aria-hidden='true'
									focusable='false'
									viewBox='0 0 24 24'
									style={{
										flex: '0 0 auto',
										overflow: 'hidden',
										width: '12px',
										height: '12px',
									}}
								>
									<path d='M5,12c0,1.4-1.1,2.5-2.5,2.5S0,13.4,0,12s1.1-2.5,2.5-2.5S5,10.6,5,12z M12,9.5c-1.4,0-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5S13.4,9.5,12,9.5z M21.5,9.5c-1.4,0-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5S24,13.4,24,12S22.9,9.5,21.5,9.5z' />
								</svg>
							</div>
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
							<AvatarStack
								avatars={[
									{
										name,
										image: image || '',
									},
								]}
							/>
						</li>
					</ul>
				</div>

				<Dialog>
					<DialogTrigger asChild>
						<Button
							size='sm'
							className='ml-1.5'
						>
							<svg
								className='size-3.5 flex-[0_0_auto] overflow-hidden fill-white text-white'
								aria-hidden='true'
								focusable='false'
								viewBox='0 0 24 24'
							>
								<path d='m23,20h-1v-6c0-1.103-.897-2-2-2h-4v8h-2V4c0-1.103-.897-2-2-2H4c-1.103,0-2,.897-2,2v16h-1c-.552,0-1,.447-1,1s.448,1,1,1h22c.553,0,1-.447,1-1s-.447-1-1-1Zm-13-4h-4c-.552,0-1-.447-1-1s.448-1,1-1h4c.552,0,1,.447,1,1s-.448,1-1,1Zm0-4h-4c-.552,0-1-.448-1-1s.448-1,1-1h4c.552,0,1,.448,1,1s-.448,1-1,1Zm0-4h-4c-.552,0-1-.448-1-1s.448-1,1-1h4c.552,0,1,.448,1,1s-.448,1-1,1Z' />
							</svg>

							<span>Share</span>
						</Button>
					</DialogTrigger>

					<DialogContent className='p-0'>
						<DialogHeader className='border-b p-6'>
							<DialogTitle>Share 2025 Velvet Refresh</DialogTitle>
						</DialogHeader>

						<div className='p-6 space-y-6'>
							<LabeledInput
								label='Share via email'
								name='email'
								placeholder='Add members by name or email...'
							/>
						</div>

						<DialogFooter className='p-3 border-t'>
							<Button
								variant='outline'
								size='lg'
								onClick={() => {
									navigator.clipboard.writeText(`${currentUrl}/review/${proposalId}/${versionId}`);
									setHasCopied(true);
								}}
							>
								{hasCopied ? <Check /> : <Link />}
								Copy proposal link
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className='border-l ml-1.5 pl-1.5'>
				<HoverCard>
					<HoverCardTrigger asChild>
						<Button
							variant='outline'
							size='sm'
							className='text-sm font-medium self-center mr-1.5'
						>
							Total: <span className='text-muted-foreground'>{getCurrencyString(0)}</span>
						</Button>
					</HoverCardTrigger>

					<HoverCardContent
						className='w-80'
						align='end'
					>
						<div className='grid gap-2'>
							<div className='space-y-2'>
								<h4 className='font-medium leading-none'>Totals</h4>
								<Separator />
							</div>

							<div className='grid gap-2'>
								<div className='grid grid-cols-5 items-center gap-2'>
									<Label className='col-span-2'>Labor</Label>
									<p className='col-span-3 text-sm'>{getCurrencyString(0)}</p>
								</div>

								<div className='grid grid-cols-5 items-center gap-2'>
									<Label className='col-span-2'>Product</Label>
									<p className='col-span-3 text-sm'>{getCurrencyString(0)}</p>
								</div>

								<div className='grid grid-cols-5 items-center gap-2'>
									<Label className='col-span-2'>Recurring</Label>
									<p className='col-span-3 text-sm'>{getCurrencyString(0)}</p>
								</div>

								<div className='grid grid-cols-5 items-center gap-2'>
									<Label className='col-span-2'>Cost</Label>
									<p className='col-span-3 text-sm'>{getCurrencyString(0)}</p>
								</div>

								<div className='grid grid-cols-5 items-center gap-2'>
									<Label className='col-span-2'>Recurring Cost</Label>
									<p className='col-span-3 text-sm'>{getCurrencyString(0)}</p>
								</div>
							</div>
						</div>
					</HoverCardContent>
				</HoverCard>
			</div>
		</div>
	);
}
