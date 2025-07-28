import { getCurrencyString } from '@/utils/money';

import ProductListItem from '@/components/review-product-list-item';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Props {
	title: string;
	products: NestedProduct[];
}

const ProductCard = ({ title, products }: Props) => {
	const nonRecurringProducts = products.filter((p) => !p.recurring_flag || p.recurring_bill_cycle !== 2);
	const recurringProducts = products.filter((p) => p.recurring_flag && p.recurring_bill_cycle === 2);
	const nonRecurringTotal = nonRecurringProducts.reduce((accumulator, currentValue) => {
		const price: number | null =
			currentValue.product_class === 'Bundle' ? currentValue.calculated_price : currentValue.price;

		return accumulator + (price ?? 0) * (currentValue?.quantity ?? 0);
	}, 0);
	const recurringTotal = recurringProducts.reduce((accumulator, currentValue) => {
		const price: number | null =
			currentValue.product_class === 'Bundle' ? currentValue.calculated_price : currentValue.price;

		return accumulator + (price ?? 0) * (currentValue?.quantity ?? 0);
	}, 0);

	const sortedProducts = products.sort((a, b) => {
		return a.order - b.order;
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>

			<CardContent className='space-y-2.5'>
				<div className='hidden sm:flex items-center gap-6 justify-between'>
					<div className='max-w-96'>
						<span className='text-sm text-muted-foreground'>Description / Unit Price</span>
					</div>
					<div className='grid gap-2 justify-items-end grid-cols-[100px_125px]'>
						<span className='text-sm text-muted-foreground'>Quantity</span>
						<span className='text-sm text-muted-foreground'>Extended Price</span>
					</div>
				</div>

				{sortedProducts.map((product) => (
					<ProductListItem
						key={product.id}
						product={product}
					/>
				))}
			</CardContent>

			<Separator className='mb-6' />

			<CardFooter className='grid gap-1.5'>
				{nonRecurringTotal > 0 && (
					<div className='flex items-center justify-between'>
						<p className='text-sm text-muted-foreground'>{title} Product Subtotal</p>
						<p className='text-sm text-muted-foreground text-right'>
							<span className='font-medium'>{getCurrencyString(nonRecurringTotal)}</span>
						</p>
					</div>
				)}

				{recurringTotal > 0 && (
					<div className='flex items-center justify-between'>
						<p className='text-sm text-muted-foreground'>{title} Recurring Subtotal</p>
						<p className='text-sm text-muted-foreground text-right'>
							<span className='font-medium'>
								{getCurrencyString(recurringTotal)}
								/mo
							</span>
						</p>
					</div>
				)}
			</CardFooter>
		</Card>
	);
};

export default ProductCard;
