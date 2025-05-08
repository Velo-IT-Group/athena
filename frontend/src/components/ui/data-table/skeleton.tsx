import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCcw, Settings2 } from 'lucide-react';

type Props = {
	columns: number;
	rows?: number;
};

const TableSkeleton = ({ columns, rows = 25 }: Props) => {
	const blankColumns = new Array(columns).fill(null);
	const blankRows = new Array(rows).fill(null);

	return (
		<section className='space-y-3 p-[4px] overflow-visible'>
			<div className='flex w-full items-start justify-between gap-2'>
				<div className='flex md:flex-wrap gap-2 w-full flex-1'>
					<Button
						variant='outline'
						className='h-7'
						disabled
					>
						<Filter className='size-4' />
						<span>Filter</span>
					</Button>
				</div>
			</div>

			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							{blankColumns.map((_, index) => {
								return (
									<TableHead key={index}>
										<div className='h-9 flex items-center'>
											<Skeleton className='h-5 w-1/2' />
										</div>
									</TableHead>
								);
							})}
						</TableRow>
					</TableHeader>

					<TableBody className='overflow-x-auto'>
						{blankRows.map((_, index) => (
							<TableRow key={index}>
								{blankColumns.map((_, index) => (
									<TableCell key={index}>
										<div className='h-9 flex items-center'>
											<Skeleton className='h-5 w-3/4' />
										</div>
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</section>
	);
};

export default TableSkeleton;
