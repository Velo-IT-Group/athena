import { useState } from 'react';

import {
	BetweenHorizontalEnd,
	CalendarIcon,
	CalendarSync,
	ChartBarIncreasing,
	CircleDollarSign,
	Copy,
	Loader2,
	PenLine,
	Trash,
	Undo2,
	ChevronDown,
	DollarSign,
	LetterText,
} from 'lucide-react';

import { formatDate, formatRelative } from 'date-fns';
import NumberFlow from '@number-flow/react';

import { createFileRoute, Outlet } from '@tanstack/react-router';
import TabsList from '@/components/tabs-list';
import { ProposalActions } from '@/components/proposal-actions';

import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { ColoredBadge } from '@/components/ui/badge';

import { ListSelector } from '@/components/list-selector';
import useProposal from '@/hooks/use-proposal';
import { cn, updateCacheItem } from '@/lib/utils';
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQueries,
} from '@tanstack/react-query';
import { proposalStatuses } from '@/routes/_authed/proposals/$id/$version/settings';
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
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { createVersion } from '@/lib/supabase/create';
import { useProposals } from '@/hooks/use-proposals';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { linksConfig } from '@/config/links';
import {
	getProposalQuery,
	getProposalSettingsQuery,
	getProposalTotalsQuery,
	getVersionsQuery,
} from '@/lib/supabase/api';
import LabeledInput from '@/components/labeled-input';
import { formatRelativeLocale } from '@/components/overview-right';
import CurrencyInput from '@/components/currency-input';
import { Calendar } from '@/components/ui/calendar';
import { enUS } from 'date-fns/locale/en-US';
import useServiceTicket from '@/hooks/use-service-ticket';
import { createClient } from '@/lib/stripe';
import Stripe from 'stripe';
import { toast } from 'sonner';
import AppRecordShell from '@/components/app-record-shell';
import { RecordDetailProps } from '@/components/record-detail';
import { getCurrencyString } from '@/utils/money';
import Tiptap from '@/components/tip-tap';

export const Route = createFileRoute('/_authed/proposals/$id/$version')({
	component: RouteComponent,
	beforeLoad: async ({ params }) => {
		const stripe = createClient();
		return {
			invoice: await stripe.invoices.retrieve(''),
		};
	},
});

function RouteComponent() {
	const { id, version } = Route.useParams();
	const { invoice } = Route.useRouteContext();

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

	const selectedStatus = proposalStatuses.find(
		(status) => status.value === proposal?.status
	);

	const { data } = useQuery({
		queryKey: ['invoices', 'in_1RlCQrI6Q4ne5nTqXIElgw2S'],
		queryFn: async () => {
			const stripe = createClient();
			return await stripe.invoices.retrieve(
				'in_1RlCQrI6Q4ne5nTqXIElgw2S'
			);
		},
		throwOnError(error, query) {
			console.error('Error fetching products:', error);
			throw error;
		},
		initialData: invoice,
	});

	const updateInvoice = useMutation({
		mutationFn: async (
			params?: Stripe.InvoiceUpdateParams,
			options?: Stripe.RequestOptions
		) => {
			const stripe = createClient();

			return await stripe.invoices.update(
				'in_1RlCQrI6Q4ne5nTqXIElgw2S',
				params,
				options
			);
		},
		onMutate(variables) {
			updateCacheItem(
				queryClient,
				['invoices', 'in_1RlCQrI6Q4ne5nTqXIElgw2S'],
				variables
			);
		},
		onError(error, variables, context) {
			toast.error('Error updating invoice ' + error.message);
		},
		// onMutate: (s, b, s) =>
	});

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
			value: getCurrencyString((invoice.total ?? 0) / 100),
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
								{invoice?.due_date
									? formatDate(
											invoice.due_date,
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
								invoice?.due_date
									? new Date(invoice?.due_date)
									: undefined
							}
							selected={
								invoice?.due_date
									? new Date(invoice?.due_date)
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
