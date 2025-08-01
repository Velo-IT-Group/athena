import NumberFlow from '@number-flow/react';
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQueries,
} from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { formatDate, formatRelative } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import {
	BetweenHorizontalEnd,
	CalendarIcon,
	CalendarSync,
	ChartBarIncreasing,
	ChevronDown,
	CircleDollarSign,
	Copy,
	DollarSign,
	LetterText,
	Loader2,
	PenLine,
	Trash,
	Undo2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type Stripe from 'stripe';
import AppRecordShell from '@/components/app-record-shell';
import CurrencyInput from '@/components/currency-input';
import LabeledInput from '@/components/labeled-input';

import { ListSelector } from '@/components/list-selector';
import { formatRelativeLocale } from '@/components/overview-right';
import { ProposalActions } from '@/components/proposal-actions';
import type { RecordDetailProps } from '@/components/record-detail';
import TabsList from '@/components/tabs-list';
import Tiptap from '@/components/tip-tap';
import { ColoredBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
// import { proposalStatuses } from '@/routes/_authed/proposals/$id/$version/settings';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Editable,
	EditableArea,
	EditableInput,
	EditablePreview,
} from '@/components/ui/editable';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { linksConfig } from '@/config/links';
import useProposal from '@/hooks/use-proposal';
import { useProposals } from '@/hooks/use-proposals';
import useServiceTicket from '@/hooks/use-service-ticket';
import {
	getProposalQuery,
	getProposalSettingsQuery,
	getProposalTotalsQuery,
	getVersionsQuery,
} from '@/lib/supabase/api';
import { createVersion } from '@/lib/supabase/create';
import { cn } from '@/lib/utils';
import { getCurrencyString } from '@/utils/money';

export const Route = createFileRoute('/_authed/proposals/$id/$version')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id, version } = Route.useParams();

	const [
		{ data: initialData },
		{ data: versions },
		{ data: totals },
		{ data: proposalSettings },
	] = useSuspenseQueries({
		queries: [
			getProposalQuery(id, version),
			getVersionsQuery(id),
			getProposalTotalsQuery(id, version),
			getProposalSettingsQuery(id, version),
		],
	});

	const {
		data: proposal,
		handleProposalUpdate,
		handleProposalConversion,
	} = useProposal({ id, version, initialData });
	const { data: ticket } = useServiceTicket({
		id: proposal?.service_ticket ?? 0,
	});
	const { handleProposalDeletion } = useProposals({ initialData: [] });
	const navigate = Route.useNavigate();

	const [dialogContent, setDialogContent] = useState<
		| 'opportunity'
		| 'version'
		| 'revertVersion'
		| 'delete'
		| 'settings'
		| undefined
	>();

	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();

	const { mutate: handleNewVersion, isPending: isNewVersionPending } =
		useMutation({
			mutationFn: async () =>
				await createVersion({ data: proposal?.id ?? '' }),
			onSuccess: (newVersionId) => {
				setDialogContent(undefined);
				navigate({
					to: '/proposals/$id/$version',
					params: {
						id,
						version: newVersionId,
					},
				});
			},
		});

	// const selectedStatus = proposalStatuses.find(
	// 	(status) => status.value === proposal?.status
	// );

	const { proposalTabs } = linksConfig;

	const tabs = proposalTabs.map((t) => ({
		...t,
		params: { id },
		// badge: getBadgeCount(t.title),
	}));

	const details: RecordDetailProps[] = [
		{
			icon: DollarSign,
			title: 'Amount',
			value: getCurrencyString(totals.total_price ?? 0),
		},
		{
			icon: CalendarIcon,
			title: 'Due Date',
			value: (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='ghost'
							size='sm'
							className={cn(
								'h-auto py-1.5 border-gray-600 text-muted-foreground justify-start items-center gap-3 px-0',
								proposal?.expiration_date
									? new Date(proposal?.expiration_date) <
										new Date()
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

							<span className='whitespace-nowrap overflow-hidden text-ellipsis text-base font-medium'>
								{proposal?.expiration_date
									? formatDate(
											proposal.expiration_date,
											'MMM d, yyyy'
										)
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
							defaultMonth={
								proposal?.expiration_date
									? new Date(proposal?.expiration_date)
									: undefined
							}
							selected={
								proposal?.expiration_date
									? new Date(proposal?.expiration_date)
									: undefined
							}
							// onSelect={(date) =>
							// 	handleProposalUpdate.mutate({
							// 		proposal: {
							// 			expiration_date: date?.toISOString(),
							// 		},
							// 	})
							// }
						/>
					</PopoverContent>
				</Popover>
			),
		},
		{
			icon: LetterText,
			title: 'Description',
			value: (
				<Tiptap
					content={proposalSettings.description}
					editable={false}
					className='p-0'
				/>
				// <div className='truncate'>{proposalSettings.description}</div>
			),
		},
	];

	return (
		<AppRecordShell
			details={details}
			tabs={tabs}
			editable={{
				defaultValue: proposal?.name,
				onSubmit: (name) =>
					handleProposalUpdate.mutate({
						proposal: {
							name,
						},
					}),
			}}
		>
			<div className='overflow-hidden'>
				<Outlet />
			</div>
		</AppRecordShell>
	);
}
