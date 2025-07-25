import React, { useState } from 'react';
import { TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
	product: NestedProduct;
	handleProductDeletion: (id: string) => void;
}

const ProductColumnActions = ({ product, handleProductDeletion }: Props) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				variant='ghost'
				size='icon'
				asChild
			>
				{/* <Link to={`products/${product.unique_id}`}>
                    <span className="sr-only">Open menu</span>
                    <Pencil />
                </Link> */}
			</Button>
			<AlertDialog
				open={open}
				onOpenChange={setOpen}
			>
				<AlertDialogTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
					>
						<span className='sr-only'>Delete iem</span>
						<TrashIcon />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the product from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>

						<Button onClick={() => handleProductDeletion(product.unique_id)}>
							{/* {isPending && <RefreshCcw className='animate-spin mr-1.5' />} */}
							<span>Continue</span>
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default ProductColumnActions;
