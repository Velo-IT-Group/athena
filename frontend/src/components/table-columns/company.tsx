'use client';

import type { ColumnDef } from '@tanstack/react-table';

import type { Company, ReferenceType } from '@/types/manage';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@tanstack/react-router';
// import parsePhoneNumber from 'libphonenumber-js'

// 'id', 'identifier', 'name', 'phoneNumber', 'territory'

export const columns: ColumnDef<Company>[] = [
	{
		accessorKey: 'identifier',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Company'
			/>
		),
		cell: ({ row }) => (
			<Tooltip>
				<TooltipTrigger asChild>
					<Link
						to='/companies/$id'
						params={{ id: row.original.id.toString() }}
						className={buttonVariants({
							variant: 'link',
							className: 'w-[80px] font-medium justify-start',
						})}
						style={{ paddingInline: '0px' }}
					>
						{row.getValue('identifier')}
					</Link>
				</TooltipTrigger>
				{/* <CompanyTooltipDetail
					name={row.original.name}
					phoneNumber={row.original.phoneNumber}
				/> */}
			</Tooltip>
			// <Link
			// 	href={`/tickets/${row.getValue('identifier')}`}
			// 	className={cn(buttonVariants({ variant: 'link' }), 'w-[80px]')}
			// >
			// 	{row.getValue('identifier')}
			// </Link>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Name'
			/>
		),
		cell: ({ row }) => {
			// const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className='flex items-center space-x-1.5'>
					<Link
						to='/companies/$id'
						params={{ id: row.original.id.toString() }}
						className='font-medium'
					>
						{row.getValue('name')}
					</Link>
					{/* {label && <Badge variant='outline'>{label.label}</Badge>} */}
					{/* <Circle className={cn('stroke-none fill-primary', row?.original?.priority?.id === 7 && 'fill-green-500')} /> */}
					{/* <span className="max-w-[500px] truncate font-medium">
                        {row.getValue('name')}
                    </span> */}
				</div>
			);
		},
	},
	// {
	//   accessorKey: "phoneNumber",
	//   header: ({ column }) => (
	//     <DataTableColumnHeader column={column} title="Phone Number" />
	//   ),
	//   cell: ({ row }) => {
	//     const number = row.getValue("phoneNumber")parsePhoneNumber(row.getValue("phoneNumber"), "US");

	//     return (
	//       <span className={cn(buttonVariants({ variant: "link" }), "px-0")}>
	//         {number.formattedNumber}
	//       </span>
	//     );
	//   },
	// },
	{
		accessorKey: 'territory',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Territory'
			/>
		),
		cell: ({ row }) => {
			const territory = row.getValue('territory') as ReferenceType;

			return <span>{territory.name}</span>;
		},
	},
	// {
	// 	id: 'actions',
	// 	cell: ({ row }) => <DataTableRowActions row={row} />,
	// },
];
