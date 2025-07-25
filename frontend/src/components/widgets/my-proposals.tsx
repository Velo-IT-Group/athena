import { formatRelative, type FormatRelativeToken } from 'date-fns';
import { CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';

import WidgetOptions from '@/components/widgets/widget-options';
import useWidget from '@/hooks/use-widget';
import { getProposalsQuery } from '@/lib/supabase/api';
import { cn } from '@/lib/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { enUS } from 'date-fns/locale/en-US';
import useProposal from '@/hooks/use-proposal';

const formatRelativeLocale: Record<FormatRelativeToken, string> = {
	lastWeek: "'Last' eeee",
	yesterday: "'Yesterday'",
	today: "'Today'",
	tomorrow: "'Tomorrow'",
	nextWeek: "'Next' eeee",
	other: 'MMM dd',
};

export const MyProposals = () => {
	const { data: proposals } = useSuspenseQuery(
		getProposalsQuery({
			userFilters: ['6fecc24c-9c51-44b8-a45c-739e255dd586'],
		})
	);
	const { halfSize, toggleHalfSize } = useWidget({ widgetName: 'my-proposals' });

	return (
		<Card
			className='hover:border-black/25 transition flex flex-col h-full'
			style={{ gridColumn: halfSize ? 'span 1' : 'span 2' }}
		>
			<CardHeader className='flex flex-row items-start justify-between gap-3'>
				<CardTitle className='text-xl'>My Proposals</CardTitle>

				<WidgetOptions
					halfSize={halfSize}
					toggleHalfSize={toggleHalfSize}
				/>
			</CardHeader>

			<CardContent className='p-0 min-h-96 h-full'>
				{proposals.map((proposal) => (
					<ProposalRow
						key={proposal.id}
						proposal={proposal}
					/>
				))}
			</CardContent>
		</Card>
	);
};

export const ProposalRow = ({ proposal: initialProposal }: { proposal: NestedProposal }) => {
	const { data: proposal, handleProposalUpdate } = useProposal({
		id: initialProposal.id,
		version: initialProposal.working_version ?? '',
		initialData: initialProposal,
	});

	return (
		<div className='flex items-center justify-between border-b hover:bg-muted px-3'>
			<Link
				to='/proposals/$id/$version'
				params={{ id: proposal.id.toString(), version: proposal.working_version ?? '' }}
				className='line-clamp-1'
			>
				{proposal.name}
			</Link>

			<Popover>
				<PopoverTrigger
					className={cn(
						'h-auto py-1.5 border-gray-600 text-muted-foreground',
						proposal.expiration_date
							? new Date(proposal.expiration_date) < new Date()
								? 'text-red-500 border-red-500 hover:border-red-500 hover:text-red-500'
								: 'text-green-500 border-green-500 hover:border-green-500 hover:text-green-500'
							: undefined
					)}
				>
					{proposal.expiration_date ? (
						<span className='whitespace-nowrap overflow-hidden text-ellipsis flex-[1_1_auto] text-base font-medium'>
							{proposal.expiration_date
								? formatRelative(new Date(proposal.expiration_date), new Date(), {
										locale: {
											...enUS,
											formatRelative: (token) => formatRelativeLocale[token],
										},
									})
								: 'No due date'}
						</span>
					) : (
						<div className='border border-dashed rounded-full size-6 grid place-items-center border-black ml-auto'>
							<CalendarDays className='size-3.5 text-muted-foreground' />
						</div>
					)}
					{/* <Button
						variant='ghost'
						size='sm'
						className={cn(
							'h-auto py-1.5 border-gray-600 text-muted-foreground',
							proposal.expiration_date
								? new Date(proposal.expiration_date) < new Date()
									? 'text-red-500 border-red-500 hover:border-red-500 hover:text-red-500'
									: 'text-green-500 border-green-500 hover:border-green-500 hover:text-green-500'
								: undefined
						)}
					>
						
					</Button> */}
				</PopoverTrigger>

				<PopoverContent
					className='p-0 w-fit'
					align='end'
				>
					<Calendar
						mode='single'
						selected={proposal.expiration_date ? new Date(proposal.expiration_date) : undefined}
						onSelect={(day) => {
							handleProposalUpdate({
								proposal: {
									expiration_date: day?.toISOString(),
								},
							});
						}}
					/>

					<Separator />

					<div className='flex justify-end p-1.5'>
						<Button
							variant='ghost'
							className='text-muted-foreground'
							onClick={() => {
								handleProposalUpdate({
									proposal: {
										expiration_date: null,
									},
								});
							}}
						>
							Clear
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};
