import { ManageAvatarStack } from '@/components/manage-avatar-stack';
import LabeledInput from '@/components/labeled-input';
import { AsyncSelect } from '@/components/ui/async-select';
import { Button } from '@/components/ui/button';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCurrentUserImage } from '@/hooks/use-current-user-image';
import { useCurrentUserName } from '@/hooks/use-current-user-name';
import { useProposals } from '@/hooks/use-proposals';
import { getScheduleEntriesQuery } from '@/lib/manage/api';
import { getProposalFollowersQuery } from '@/lib/supabase/api';
import { getProfiles } from '@/lib/supabase/read';
import { getCurrencyString } from '@/utils/money';
import NumberFlow from '@number-flow/react';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { Building2, Check, Link } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ProposalActions({
	proposalId,
	versionId,
	serviceTicketId,
	total,
}: {
	proposalId: string;
	versionId: string;
	serviceTicketId: number;
	total: number;
}) {
	const { handleAddingFollower } = useProposals({});
	const [{ data: followers }, { data: scheduleEntries }] = useSuspenseQueries({
		queries: [
			getProposalFollowersQuery(proposalId, versionId),
			getScheduleEntriesQuery({
				conditions: {
					'type/id': 4,
					objectId: serviceTicketId,
					// doneFlag: false,
					// date: {
					// 	from: new Date().toISOString(),
					// 	to: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
					// },
				},
				fields: ['id', 'member'],
				orderBy: { key: 'doneFlag', order: 'asc' },
			}),
		],
	});

	const image = useCurrentUserImage();
	const name = useCurrentUserName();

	const [currentUrl, setCurrentUrl] = useState('');

	useEffect(() => {
		// Check if the code is running on the client side
		// if (process) {
		// Access the current page URL using window.location
		// }
		setCurrentUrl(window.location.origin);
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
				<ManageAvatarStack
					avatars={scheduleEntries.map((follower) => ({
						name: follower.member.name,
						memberId: follower.member.id,
					}))}
				/>

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
						Total:{' '}
						<span className='text-muted-foreground'>
							<NumberFlow
								value={total ?? 0}
								locales='en-US'
								format={{ style: 'currency', currency: 'USD' }}
							/>
						</span>
					</Button>
				</CollapsibleTrigger>
			</div>
		</div>
	);
}
