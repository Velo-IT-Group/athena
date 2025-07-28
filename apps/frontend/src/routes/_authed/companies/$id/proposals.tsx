import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getProposals } from '@/lib/supabase/read';
import { Building, FileText } from 'lucide-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';
import { relativeDate } from '@/utils/date';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/table-columns/proposal';
import { getProposalsQuery } from '@/lib/supabase/api';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/companies/$id/proposals')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<DataTable
			columns={columns}
			options={getProposalsQuery({ companyFilters: [id] })}
		/>
	);
}
