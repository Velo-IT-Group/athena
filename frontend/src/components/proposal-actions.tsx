import { AvatarStack } from '@/components/avatar-stack';
import LabeledInput from '@/components/labeled-input';
import { Button } from '@/components/ui/button';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCurrentUserImage } from '@/hooks/use-current-user-image';
import { useCurrentUserName } from '@/hooks/use-current-user-name';
import { getCurrencyString } from '@/utils/money';
import { Building2, Check, Ellipsis, Link } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ProposalActions({
	proposalId,
	versionId,
	total,
}: {
	proposalId: string;
	versionId: string;
	total: number;
}) {
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
								className='bg-muted border'
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
									// background: '#f9f8f8',
									// border: '1px solid #cfcbcb',
									// fill: '#6d6e6f',
								}}
							>
								<Ellipsis />
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
							className='ml-1.5 text-white'
						>
							<Building2 className='size-3.5' />

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
				<CollapsibleTrigger asChild>
					<Button
						variant='outline'
						size='sm'
						className='text-sm font-medium self-center mr-1.5'
					>
						Total: <span className='text-muted-foreground'>{getCurrencyString(total ?? 0)}</span>
					</Button>
				</CollapsibleTrigger>
			</div>
		</div>
	);
}
