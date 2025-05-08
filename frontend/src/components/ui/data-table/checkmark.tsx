'use client';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
// import { useRouter } from 'next/navigation'
import type { Row } from '@tanstack/react-table';
import type { Contact } from '@/types/manage';

type Props = {
	row: Row<Contact>;
};

const CheckMark = ({ row }: Props) => {
	// const router = useRouter()

	return (
		<Button
			variant='ghost'
			size='sm'
			className='relative flex cursor-default select-none items-center'
			onClick={() => {
				row.toggleSelected(!!!row.getIsSelected());
				// router.push(
				//     `/?contactId=${row.original.id}&companyId=${row.original.company?.id}`
				// )
			}}
		>
			<span className='flex h-3.5 w-3.5'>{row.getIsSelected() ? <Check /> : <Plus />}</span>
		</Button>
	);
};

export default CheckMark;
