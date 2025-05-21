import { ColoredBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { enUS } from 'date-fns/locale/en-US';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { proposalStatuses } from '@/routes/_authed/proposals/$id/$version/settings';
import { formatRelative, type FormatRelativeToken } from 'date-fns';
import { CalendarIcon, Ellipsis } from 'lucide-react';
import LabeledInput from '@/components/labeled-input';
import { getCurrencyString } from '@/utils/money';

export const formatRelativeLocale: Record<FormatRelativeToken, string> = {
	lastWeek: "'Last' eeee",
	yesterday: "'Yesterday'",
	today: "'Today'",
	tomorrow: "'Tomorrow'",
	nextWeek: "'Next' eeee",
	other: 'MMM dd',
};

export default function OverviewRight({
	proposal,
	onProposalUpdate,
}: {
	proposal: Proposal;
	onProposalUpdate: (proposal: ProposalUpdate) => void;
}) {
	const currentStatus = proposalStatuses.find((status) => status.value === proposal.status);

	return (
		<div className='bg-muted/50 min-w-[398px] border-l flex-[0_0_398px]'>
			<div className='space-y-9 p-6 w-full'>
				<div>
					<div
						className='ProjectOverviewActivityFeedPublishedReportSection-heading'
						style={{
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '12px',
							display: 'flex',
						}}
					>
						<h4
							className='TypographyPresentation TypographyPresentation--colorDarkGray1 TypographyPresentation--h4 TypographyPresentation--fontWeightMedium TypographyPresentation--wrapStylePretty HighlightSol HighlightSol--buildingBlock HighlightSol--core'
							style={{
								border: '0px',
								padding: '0px',
								verticalAlign: 'baseline',
								margin: '0px',
								fontFamily:
									'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
								color: '#6d6e6f',
								fontWeight: 500,
								textWrap: 'pretty',
								fontSize: '20px',
								lineHeight: '28px',
							}}
						>
							Overview
						</h4>
					</div>

					<div className='flex items-center gap-1.5'>
						<LabeledInput label='Status'>
							<ColoredBadge variant={currentStatus?.color}>
								{currentStatus && currentStatus.icon && <currentStatus.icon />}
								<span>{currentStatus?.label}</span>
							</ColoredBadge>
						</LabeledInput>
					</div>
				</div>

				<LabeledInput label='Expiration Date'>
					<div>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='ghost'
									size='sm'
									className={cn(
										'-ml-3 h-auto py-1.5 border-gray-600 text-muted-foreground',
										proposal.expiration_date
											? new Date(proposal.expiration_date) < new Date()
												? 'text-red-500 border-red-500 hover:border-red-500 hover:text-red-500'
												: 'text-green-500 border-green-500 hover:border-green-500 hover:text-green-500'
											: undefined
									)}
								>
									<div
										className={cn(
											'size-7 border border-dashed border-inherit rounded-full inline-flex items-center justify-center'
										)}
										style={{
											// border: '1px dashed #6d6e6f',
											width: '28px',
											height: '28px',
										}}
									>
										<CalendarIcon className='size-5' />
									</div>

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
								</Button>
							</PopoverTrigger>

							<PopoverContent
								className='p-0 w-fit'
								align='start'
							>
								<Calendar
									mode='single'
									selected={proposal.expiration_date ? new Date(proposal.expiration_date) : undefined}
									defaultMonth={
										proposal.expiration_date ? new Date(proposal.expiration_date) : undefined
									}
									onSelect={(day) => {
										onProposalUpdate({
											expiration_date: day?.toISOString(),
										});
									}}
								/>

								<Separator />

								<div className='flex justify-end p-1.5'>
									<Button
										variant='ghost'
										className='text-muted-foreground'
										onClick={() => {
											onProposalUpdate({
												expiration_date: null,
											});
										}}
									>
										Clear
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</LabeledInput>

				<LabeledInput label='Total Amount'>
					<p className='text-lg font-semibold text-muted-foreground'>{getCurrencyString(0)}</p>
				</LabeledInput>

				<LabeledInput label='Labor Hours'>
					<p className='text-lg font-semibold text-muted-foreground'>{getCurrencyString(0)}</p>
				</LabeledInput>
			</div>
		</div>
	);
}
