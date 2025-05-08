import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getProposals } from '@/lib/supabase/read';
import { Building, FileText } from 'lucide-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';
import { relativeDate } from '@/utils/date';

export const Route = createFileRoute('/_authed/companies/$id/proposals')({
	component: RouteComponent,
	loader: async ({ params }) => {
		const proposals = await getProposals({ data: { companyFilters: [params.id] } });
		return proposals;
	},
});

function RouteComponent() {
	const proposals = Route.useLoaderData();

	return (
		<section className='grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full'>
			{proposals?.length ? (
				proposals.map((proposal) => (
					<Card
						key={proposal.id}
						className='flex flex-col'
					>
						<CardHeader className='grid grid-cols-[1fr_110px] items-start gap-4 space-y-0'>
							<div className='space-y-1'>
								<CardTitle className='text-base'>{proposal.name}</CardTitle>
							</div>
							<div className='flex items-center space-x-1 rounded-md bg-secondary text-secondary-foreground brightness-105'>
								<Button
									variant='secondary'
									className='px-3 shadow-none brightness-105'
									asChild
								>
									<Link
										to='/proposals/$id/$version'
										params={{
											id: proposal.id,
											version: proposal.working_version ?? '',
										}}
									>
										<Pencil className='mr-1.5' />
										Edit
									</Link>
								</Button>

								<Separator
									orientation='vertical'
									className='h-[20px]'
								/>

								{/* <ProposalOptions
									proposal={proposal}
									orgId={orgId}
								/> */}
							</div>
						</CardHeader>

						<CardContent>
							<div className='flex items-center gap-1.5'>
								<Building />

								<p className='text-sm text-muted-foreground'>{proposal.company_name}</p>
							</div>
						</CardContent>

						<CardFooter className='flex w-full flex-row items-center justify-between space-x-4 text-sm text-muted-foreground'>
							{/* <Suspense fallback={<Skeleton className='h-5 w-40' />}>
								<ProposalCardStatus ticketId={proposal.service_ticket} />
							</Suspense> */}

							<div className='flex animate-in items-center truncate text-xs text-muted-foreground capitalize fade-in'>
								Updated {relativeDate(new Date(proposal.updated_at))}
							</div>
						</CardFooter>
					</Card>
				))
			) : (
				<div className='flex flex-1 grow flex-col items-center justify-center space-y-2 md:col-span-2 lg:col-span-3 mt-6'>
					<FileText className='size-9' />

					<h2 className='text-lg font-semibold'>No proposals have been created.</h2>
				</div>
			)}
		</section>
	);
}
