import { columns } from '@/components/table-columns/company';
import { DataTable } from '@/components/ui/data-table';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import Widget from '@/components/widget';
import { getCompaniesQuery } from '@/lib/manage/api';
import { createFileRoute } from '@tanstack/react-router';
import { CalendarPlus, Handshake } from 'lucide-react';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/companies/')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className='p-3 space-y-1.5'>
			<section>
				<h1 className='text-2xl font-semibold'>Companies</h1>
			</section>

			<section className='p-6'>
				<div className='grid grid-cols-3 gap-2'>
					<Widget
						title='Connection strength'
						icon={Handshake}
					>
						<p className='text-sm text-muted-foreground font-medium tracking-tight'>
							No connection
						</p>
					</Widget>

					<Widget
						title='Next calendar interaction'
						icon={CalendarPlus}
					>
						<p className='text-sm text-muted-foreground font-medium tracking-tight'>
							No interaction
						</p>
					</Widget>

					<Widget
						title='Team'
						icon={CalendarPlus}
					>
						<div className='flex items-center gap-1'>
							<span className='h-5 py-0.5 px-1.5 rounded-lg'>
								Testing
							</span>
						</div>
						{/* <p className='text-sm text-muted-foreground font-medium tracking-tight'>
							No interaction
						</p> */}
					</Widget>
				</div>
			</section>

			<Suspense
				fallback={
					<TableSkeleton
						columns={columns.length}
						rows={10}
					/>
				}
			>
				<DataTable
					options={getCompaniesQuery()}
					columns={columns}
				/>
			</Suspense>
		</main>
	);
}
