import { getTicketDocumentsQuery } from '@/lib/manage/api';
import { useSuspenseQuery } from '@tanstack/react-query';

interface Props {
	id: number;
}

const TicketDocuments = ({ id }: Props) => {
	const { data: documents } = useSuspenseQuery(getTicketDocumentsQuery(id));

	return (
		<section>
			<div className='flex items-center justify-between gap-3'>
				<h4>Attachments</h4>
			</div>

			{documents.map((document) => (
				<a
					key={document.id}
					href={document.fileName ?? '#'}
					target='_blank'
				>
					{document.title}
				</a>
			))}
		</section>
	);
};

export default TicketDocuments;
