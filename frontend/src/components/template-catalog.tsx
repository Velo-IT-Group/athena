import { useSuspenseQuery } from '@tanstack/react-query';

import { Plus } from 'lucide-react';

import { getTemplatesQuery } from '@/lib/manage/api';

import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const DAY_IN_MS = 86_400_000;

const TemplateCatalog = () => {
	const { data: templates } = useSuspenseQuery(getTemplatesQuery());

	return (
		<>
			{templates
				.sort((a, b) => a.name.localeCompare(b.name))
				?.map((template) => (
					<Card
						key={template.id}
						className='p-0.5 group'
					>
						<CardHeader className='flex flex-row items-center justify-between gap-1.5 h-9 py-1.5 pr-0 space-y-0'>
							<p className='text-sm tracking-tight line-clamp-1'>{template.name}</p>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='ghost'
										size='smIcon'
										className='opacity-0 group-hover:opacity-100 transition-opacity'
									>
										<Plus className='flex-shrink-0' />
									</Button>
								</TooltipTrigger>

								<TooltipContent>Add template</TooltipContent>
							</Tooltip>
						</CardHeader>
					</Card>
				))}
		</>
	);
};

export default TemplateCatalog;
