import { getDocuments } from '@/lib/manage/read';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

type Props = {
	id: number;
};

const TicketDocuments = ({ id }: Props) => {
	const { data: documents } = useSuspenseQuery({
		queryKey: ['tickets', id, 'documents'],
		queryFn: () => getDocuments('Ticket', id),
	});

	return (
		<section>
			<div className='flex items-center justify-between gap-3'>
				<h4>Attachments</h4>
			</div>

			{documents.map((document) => (
				<Link
					key={document.id}
					href={document.fileName ?? '#'}
				>
					{document.title}
				</Link>
			))}

			{/* <Suspense fallback={<Skeleton className='w-full h-9' />}>
                    <ConfigurationsList
                        id={ticket.id}
                        type='combobox'
                        defaultValue={configurations}
                    />
                </Suspense> */}
		</section>
	);
};

export default TicketDocuments;
