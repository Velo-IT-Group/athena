import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getProjects } from '@/lib/manage/read';
import { Box } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getCompanyProjectsQuery } from '@/lib/manage/api';

type Props = {
	companyId: number;
};

const OpenProjects = ({ companyId }: Props) => {
	const {
		data: { data: projects },
	} = useSuspenseQuery(getCompanyProjectsQuery(companyId));

	return (
		<Card className='flex flex-col'>
			<CardHeader>
				<CardTitle>
					<Box className='inline-block mr-1.5' /> Open Projects
				</CardTitle>
			</CardHeader>

			<CardContent className='space-y-[2ch]'>
				{projects.length ? (
					projects.map((project) => (
						<div
							key={project.id}
							className='flex items-center'
						>
							<div className='space-y-1'>
								<p className='text-sm font-medium leading-none line-clamp-1'>{project.name}</p>
								<p className='text-sm text-muted-foreground'>{project.status?.name}</p>
							</div>

							<Progress
								value={(project?.percentComplete ?? 0) * 100}
								className='ml-auto w-full max-w-24'
							/>
						</div>
					))
				) : (
					<div className='grid place-items-center gap-[1ch] text-lg font-medium text-muted-foreground p-[1ch]'>
						<Box className='size-9' />
						<p>No Open Projects</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default OpenProjects;
