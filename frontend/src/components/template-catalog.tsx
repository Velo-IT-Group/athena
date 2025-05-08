import { getTemplates } from '@/lib/manage/read';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Skeleton } from './ui/skeleton';
import { ProjectTemplate } from '@/types/manage';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { GripVertical } from 'lucide-react';

export const DAY_IN_MS = 86_400_000;

const TemplateCatalog = () => {
	const { data: templates } = useSuspenseQuery({
		queryKey: ['templates'],
		queryFn: getTemplates,
		staleTime: Infinity,
		networkMode: 'offlineFirst',
	});

	return (
		<>
			{templates?.map((template) => (
				<TemplateItem
					key={template.id}
					template={template}
				/>
			))}
		</>
	);
};

type Props = {
	template: ProjectTemplate;
};

const TemplateItem = ({ template }: Props) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: template.id,
		attributes: {
			role: 'template',
			roleDescription: 'Project Template',
		},
		data: template,
	});
	const style = {
		transform: CSS.Translate.toString(transform),
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className='p-0.5'
		>
			<CardHeader className='flex flex-row items-center gap-1.5 p-0 space-y-0 justify-start'>
				<Button
					variant='ghost'
					size='icon'
					{...listeners}
					{...attributes}
				>
					<GripVertical className='w-4 h-4 flex-shrink-0' />
				</Button>

				<p className='text-sm tracking-tight line-clamp-1'>{template.name}</p>
			</CardHeader>
		</Card>
	);
};

export default TemplateCatalog;
