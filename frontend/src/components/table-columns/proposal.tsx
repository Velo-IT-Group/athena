import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { Badge, ColoredBadge } from '@/components/ui/badge';
import { Building, SearchIcon, User } from 'lucide-react';
import { proposalStatuses } from '@/routes/_authed/proposals/$id/$version/settings';
import Search from '@/components/search';

export const columns: ColumnDef<NestedProposal>[] = [
	{
		id: 'name',
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => {
			console.log(row.original);
			return (
				<Link
					to='/proposals/$id/$version'
					params={{
						id: row.original.id,
						version: row.original.working_version,
					}}
				>
					<h3 className='text-lg'>{row.getValue('name')}</h3>
					<p className='text-sm text-muted-foreground'>Joined</p>
				</Link>
			);
		},
	},
	{
		id: 'company',
		accessorKey: 'company',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Company'
			/>
		),
		cell: ({ row }) => (
			<ColoredBadge variant='gray'>
				<Building className='mr-1.5' />
				<span>{(row.getValue('company') as Record<string, any>)?.name}</span>
			</ColoredBadge>
		),
	},
	{
		id: 'contact',
		accessorKey: 'contact',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Contact'
			/>
		),
		cell: ({ row }) => (
			<Badge variant='outline'>
				<User className='' />
				<span>{(row.getValue('contact') as Record<string, any>)?.name}</span>
			</Badge>
		),
	},
	{
		id: 'status',
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Status'
			/>
		),
		cell: ({ row }) => {
			const selectedStatus = proposalStatuses.find((status) => status.value === row.getValue('status'));

			if (!selectedStatus) return null;

			return (
				<ColoredBadge variant={selectedStatus.color}>
					<selectedStatus.icon className='mr-1.5' />
					<span>{selectedStatus.label}</span>
				</ColoredBadge>
			);
		},
	},
	{
		id: 'expiration_date',
		accessorKey: 'expiration_date',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Expiration Date'
			/>
		),
		cell: ({ row }) => <span>{format(new Date(row.getValue('expiration_date')), 'MM/dd/yyyy')}</span>,
	},
	{
		id: 'fts',
		// accessorKey: 'fts',
		meta: {
			filterKey: 'fts',
			type: 'text',
			displayName: 'Search',
			icon: SearchIcon,
		},
	},
];
