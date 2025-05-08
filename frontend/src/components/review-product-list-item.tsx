import { CornerDownRightIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getCurrencyString } from '@/utils/money';

type Props = { product: NestedProduct; className?: string };

const ReviewProductListItem = ({ product, className }: Props) => {
	const price = product.product_class === 'Bundle' ? product.calculated_price! : product.price!;

	return (
		<>
			<Separator key={product.unique_id} />

			<div
				key={product.unique_id}
				className={cn('flex flex-col sm:flex-row sm:items-start gap-6 justify-between pr-[10px]', className)}
			>
				<div>
					<div className='font-medium text-sm'>{product.description}</div>
					<div className='flex items-center w-full'>
						<div className='text-muted-foreground text-sm'>{getCurrencyString(price)} </div>
						<p className='sm:hidden text-right mx-2 text-muted-foreground'>/</p>
						<p className='sm:hidden text-sm text-muted-foreground text-right'>{product.quantity}</p>
						<p className='sm:hidden text-sm text-muted-foreground text-right ml-auto'>
							<span className='font-medium'>{getCurrencyString(price * product.quantity!)}</span>
						</p>
					</div>
				</div>

				<div className='hidden sm:grid gap-2 sm:grid-cols-[50px_125px]'>
					<p className='text-sm text-muted-foreground text-right'>{product.quantity}</p>
					<p className='text-sm text-muted-foreground text-right'>
						<span className='font-medium'>
							{getCurrencyString(price * product.quantity!)}
							{product.recurring_bill_cycle === 2 && '/mo'}
						</span>
					</p>
				</div>
			</div>

			{product.products &&
				product.products.length > 0 &&
				product.products.map((p) => (
					<div
						key={p.unique_id}
						className='flex items-center shrink pl-4'
					>
						<CornerDownRightIcon />

						<div
							className={cn(
								'flex flex-col sm:flex-row sm:items-start gap-2 justify-between bg-muted ml-4 p-2.5 rounded-md flex-1',
								className
							)}
						>
							<div className=''>
								<div className='font-medium text-sm'>{p.description}</div>
								<div className='flex items-center w-full'>
									<div className='text-muted-foreground text-sm'>{getCurrencyString(p.price!)} </div>
									<p className='sm:hidden text-right mx-2 text-muted-foreground'>/</p>
									<p className='sm:hidden text-sm text-muted-foreground text-right'>{p.quantity}</p>
									<p className='sm:hidden text-sm text-muted-foreground text-right ml-auto'>
										<span className='font-medium'>{getCurrencyString(p.price! * p.quantity!)}</span>
									</p>
								</div>
							</div>

							<div className='hidden sm:grid gap-2 sm:grid-cols-[50px_125px]'>
								<p className='text-sm text-muted-foreground text-right'>{p.quantity}</p>
								<p className='text-sm text-muted-foreground text-right'>
									<span className='font-medium'>
										{getCurrencyString(p.price! * p.quantity!)}
										{p.recurring_bill_cycle === 2 && '/mo'}
									</span>
								</p>
							</div>
						</div>
					</div>
				))}
		</>
	);
};

export default ReviewProductListItem;
