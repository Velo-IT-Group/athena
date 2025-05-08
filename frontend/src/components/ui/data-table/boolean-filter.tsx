'use client';
import type { KeyValue } from '@/utils/manage/params';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
// import { usePathname, useSearchParams, useRouter } from '@tanstack/react-router'

interface DataTableFacetedFilterProps<TData> {
	accessoryKey: keyof TData;
	title: string;
	defaultValue: boolean;
	setCondition: (condition: KeyValue) => void;
	removeCondition: (keyToRemove: string) => void;
}

const BooleanFilter = <TData,>({ accessoryKey, title, defaultValue }: DataTableFacetedFilterProps<TData>) => {
	// const pathname = usePathname()
	// const { push } = useRouter()
	// const params = useSearchParams()
	const searchParams = new URLSearchParams();

	return (
		<div className='flex items-center gap-1.5'>
			<Label className='text-nowrap'>{title}</Label>

			<Switch
				defaultChecked={defaultValue}
				onCheckedChange={(isChecked) => {
					if (!!!isChecked) {
						// removeCondition(accessoryKey as string)
						searchParams.delete(accessoryKey as string);
					} else {
						searchParams.set(accessoryKey as string, String(isChecked));
						// setCondition({ [accessoryKey]: defaultValue })
					}
					// push(pathname + '?' + searchParams.toString())
				}}
			/>
		</div>
	);
};

export default BooleanFilter;
